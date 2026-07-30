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
        EXISTS(
          SELECT 1 FROM applications a
          WHERE a.job_id=j.id AND a.user_id=? AND a.status<>'withdrawn'
        ) already_applied
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

router.patch("/applications/:applicationId/withdraw", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    if (req.user.role !== "student") return res.status(403).json({ error: "Only students can withdraw applications" });
    const [application] = await query(
      `SELECT a.id, a.job_id, a.status
       FROM applications a
       JOIN jobs j ON j.id=a.job_id
       WHERE a.id=? AND a.user_id=? AND j.created_by IS NOT NULL
       LIMIT 1`,
      [req.params.applicationId, req.user.id],
    );
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.status === "withdrawn") return res.status(409).json({ error: "This application is already cancelled" });
    if (application.status === "rejected") return res.status(409).json({ error: "A rejected application cannot be cancelled" });

    await query(
      "UPDATE applications SET status='withdrawn', updated_at=NOW() WHERE id=? AND user_id=?",
      [application.id, req.user.id],
    );
    const [applicationStats] = await query(
      "SELECT COUNT(*) application_count FROM applications WHERE job_id=? AND status<>'withdrawn'",
      [application.job_id],
    );
    res.json({
      message: "Application cancelled",
      applicationCount: Number(applicationStats.application_count || 0),
    });
  } catch (error) { next(error); }
});

router.post("/:jobId/apply", authenticate, async (req, res, next) => {
  try {
    await ensureJobSchema();
    if (req.user.role !== "student") return res.status(403).json({ error: "Only students can apply for jobs" });
    const {
      coverLetter = "",
      resumeUrl = null,
      resumeSnapshot = null,
      resumeFile = null,
    } = req.body;
    const snapshotJson = resumeSnapshot && typeof resumeSnapshot === "object"
      ? JSON.stringify(resumeSnapshot)
      : null;
    if (snapshotJson && snapshotJson.length > 250000) {
      return res.status(413).json({ error: "Career Vault CV is too large to submit" });
    }
    const allowedResumeTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    let resumeFileName = null;
    let resumeFileType = null;
    let resumeFileData = null;
    if (resumeFile) {
      resumeFileName = String(resumeFile.name || "resume").trim().slice(0, 255);
      resumeFileType = String(resumeFile.type || "").trim().slice(0, 100);
      resumeFileData = String(resumeFile.data || "");
      if (!allowedResumeTypes.has(resumeFileType)) return res.status(400).json({ error: "Resume file must be PDF, DOC or DOCX" });
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(resumeFileData)) return res.status(400).json({ error: "Resume file data is invalid" });
      if (resumeFileData.length > 1750000) return res.status(413).json({ error: "Resume file must be smaller than 1.25 MB" });
    }
    const [job] = await query(
      `SELECT id FROM jobs
       WHERE id=? AND created_by IS NOT NULL AND status='live' AND expires_at>NOW()`,
      [req.params.jobId],
    );
    if (!job) return res.status(404).json({ error: "This job is no longer accepting applications" });
    const [existingApplication] = await query(
      "SELECT id, status FROM applications WHERE user_id=? AND job_id=? LIMIT 1",
      [req.user.id, req.params.jobId],
    );
    if (existingApplication && existingApplication.status !== "withdrawn") {
      return res.status(409).json({ error: "You have already applied for this job" });
    }
    if (existingApplication) {
      await query(
        `UPDATE applications
         SET status='applied', cover_letter=?, resume_url=?, resume_snapshot=?,
             resume_file_name=?, resume_file_type=?, resume_file_data=?,
             applied_at=NOW(), updated_at=NOW()
         WHERE id=? AND user_id=?`,
        [
          String(coverLetter || "").trim().slice(0, 15000),
          resumeUrl,
          snapshotJson,
          resumeFileName,
          resumeFileType,
          resumeFileData,
          existingApplication.id,
          req.user.id,
        ],
      );
    } else {
      await query(
        `INSERT INTO applications
         (user_id, job_id, status, cover_letter, resume_url, resume_snapshot,
          resume_file_name, resume_file_type, resume_file_data)
         VALUES (?, ?, 'applied', ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          req.params.jobId,
          String(coverLetter || "").trim().slice(0, 15000),
          resumeUrl,
          snapshotJson,
          resumeFileName,
          resumeFileType,
          resumeFileData,
        ],
      );
    }
    const [applicationStats] = await query(
      "SELECT COUNT(*) application_count FROM applications WHERE job_id=? AND status<>'withdrawn'",
      [req.params.jobId],
    );
    res.status(201).json({
      message: "Application submitted",
      applicationCount: Number(applicationStats.application_count || 0),
    });
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
