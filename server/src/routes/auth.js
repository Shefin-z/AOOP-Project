const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { authenticate, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, university } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ error: "Enter a valid email address" });
    if (name.trim().length < 2) return res.status(400).json({ error: "Name must contain at least 2 characters" });
    if (password.length < 8) return res.status(400).json({ error: "Password must contain at least 8 characters" });
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
    const { email, password, role } = req.body;
    const rows = await query("SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1", [(email || "").toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) return res.status(401).json({ error: "Incorrect email or password" });
    if (user.status !== "active") return res.status(403).json({ error: "This account is not active" });
    if (role && user.role !== role) return res.status(403).json({ error: `Use the ${user.role} sign-in page for this account` });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    await query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, p.university, p.degree, p.graduation_year,
              p.target_role, p.location, p.readiness_score, p.avatar_url
       FROM users u LEFT JOIN student_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [req.user.id],
    );
    res.json(rows[0] || null);
  } catch (error) { next(error); }
});

module.exports = router;
