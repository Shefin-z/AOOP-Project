const express = require("express");
const { randomBytes } = require("node:crypto");
const { pool, query } = require("../config/db");
const { authenticate, adminOnly } = require("../middleware/auth");
const { ensureJobSchema } = require("../services/job-schema");

const router = express.Router();
router.use(authenticate, adminOnly);

router.get("/stats", async (_req, res, next) => {
  try {
    await ensureJobSchema();
    const [[users], [assessments], [jobs], [applications], [posts], [reports]] = await Promise.all([
      query("SELECT COUNT(*) total FROM users WHERE role='student'"),
      query("SELECT COUNT(*) total FROM assessments WHERE created_by IS NOT NULL"),
      query("SELECT COUNT(*) total FROM jobs WHERE created_by IS NOT NULL"),
      query("SELECT COUNT(*) total FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.created_by IS NOT NULL"),
      query("SELECT COUNT(*) total FROM community_posts WHERE status='visible'"),
      query("SELECT COUNT(*) total FROM content_reports WHERE status='open'"),
    ]);
    res.json({ users: users.total, assessments: assessments.total, jobs: jobs.total, applications: applications.total, posts: posts.total, openReports: reports.total });
  } catch (error) { next(error); }
});

const assessmentStatuses = new Set(["draft", "published", "archived"]);
const questionStatuses = new Set(["draft", "published", "needs_review"]);
const difficulties = new Set(["Beginner", "Intermediate", "Advanced"]);
const questionTypes = new Set(["multiple_choice", "true_false"]);
const jobStatuses = new Set(["draft", "pending", "live", "closed"]);
const employmentTypes = new Set(["Full-time", "Part-time", "Internship", "Contract"]);
const workplaceTypes = new Set(["On-site", "Hybrid", "Remote"]);

function cleanText(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function assessmentPayload(body) {
  return {
    title: cleanText(body.title, 180),
    description: cleanText(body.description, 5000) || null,
    category: cleanText(body.category, 100),
    difficulty: difficulties.has(body.difficulty) ? body.difficulty : "Beginner",
    timeLimitMinutes: Math.min(180, Math.max(1, Number(body.timeLimitMinutes) || 15)),
    passingPercentage: Math.min(100, Math.max(0, Number(body.passingPercentage) || 60)),
    status: assessmentStatuses.has(body.status) ? body.status : "draft",
  };
}

function questionPayload(body) {
  const options = Array.isArray(body.options)
    ? body.options.slice(0, 6).map((option) => ({
      text: cleanText(option.text, 1000),
      isCorrect: Boolean(option.isCorrect),
    })).filter((option) => option.text)
    : [];
  return {
    assessmentId: Number(body.assessmentId),
    prompt: cleanText(body.prompt, 10000),
    questionType: questionTypes.has(body.questionType) ? body.questionType : "multiple_choice",
    difficulty: difficulties.has(body.difficulty) ? body.difficulty : "Beginner",
    explanation: cleanText(body.explanation, 10000) || null,
    points: Math.min(100, Math.max(0.25, Number(body.points) || 1)),
    status: questionStatuses.has(body.status) ? body.status : "draft",
    options,
  };
}

function validateQuestion(payload) {
  if (!payload.assessmentId || !payload.prompt) return "Assessment and question text are required";
  if (payload.options.length < 2) return "At least two answer options are required";
  if (payload.options.filter((option) => option.isCorrect).length !== 1) return "Select exactly one correct answer";
  return null;
}

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function jobPayload(body) {
  const rawExpiry = cleanText(body.expiresAt, 40);
  const expiresAt = rawExpiry
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(rawExpiry) ? `${rawExpiry}T23:59:59.999Z` : rawExpiry)
    : null;
  return {
    companyName: cleanText(body.companyName, 160),
    companyDescription: cleanText(body.companyDescription, 5000) || null,
    companyWebsite: cleanText(body.companyWebsite, 300) || null,
    title: cleanText(body.title, 180),
    description: cleanText(body.description, 20000),
    responsibilities: cleanText(body.responsibilities, 10000) || null,
    requirements: cleanText(body.requirements, 10000),
    category: cleanText(body.category, 100),
    employmentType: employmentTypes.has(body.employmentType) ? body.employmentType : "Full-time",
    location: cleanText(body.location, 180),
    workplaceType: workplaceTypes.has(body.workplaceType) ? body.workplaceType : "On-site",
    salaryMin: optionalNumber(body.salaryMin),
    salaryMax: optionalNumber(body.salaryMax),
    currency: cleanText(body.currency, 3).toUpperCase() || "BDT",
    status: jobStatuses.has(body.status) ? body.status : "live",
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
}

function validateJob(payload) {
  if (!payload.companyName || !payload.title || !payload.description || !payload.requirements
      || !payload.category || !payload.location || !payload.expiresAt) {
    return "Company, role, description, requirements, category, location and expiry date are required";
  }
  if (payload.expiresAt.getTime() <= Date.now()) return "Expiry date must be in the future";
  if (payload.salaryMin !== null && payload.salaryMax !== null && payload.salaryMin > payload.salaryMax) {
    return "Maximum salary must be greater than or equal to minimum salary";
  }
  return null;
}

function createJobSlug(title, company) {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 185) || "job";
  return `${base}-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

router.get("/assessments", async (_req, res, next) => {
  try {
    res.json(await query(
      `SELECT a.id, a.title, a.description, a.category, a.difficulty,
       a.time_limit_minutes, a.passing_percentage, a.status, a.created_at, a.updated_at,
       COUNT(DISTINCT q.id) question_count, COUNT(DISTINCT aa.id) attempt_count,
       ROUND(AVG(aa.percentage), 1) average_score
       FROM assessments a
       LEFT JOIN questions q ON q.assessment_id=a.id
       LEFT JOIN assessment_attempts aa ON aa.assessment_id=a.id
       WHERE a.created_by IS NOT NULL
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
    ));
  } catch (error) { next(error); }
});

router.post("/assessments", async (req, res, next) => {
  try {
    const payload = assessmentPayload(req.body);
    if (!payload.title || !payload.category) return res.status(400).json({ error: "Title and category are required" });
    const result = await query(
      `INSERT INTO assessments
       (title, description, category, difficulty, time_limit_minutes, passing_percentage, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [payload.title, payload.description, payload.category, payload.difficulty, payload.timeLimitMinutes, payload.passingPercentage, payload.status, req.user.id],
    );
    const [assessment] = await query("SELECT * FROM assessments WHERE id=?", [result.insertId]);
    res.status(201).json(assessment);
  } catch (error) { next(error); }
});

router.patch("/assessments/:id", async (req, res, next) => {
  try {
    const payload = assessmentPayload(req.body);
    if (!payload.title || !payload.category) return res.status(400).json({ error: "Title and category are required" });
    const result = await query(
      `UPDATE assessments SET title=?, description=?, category=?, difficulty=?,
       time_limit_minutes=?, passing_percentage=?, status=?
       WHERE id=? AND created_by IS NOT NULL`,
      [payload.title, payload.description, payload.category, payload.difficulty, payload.timeLimitMinutes, payload.passingPercentage, payload.status, req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Assessment not found" });
    res.json({ message: "Assessment updated" });
  } catch (error) { next(error); }
});

router.delete("/assessments/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM assessments WHERE id=? AND created_by IS NOT NULL", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Assessment not found" });
    res.json({ message: "Assessment deleted" });
  } catch (error) { next(error); }
});

router.get("/questions", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT q.id, q.assessment_id, q.prompt, q.question_type, q.difficulty,
       q.explanation, q.points, q.status, q.created_at, q.updated_at,
       a.title assessment_title
       FROM questions q
       JOIN assessments a ON a.id=q.assessment_id
       WHERE a.created_by IS NOT NULL
       ORDER BY q.created_at DESC`,
    );
    for (const row of rows) {
      row.options = await query(
        "SELECT id, option_text, is_correct, sort_order FROM question_options WHERE question_id=? ORDER BY sort_order",
        [row.id],
      );
    }
    res.json(rows);
  } catch (error) { next(error); }
});

async function saveQuestion(req, res, next, questionId = null) {
  const payload = questionPayload(req.body);
  const validationError = validateQuestion(payload);
  if (validationError) return res.status(400).json({ error: validationError });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [assessmentRows] = await connection.execute(
      "SELECT id FROM assessments WHERE id=? AND created_by IS NOT NULL",
      [payload.assessmentId],
    );
    if (!assessmentRows[0]) {
      await connection.rollback();
      return res.status(404).json({ error: "Assessment not found" });
    }

    let savedQuestionId = questionId;
    if (questionId) {
      const [questionRows] = await connection.execute(
        `SELECT q.id FROM questions q
         JOIN assessments a ON a.id=q.assessment_id
         WHERE q.id=? AND a.created_by IS NOT NULL`,
        [questionId],
      );
      if (!questionRows[0]) {
        await connection.rollback();
        return res.status(404).json({ error: "Question not found" });
      }
      const [result] = await connection.execute(
        `UPDATE questions SET assessment_id=?, prompt=?, question_type=?, difficulty=?,
         explanation=?, points=?, status=? WHERE id=?`,
        [payload.assessmentId, payload.prompt, payload.questionType, payload.difficulty, payload.explanation, payload.points, payload.status, questionId],
      );
      if (!result.affectedRows) {
        await connection.rollback();
        return res.status(404).json({ error: "Question not found" });
      }
      await connection.execute("DELETE FROM question_options WHERE question_id=?", [questionId]);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO questions
         (assessment_id, prompt, question_type, difficulty, explanation, points, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [payload.assessmentId, payload.prompt, payload.questionType, payload.difficulty, payload.explanation, payload.points, payload.status],
      );
      savedQuestionId = result.insertId;
    }

    for (let index = 0; index < payload.options.length; index += 1) {
      const option = payload.options[index];
      await connection.execute(
        "INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?)",
        [savedQuestionId, option.text, option.isCorrect, index + 1],
      );
    }
    await connection.commit();
    res.status(questionId ? 200 : 201).json({ id: savedQuestionId, message: questionId ? "Question updated" : "Question created" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

router.post("/questions", (req, res, next) => saveQuestion(req, res, next));
router.patch("/questions/:id", (req, res, next) => saveQuestion(req, res, next, Number(req.params.id)));

router.delete("/questions/:id", async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM questions
       WHERE id=? AND assessment_id IN (
         SELECT id FROM assessments WHERE created_by IS NOT NULL
       )`,
      [req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (error) { next(error); }
});

router.get("/jobs", async (_req, res, next) => {
  try {
    await ensureJobSchema();
    res.json(await query(
      `SELECT j.id, j.title, j.slug, j.description, j.responsibilities, j.requirements,
       j.category, j.employment_type, j.location, j.workplace_type,
       j.salary_min, j.salary_max, j.currency, j.status, j.expires_at,
       j.created_at, j.updated_at, c.name company_name, c.description company_description,
       c.website company_website, c.logo_url company_logo,
       COALESCE(application_totals.application_count, 0) application_count,
       COALESCE(application_totals.in_review_count, 0) in_review_count,
       COALESCE(application_totals.assessment_count, 0) assessment_count,
       COALESCE(application_totals.interview_count, 0) interview_count,
       COALESCE(application_totals.offer_count, 0) offer_count
       FROM jobs j
       JOIN companies c ON c.id=j.company_id
       LEFT JOIN (
         SELECT job_id,
          COUNT(*) application_count,
          SUM(CASE WHEN status='in_review' THEN 1 ELSE 0 END) in_review_count,
          SUM(CASE WHEN status='assessment' THEN 1 ELSE 0 END) assessment_count,
          SUM(CASE WHEN status='interview' THEN 1 ELSE 0 END) interview_count,
          SUM(CASE WHEN status='offer' THEN 1 ELSE 0 END) offer_count
         FROM applications
         GROUP BY job_id
       ) application_totals ON application_totals.job_id=j.id
       WHERE j.created_by IS NOT NULL
       ORDER BY j.created_at DESC`,
    ));
  } catch (error) { next(error); }
});

async function saveManagedJob(req, res, next, jobId = null) {
  const payload = jobPayload(req.body);
  const validationError = validateJob(payload);
  if (validationError) return res.status(400).json({ error: validationError });

  await ensureJobSchema();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (jobId) {
      const [existingJobs] = await connection.execute(
        "SELECT id FROM jobs WHERE id=? AND created_by IS NOT NULL",
        [jobId],
      );
      if (!existingJobs[0]) {
        await connection.rollback();
        return res.status(404).json({ error: "Job not found" });
      }
    }

    let [companyRows] = await connection.execute(
      "SELECT id FROM companies WHERE name=? LIMIT 1",
      [payload.companyName],
    );
    let companyId = companyRows[0]?.id;
    if (companyId) {
      await connection.execute(
        `UPDATE companies SET
         description=COALESCE(?, description), website=COALESCE(?, website)
         WHERE id=?`,
        [payload.companyDescription, payload.companyWebsite, companyId],
      );
    } else {
      const [companyResult] = await connection.execute(
        "INSERT INTO companies (name, description, website) VALUES (?, ?, ?)",
        [payload.companyName, payload.companyDescription, payload.companyWebsite],
      );
      companyId = companyResult.insertId;
    }

    const values = [
      companyId,
      payload.title,
      payload.description,
      payload.responsibilities,
      payload.requirements,
      payload.category,
      payload.employmentType,
      payload.location,
      payload.workplaceType,
      payload.salaryMin,
      payload.salaryMax,
      payload.currency,
      payload.status,
      payload.expiresAt,
    ];

    let savedJobId = jobId;
    if (jobId) {
      await connection.execute(
        `UPDATE jobs SET company_id=?, title=?, description=?, responsibilities=?,
         requirements=?, category=?, employment_type=?, location=?, workplace_type=?,
         salary_min=?, salary_max=?, currency=?, status=?, expires_at=?
         WHERE id=? AND created_by IS NOT NULL`,
        [...values, jobId],
      );
    } else {
      const [jobResult] = await connection.execute(
        `INSERT INTO jobs
         (company_id, title, slug, description, responsibilities, requirements, category,
          employment_type, location, workplace_type, salary_min, salary_max, currency,
          status, expires_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId,
          payload.title,
          createJobSlug(payload.title, payload.companyName),
          payload.description,
          payload.responsibilities,
          payload.requirements,
          payload.category,
          payload.employmentType,
          payload.location,
          payload.workplaceType,
          payload.salaryMin,
          payload.salaryMax,
          payload.currency,
          payload.status,
          payload.expiresAt,
          req.user.id,
        ],
      );
      savedJobId = jobResult.insertId;
    }

    await connection.commit();
    res.status(jobId ? 200 : 201).json({
      id: savedJobId,
      message: jobId ? "Job updated" : "Job created",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

router.post("/jobs", (req, res, next) => saveManagedJob(req, res, next));
router.patch("/jobs/:id", (req, res, next) => saveManagedJob(req, res, next, Number(req.params.id)));

router.patch("/jobs/:id/status", async (req, res, next) => {
  try {
    await ensureJobSchema();
    const status = jobStatuses.has(req.body.status) ? req.body.status : null;
    if (!status) return res.status(400).json({ error: "Invalid job status" });
    const result = await query(
      "UPDATE jobs SET status=? WHERE id=? AND created_by IS NOT NULL",
      [status, req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Job not found" });
    res.json({ message: status === "live" ? "Job is visible to students" : "Job is hidden from students" });
  } catch (error) { next(error); }
});

router.delete("/jobs/:id", async (req, res, next) => {
  try {
    await ensureJobSchema();
    const result = await query(
      "DELETE FROM jobs WHERE id=? AND created_by IS NOT NULL",
      [req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (error) { next(error); }
});

router.get("/users", async (req, res, next) => {
  try {
    const search = `%${req.query.search || ""}%`;
    res.json(await query(
      `SELECT u.id, u.name, u.email, u.status, u.created_at, p.university, p.readiness_score
       FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id
       WHERE u.role='student' AND (u.name LIKE ? OR u.email LIKE ? OR p.university LIKE ?)
       ORDER BY u.created_at DESC LIMIT 200`,
      [search, search, search],
    ));
  } catch (error) { next(error); }
});

router.patch("/users/:id/status", async (req, res, next) => {
  try {
    if (!["active", "suspended"].includes(req.body.status)) return res.status(400).json({ error: "Invalid user status" });
    await query("UPDATE users SET status=? WHERE id=? AND role='student'", [req.body.status, req.params.id]);
    res.json({ message: "User status updated" });
  } catch (error) { next(error); }
});

router.get("/reports", async (_req, res, next) => {
  try {
    res.json(await query(
      `SELECT r.*, p.content, u.name author, reporter.name reporter_name
       FROM content_reports r JOIN community_posts p ON p.id=r.post_id
       JOIN users u ON u.id=p.user_id JOIN users reporter ON reporter.id=r.reporter_id
       WHERE r.status='open' ORDER BY r.created_at`,
    ));
  } catch (error) { next(error); }
});

router.patch("/reports/:id", async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!["dismiss", "remove"].includes(action)) return res.status(400).json({ error: "Invalid moderation action" });
    const [report] = await query("SELECT post_id FROM content_reports WHERE id=?", [req.params.id]);
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (action === "remove") await query("UPDATE community_posts SET status='removed' WHERE id=?", [report.post_id]);
    await query("UPDATE content_reports SET status=?, reviewed_at=NOW(), reviewed_by=? WHERE id=?", [action === "remove" ? "actioned" : "dismissed", req.user.id, req.params.id]);
    res.json({ message: "Moderation action saved" });
  } catch (error) { next(error); }
});

module.exports = router;
