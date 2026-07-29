const express = require("express");
const { query } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { ensureJobSchema } = require("../services/job-schema");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    const { search = "", type = "", category = "" } = req.query;
    const clauses = ["j.created_by IS NOT NULL", "j.status = 'live'", "j.expires_at > NOW()"];
    const params = [];
    if (search) { clauses.push("(j.title LIKE ? OR c.name LIKE ? OR j.description LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (type) { clauses.push("j.employment_type = ?"); params.push(type); }
    if (category) { clauses.push("j.category = ?"); params.push(category); }
    const rows = await query(
      `SELECT j.*, c.name company, c.description company_description,
        c.website company_website, c.logo_url, c.employee_rating,
        EXISTS(SELECT 1 FROM applications a WHERE a.job_id=j.id AND a.user_id=?) already_applied
       FROM jobs j JOIN companies c ON c.id=j.company_id
       WHERE ${clauses.join(" AND ")} ORDER BY j.created_at DESC LIMIT 100`,
      [req.user.id, ...params],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.get("/recommendations", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    const [profile] = await query("SELECT target_role, readiness_score FROM student_profiles WHERE user_id = ?", [req.user.id]);
    const skills = await query("SELECT s.name, us.score FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=?", [req.user.id]);
    const jobs = await query(
      `SELECT j.id, j.title, j.description, j.category, c.name company
       FROM jobs j JOIN companies c ON c.id=j.company_id
       WHERE j.created_by IS NOT NULL AND j.status='live' AND j.expires_at>NOW()
       ORDER BY j.created_at DESC LIMIT 50`,
    );
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL || "http://localhost:8000"}/recommend/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profile || {}, skills, jobs }),
      });
      if (!response.ok) throw new Error("AI service unavailable");
      return res.json(await response.json());
    } catch {
      return res.json(jobs.slice(0, 12).map((job) => ({ ...job, match_percentage: null, reasons: [] })));
    }
  } catch (error) { next(error); }
});

router.post("/:jobId/apply", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    if (req.user.role !== "student") return res.status(403).json({ error: "Only students can apply for jobs" });
    const { coverLetter = "", resumeUrl = null } = req.body;
    const [job] = await query(
      `SELECT id FROM jobs
       WHERE id=? AND created_by IS NOT NULL AND status='live' AND expires_at>NOW()`,
      [req.params.jobId],
    );
    if (!job) return res.status(404).json({ error: "This job is no longer accepting applications" });
    await query(
      `INSERT INTO applications (user_id, job_id, status, cover_letter, resume_url)
       VALUES (?, ?, 'applied', ?, ?)
       ON DUPLICATE KEY UPDATE cover_letter=VALUES(cover_letter), resume_url=VALUES(resume_url), updated_at=NOW()`,
      [req.user.id, req.params.jobId, coverLetter, resumeUrl],
    );
    res.status(201).json({ message: "Application submitted" });
  } catch (error) { next(error); }
});

router.get("/applications/mine", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    const rows = await query(
      `SELECT a.*, j.title, c.name company, j.location, j.workplace_type, j.employment_type
       FROM applications a JOIN jobs j ON j.id=a.job_id JOIN companies c ON c.id=j.company_id
       WHERE a.user_id=? AND j.created_by IS NOT NULL ORDER BY a.created_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

module.exports = router;
