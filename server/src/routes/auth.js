const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, query } = require("../config/db");
const { authenticate, JWT_SECRET } = require("../middleware/auth");
const { ensureProfileSchema } = require("../services/profile-schema");
const { ensureMatchingSchema } = require("../services/matching-schema");
const { sanitizeSkillNames } = require("../services/job-matching");
const { getPlatformSettings } = require("../services/platform-settings");
const {
  CODE_TTL_MINUTES,
  RESEND_COOLDOWN_SECONDS,
  MAX_VERIFICATION_ATTEMPTS,
  ensureEmailVerificationSchema,
  generateVerificationCode,
  hashVerificationCode,
  matchesVerificationCode,
  sendVerificationEmail,
} = require("../services/email-verification");

const router = express.Router();
const registrationEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification emails requested. Please try again later." },
});
const registrationVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please try again later." },
});

router.get("/config", async (_req, res, next) => {
  try {
    const settings = await getPlatformSettings();
    res.json({
      general: settings.general,
      features: settings.features,
      security: settings.security,
      ai: {
        jobRecommendationsEnabled: settings.ai.jobRecommendationsEnabled,
        contentModerationEnabled: settings.ai.contentModerationEnabled,
        coverLetterTone: settings.ai.coverLetterTone,
      },
    });
  } catch (error) { next(error); }
});

function profileResponse(row) {
  if (!row) return null;
  let careerInterests = row.career_interests;
  if (typeof careerInterests === "string") {
    try { careerInterests = JSON.parse(careerInterests); } catch { careerInterests = []; }
  }
  return {
    ...row,
    career_interests: Array.isArray(careerInterests) ? careerInterests : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    graduation_year: row.graduation_year == null ? null : Number(row.graduation_year),
    readiness_score: Number(row.readiness_score || 0),
    profile_completion: Number(row.profile_completion || 0),
  };
}

async function profileWithSkills(row) {
  if (!row?.id || row.role !== "student") return profileResponse(row);
  const skills = await query(
    `SELECT s.name, us.score, us.source
     FROM user_skills us JOIN skills s ON s.id=us.skill_id
     WHERE us.user_id=? ORDER BY s.name`,
    [row.id],
  );
  return profileResponse({ ...row, skills });
}

async function syncProfileSkills(connection, userId, profileSkills) {
  const selectedNames = new Set(profileSkills.map((skill) => skill.toLowerCase()));
  const [existingRows] = await connection.execute(
    `SELECT us.skill_id, s.name
     FROM user_skills us JOIN skills s ON s.id=us.skill_id
     WHERE us.user_id=? AND us.source='profile'`,
    [userId],
  );

  for (const skill of profileSkills) {
    await connection.execute(
      "INSERT INTO skills (name, category) VALUES (?, 'CareerForge skills') ON DUPLICATE KEY UPDATE name=VALUES(name)",
      [skill],
    );
    const [skillRows] = await connection.execute("SELECT id FROM skills WHERE name=? LIMIT 1", [skill]);
    await connection.execute(
      `INSERT INTO user_skills (user_id, skill_id, score, source)
       VALUES (?, ?, 50, 'profile')
       ON DUPLICATE KEY UPDATE
        score=IF(source='profile', VALUES(score), score),
        source=IF(source='profile', 'profile', source)`,
      [userId, skillRows[0].id],
    );
  }

  for (const existing of existingRows) {
    if (!selectedNames.has(String(existing.name).toLowerCase())) {
      await connection.execute(
        "DELETE FROM user_skills WHERE user_id=? AND skill_id=? AND source='profile'",
        [userId, existing.skill_id],
      );
    }
  }
}

router.post("/register", registrationEmailLimiter, async (req, res, next) => {
  try {
    const settings = await getPlatformSettings();
    if (!settings.features.registrationEnabled) {
      return res.status(403).json({ error: "New student registration is currently disabled" });
    }
    const name = String(req.body.name || "");
    const email = String(req.body.email || "");
    const password = String(req.body.password || "");
    const university = String(req.body.university || "");
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ error: "Enter a valid email address" });
    if (name.trim().length < 2 || name.trim().length > 120) return res.status(400).json({ error: "Name must contain between 2 and 120 characters" });
    if (password.length < settings.security.minimumPasswordLength) {
      return res.status(400).json({ error: `Password must contain at least ${settings.security.minimumPasswordLength} characters` });
    }
    if (settings.security.requireUppercase && !/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain an uppercase letter" });
    }
    if (settings.security.requireNumber && !/\d/.test(password)) {
      return res.status(400).json({ error: "Password must contain a number" });
    }
    await ensureEmailVerificationSchema();
    await query(
      "DELETE FROM pending_student_registrations WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY)",
    );
    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (existing.length) return res.status(409).json({ error: "An account already exists for this email" });
    const [pending] = await query(
      `SELECT GREATEST(0, ${RESEND_COOLDOWN_SECONDS} - TIMESTAMPDIFF(SECOND, sent_at, NOW())) AS retry_after
       FROM pending_student_registrations WHERE email=? LIMIT 1`,
      [normalizedEmail],
    );
    const retryAfter = Number(pending?.retry_after || 0);
    if (retryAfter > 0) {
      return res.status(429).json({
        error: `Please wait ${retryAfter} seconds before requesting another code.`,
        retryAfterSeconds: retryAfter,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(normalizedEmail, code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
    const safeUniversity = String(university || "").trim().slice(0, 190) || null;

    await query(
      `INSERT INTO pending_student_registrations
         (email, name, password_hash, university, code_hash, expires_at, attempt_count, sent_at, send_count)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), 1)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), password_hash=VALUES(password_hash), university=VALUES(university),
         code_hash=VALUES(code_hash), expires_at=VALUES(expires_at), attempt_count=0,
         sent_at=NOW(), send_count=send_count+1`,
      [normalizedEmail, name.trim(), passwordHash, safeUniversity, codeHash, expiresAt],
    );

    try {
      await sendVerificationEmail({ email: normalizedEmail, name: name.trim(), code });
    } catch (error) {
      await query(
        "DELETE FROM pending_student_registrations WHERE email=? AND code_hash=?",
        [normalizedEmail, codeHash],
      ).catch(() => {});
      throw error;
    }

    res.status(202).json({
      message: "We sent a 6-digit verification code to your email.",
      verificationRequired: true,
      email: normalizedEmail,
      expiresInSeconds: CODE_TTL_MINUTES * 60,
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) { next(error); }
});

router.post("/register/resend", registrationEmailLimiter, async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    await ensureEmailVerificationSchema();
    const [pending] = await query(
      `SELECT name,
              GREATEST(0, ${RESEND_COOLDOWN_SECONDS} - TIMESTAMPDIFF(SECOND, sent_at, NOW())) AS retry_after
       FROM pending_student_registrations WHERE email=? LIMIT 1`,
      [normalizedEmail],
    );
    if (!pending) {
      return res.status(404).json({ error: "No pending registration was found. Start the signup again." });
    }
    const retryAfter = Number(pending.retry_after || 0);
    if (retryAfter > 0) {
      return res.status(429).json({
        error: `Please wait ${retryAfter} seconds before requesting another code.`,
        retryAfterSeconds: retryAfter,
      });
    }

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(normalizedEmail, code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
    await query(
      `UPDATE pending_student_registrations
       SET code_hash=?, expires_at=?, attempt_count=0, sent_at=NOW(), send_count=send_count+1
       WHERE email=?`,
      [codeHash, expiresAt, normalizedEmail],
    );

    try {
      await sendVerificationEmail({ email: normalizedEmail, name: pending.name, code });
    } catch (error) {
      await query(
        "UPDATE pending_student_registrations SET expires_at=NOW() WHERE email=? AND code_hash=?",
        [normalizedEmail, codeHash],
      ).catch(() => {});
      throw error;
    }

    res.json({
      message: "A new verification code was sent.",
      expiresInSeconds: CODE_TTL_MINUTES * 60,
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) { next(error); }
});

router.post("/register/verify", registrationVerifyLimiter, async (req, res, next) => {
  let connection;
  try {
    const settings = await getPlatformSettings();
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Enter the 6-digit verification code from your email." });
    }
    await ensureEmailVerificationSchema();
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [pendingRows] = await connection.execute(
      `SELECT email, name, password_hash, university, code_hash, expires_at,
              attempt_count, expires_at <= NOW() AS expired
       FROM pending_student_registrations WHERE email=? LIMIT 1 FOR UPDATE`,
      [normalizedEmail],
    );
    const pending = pendingRows[0];
    if (!pending) {
      await connection.rollback();
      return res.status(404).json({ error: "No pending registration was found. Start the signup again." });
    }
    if (Boolean(pending.expired)) {
      await connection.execute("DELETE FROM pending_student_registrations WHERE email=?", [normalizedEmail]);
      await connection.commit();
      return res.status(410).json({ error: "This verification code has expired. Start the signup again." });
    }

    const nextAttemptCount = Number(pending.attempt_count || 0) + 1;
    if (!matchesVerificationCode(normalizedEmail, code, pending.code_hash)) {
      if (nextAttemptCount >= MAX_VERIFICATION_ATTEMPTS) {
        await connection.execute("DELETE FROM pending_student_registrations WHERE email=?", [normalizedEmail]);
        await connection.commit();
        return res.status(429).json({ error: "Too many incorrect codes. Start the signup again." });
      }
      await connection.execute(
        "UPDATE pending_student_registrations SET attempt_count=? WHERE email=?",
        [nextAttemptCount, normalizedEmail],
      );
      await connection.commit();
      return res.status(400).json({
        error: "That verification code is incorrect.",
        attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - nextAttemptCount,
      });
    }

    const [existingRows] = await connection.execute(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [normalizedEmail],
    );
    if (existingRows.length) {
      await connection.execute("DELETE FROM pending_student_registrations WHERE email=?", [normalizedEmail]);
      await connection.commit();
      return res.status(409).json({ error: "An account already exists for this email" });
    }

    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'student', 'active')",
      [pending.name, normalizedEmail, pending.password_hash],
    );
    await connection.execute(
      "INSERT INTO student_profiles (user_id, university, readiness_score) VALUES (?, ?, 0)",
      [result.insertId, pending.university || null],
    );
    await connection.execute("DELETE FROM pending_student_registrations WHERE email=?", [normalizedEmail]);
    await connection.commit();

    const user = { id: result.insertId, name: pending.name, email: normalizedEmail, role: "student" };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: `${settings.security.sessionHours}h` });
    res.status(201).json({
      message: "Email verified. Your CareerForge account is ready.",
      token,
      user,
    });
  } catch (error) {
    try { await connection?.rollback(); } catch {}
    next(error);
  } finally {
    connection?.release();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const settings = await getPlatformSettings();
    const { email, password, role } = req.body;
    const rows = await query("SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1", [(email || "").toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) return res.status(401).json({ error: "Incorrect email or password" });
    if (user.status !== "active") return res.status(403).json({ error: "This account is not active" });
    if (role && user.role !== role) return res.status(403).json({ error: `Use the ${user.role} sign-in page for this account` });
    if (user.role === "student" && settings.features.maintenanceMode) {
      return res.status(503).json({ error: "CareerForge student services are temporarily under maintenance" });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: `${settings.security.sessionHours}h` },
    );
    await query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    await Promise.all([ensureProfileSchema(), ensureMatchingSchema()]);
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, p.university, p.degree, p.graduation_year,
              p.target_role, p.career_interests, p.location, p.phone, p.bio, p.readiness_score,
              p.profile_completion, p.avatar_url, p.avatar_data, p.updated_at
       FROM users u LEFT JOIN student_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [req.user.id],
    );
    res.json(await profileWithSkills(rows[0]));
  } catch (error) { next(error); }
});

router.patch("/me", authenticate, async (req, res, next) => {
  let connection;
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student account required" });
    }
    await Promise.all([ensureProfileSchema(), ensureMatchingSchema()]);
    connection = await pool.getConnection();

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const nullableText = (value, maxLength) => {
      const cleaned = String(value || "").trim();
      return cleaned ? cleaned.slice(0, maxLength) : null;
    };
    const university = nullableText(req.body.university, 190);
    const degree = nullableText(req.body.degree, 190);
    const targetRole = nullableText(req.body.target_role, 140);
    const location = nullableText(req.body.location, 140);
    const careerInterests = Array.isArray(req.body.career_interests)
      ? [...new Set(req.body.career_interests
        .map((value) => String(value || "").trim().replace(/\s+/g, " ").slice(0, 60))
        .filter((value) => value.length >= 2))]
        .slice(0, 8)
      : [];
    const profileSkills = sanitizeSkillNames(req.body.skills, 20);
    const graduationValue = String(req.body.graduation_year ?? "").trim();
    const graduationYear = graduationValue ? Number(graduationValue) : null;
    const avatarProvided = Object.prototype.hasOwnProperty.call(req.body, "avatar_data");
    const avatarValue = avatarProvided && req.body.avatar_data != null
      ? String(req.body.avatar_data).trim()
      : null;
    const avatarData = avatarValue || null;

    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: "Name must contain between 2 and 120 characters" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (graduationYear != null && (!Number.isInteger(graduationYear) || graduationYear < 1950 || graduationYear > new Date().getFullYear() + 10)) {
      return res.status(400).json({ error: "Enter a valid graduation year" });
    }
    if (!university || !degree || !graduationYear || !targetRole || !location || !careerInterests.length) {
      return res.status(400).json({
        error: "Complete university, degree, graduation year, target role, location and at least one career interest",
      });
    }
    if (avatarData && !/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(avatarData)) {
      return res.status(400).json({ error: "Upload a JPG, PNG or WebP profile photo" });
    }
    if (avatarData && avatarData.length > 1_400_000) {
      return res.status(413).json({ error: "Profile photo is too large. Choose a smaller image." });
    }

    const completedFields = [name, email, university, degree, graduationYear, targetRole, location, careerInterests.length]
      .filter((value) => value !== null && value !== "").length;
    const profileCompletion = Math.round((completedFields / 8) * 100);

    await connection.beginTransaction();
    const [duplicateRows] = await connection.execute(
      "SELECT id FROM users WHERE email=? AND id<>? LIMIT 1",
      [email, req.user.id],
    );
    if (duplicateRows.length) {
      await connection.rollback();
      return res.status(409).json({ error: "Another account already uses this email address" });
    }
    await connection.execute(
      "UPDATE users SET name=?, email=? WHERE id=? AND role='student'",
      [name, email, req.user.id],
    );
    await connection.execute(
      `INSERT INTO student_profiles
         (user_id, university, degree, graduation_year, target_role, career_interests,
          location, profile_completion, avatar_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         university=VALUES(university), degree=VALUES(degree),
         graduation_year=VALUES(graduation_year), target_role=VALUES(target_role),
         career_interests=VALUES(career_interests), location=VALUES(location),
         profile_completion=VALUES(profile_completion),
         avatar_data=IF(?, VALUES(avatar_data), avatar_data)`,
      [
        req.user.id,
        university,
        degree,
        graduationYear,
        targetRole,
        JSON.stringify(careerInterests),
        location,
        profileCompletion,
        avatarData,
        avatarProvided ? 1 : 0,
      ],
    );
    await syncProfileSkills(connection, req.user.id, profileSkills);
    await connection.commit();

    const [rows] = await connection.execute(
      `SELECT u.id, u.name, u.email, u.role, u.status, p.university, p.degree, p.graduation_year,
              p.target_role, p.career_interests, p.location, p.phone, p.bio, p.readiness_score,
              p.profile_completion, p.avatar_url, p.avatar_data, p.updated_at
       FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id WHERE u.id=?`,
      [req.user.id],
    );
    res.json(await profileWithSkills(rows[0]));
  } catch (error) {
    try { await connection?.rollback(); } catch {}
    next(error);
  }
  finally {
    connection?.release();
  }
});

module.exports = router;
