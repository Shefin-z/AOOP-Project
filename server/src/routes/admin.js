const express = require("express");
const { query } = require("../config/db");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, adminOnly);

router.get("/stats", async (_req, res, next) => {
  try {
    const [[users], [assessments], [jobs], [applications], [posts], [reports]] = await Promise.all([
      query("SELECT COUNT(*) total FROM users WHERE role='student'"),
      query("SELECT COUNT(*) total FROM assessments"),
      query("SELECT COUNT(*) total FROM jobs"),
      query("SELECT COUNT(*) total FROM applications"),
      query("SELECT COUNT(*) total FROM community_posts WHERE status='visible'"),
      query("SELECT COUNT(*) total FROM content_reports WHERE status='open'"),
    ]);
    res.json({ users: users.total, assessments: assessments.total, jobs: jobs.total, applications: applications.total, posts: posts.total, openReports: reports.total });
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
