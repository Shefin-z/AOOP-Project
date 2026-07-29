const express = require("express");
const { query } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/assessments", authenticate, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.id, a.title, a.description, a.category, a.difficulty,
       a.time_limit_minutes, a.passing_percentage, COUNT(q.id) question_count,
       (SELECT MAX(aa.percentage) FROM assessment_attempts aa WHERE aa.assessment_id=a.id AND aa.user_id=?) best_score
       FROM assessments a
       LEFT JOIN questions q ON q.assessment_id=a.id AND q.status='published'
       WHERE a.status='published' AND a.created_by IS NOT NULL
       GROUP BY a.id
       HAVING COUNT(q.id) > 0
       ORDER BY a.created_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.get("/assessments/:id/questions", authenticate, async (req, res, next) => {
  try {
    const [assessment] = await query(
      "SELECT id FROM assessments WHERE id=? AND status='published' AND created_by IS NOT NULL",
      [req.params.id],
    );
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    const questions = await query(
      "SELECT id, prompt, question_type, difficulty, points FROM questions WHERE assessment_id=? AND status='published' ORDER BY id",
      [req.params.id],
    );
    for (const question of questions) {
      question.options = await query("SELECT id, option_text FROM question_options WHERE question_id=? ORDER BY sort_order", [question.id]);
    }
    res.json(questions);
  } catch (error) { next(error); }
});

router.post("/assessments/:id/submit", authenticate, async (req, res, next) => {
  try {
    const { answers = [], startedAt } = req.body;
    const [assessment] = await query(
      "SELECT id FROM assessments WHERE id=? AND status='published' AND created_by IS NOT NULL",
      [req.params.id],
    );
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const questions = await query(
      "SELECT id, points FROM questions WHERE assessment_id=? AND status='published'",
      [req.params.id],
    );
    if (!questions.length) return res.status(400).json({ error: "This assessment has no published questions" });

    const answerMap = new Map(
      (Array.isArray(answers) ? answers : [])
        .map((answer) => [Number(answer.questionId), Number(answer.optionId)])
        .filter(([questionId, optionId]) => questionId && optionId),
    );
    let score = 0;
    let correctAnswers = 0;
    const total = questions.reduce((sum, question) => sum + Number(question.points), 0);
    for (const question of questions) {
      const optionId = answerMap.get(Number(question.id));
      if (!optionId) continue;
      const rows = await query(
        `SELECT qo.is_correct FROM question_options qo
         JOIN questions q ON q.id=qo.question_id
         WHERE q.id=? AND q.assessment_id=? AND qo.id=?`,
        [question.id, req.params.id, optionId],
      );
      if (rows[0]?.is_correct) {
        score += Number(question.points);
        correctAnswers += 1;
      }
    }
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const parsedStartedAt = startedAt && !Number.isNaN(Date.parse(startedAt)) ? new Date(startedAt) : new Date();
    await query(
      "INSERT INTO assessment_attempts (user_id, assessment_id, score, total_points, percentage, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [req.user.id, req.params.id, score, total, percentage, parsedStartedAt],
    );
    res.json({ score, total, percentage, correctAnswers, questionCount: questions.length });
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
