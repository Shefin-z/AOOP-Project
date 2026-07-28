const express = require("express");
const { query } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/assessments", authenticate, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.*, COUNT(q.id) question_count,
       (SELECT MAX(aa.percentage) FROM assessment_attempts aa WHERE aa.assessment_id=a.id AND aa.user_id=?) best_score
       FROM assessments a LEFT JOIN questions q ON q.assessment_id=a.id
       WHERE a.status='published' GROUP BY a.id ORDER BY a.created_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.get("/assessments/:id/questions", authenticate, async (req, res, next) => {
  try {
    const questions = await query("SELECT id, prompt, question_type, difficulty, points FROM questions WHERE assessment_id=? AND status='published' ORDER BY RAND()", [req.params.id]);
    for (const question of questions) {
      question.options = await query("SELECT id, option_text FROM question_options WHERE question_id=? ORDER BY sort_order", [question.id]);
    }
    res.json(questions);
  } catch (error) { next(error); }
});

router.post("/assessments/:id/submit", authenticate, async (req, res, next) => {
  try {
    const { answers = [], startedAt } = req.body;
    let score = 0;
    let total = 0;
    for (const answer of answers) {
      const rows = await query(
        "SELECT q.points, qo.is_correct FROM questions q JOIN question_options qo ON qo.question_id=q.id WHERE q.id=? AND qo.id=?",
        [answer.questionId, answer.optionId],
      );
      if (rows[0]) { total += rows[0].points; if (rows[0].is_correct) score += rows[0].points; }
    }
    const percentage = total ? Math.round((score / total) * 100) : 0;
    await query("INSERT INTO assessment_attempts (user_id, assessment_id, score, total_points, percentage, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())", [req.user.id, req.params.id, score, total, percentage, startedAt || new Date()]);
    res.json({ score, total, percentage });
  } catch (error) { next(error); }
});

router.get("/resources", authenticate, async (req, res, next) => {
  try {
    res.json(await query("SELECT * FROM learning_resources WHERE status='published' ORDER BY featured DESC, created_at DESC"));
  } catch (error) { next(error); }
});

router.get("/events", authenticate, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT e.*, EXISTS(SELECT 1 FROM event_registrations er WHERE er.event_id=e.id AND er.user_id=?) registered
       FROM events e WHERE e.status='published' AND e.starts_at>=NOW() ORDER BY e.starts_at`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.post("/events/:id/register", authenticate, async (req, res, next) => {
  try {
    await query("INSERT IGNORE INTO event_registrations (event_id, user_id) VALUES (?, ?)", [req.params.id, req.user.id]);
    res.status(201).json({ message: "Registration confirmed" });
  } catch (error) { next(error); }
});

module.exports = router;
