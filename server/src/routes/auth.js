const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, query } = require("../config/db");
const { authenticate, JWT_SECRET } = require("../middleware/auth");
const { ensureProfileSchema } = require("../services/profile-schema");
const { getPlatformSettings } = require("../services/platform-settings");

const router = express.Router();

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
    graduation_year: row.graduation_year == null ? null : Number(row.graduation_year),
    readiness_score: Number(row.readiness_score || 0),
    profile_completion: Number(row.profile_completion || 0),
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const settings = await getPlatformSettings();
    if (!settings.features.registrationEnabled) {
      return res.status(403).json({ error: "New student registration is currently disabled" });
    }
    const { name, email, password, university } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ error: "Enter a valid email address" });
    if (name.trim().length < 2) return res.status(400).json({ error: "Name must contain at least 2 characters" });
    if (password.length < settings.security.minimumPasswordLength) {
      return res.status(400).json({ error: `Password must contain at least ${settings.security.minimumPasswordLength} characters` });
    }
    if (settings.security.requireUppercase && !/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain an uppercase letter" });
    }
    if (settings.security.requireNumber && !/\d/.test(password)) {
      return res.status(400).json({ error: "Password must contain a number" });
    }
    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (existing.length) return res.status(409).json({ error: "An account already exists for this email" });
    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'student', 'active')",
      [name.trim(), normalizedEmail, hash],
    );
    await query("INSERT INTO student_profiles (user_id, university, readiness_score) VALUES (?, ?, 35)", [result.insertId, university || null]);
    res.status(201).json({
      message: "Account created successfully. Sign in to continue.",
      user: { id: result.insertId, name: name.trim(), email: normalizedEmail, role: "student" },
    });
  } catch (error) { next(error); }
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
    await ensureProfileSchema();
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, p.university, p.degree, p.graduation_year,
              p.target_role, p.career_interests, p.location, p.phone, p.bio, p.readiness_score,
              p.profile_completion, p.avatar_url, p.avatar_data, p.updated_at
       FROM users u LEFT JOIN student_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [req.user.id],
    );
    res.json(profileResponse(rows[0]));
  } catch (error) { next(error); }
});

router.patch("/me", authenticate, async (req, res, next) => {
  let connection;
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student account required" });
    }
    await ensureProfileSchema();
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
    await connection.commit();

    const [rows] = await connection.execute(
      `SELECT u.id, u.name, u.email, u.role, u.status, p.university, p.degree, p.graduation_year,
              p.target_role, p.career_interests, p.location, p.phone, p.bio, p.readiness_score,
              p.profile_completion, p.avatar_url, p.avatar_data, p.updated_at
       FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id WHERE u.id=?`,
      [req.user.id],
    );
    res.json(profileResponse(rows[0]));
  } catch (error) {
    try { await connection?.rollback(); } catch {}
    next(error);
  }
  finally {
    connection?.release();
  }
});

module.exports = router;
