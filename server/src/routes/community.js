const express = require("express");
const { query } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/posts", authenticate, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT p.id, p.content, p.share_count, p.created_at, u.name author,
        COUNT(DISTINCT l.user_id) likes, COUNT(DISTINCT c.id) comments,
        EXISTS(SELECT 1 FROM post_likes mine WHERE mine.post_id=p.id AND mine.user_id=?) liked
       FROM community_posts p JOIN users u ON u.id=p.user_id
       LEFT JOIN post_likes l ON l.post_id=p.id LEFT JOIN comments c ON c.post_id=p.id AND c.status='visible'
       WHERE p.status='visible' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.post("/posts", authenticate, async (req, res, next) => {
  try {
    if (!req.body.content?.trim()) return res.status(400).json({ error: "Post content is required" });
    const result = await query("INSERT INTO community_posts (user_id, content, status) VALUES (?, ?, 'visible')", [req.user.id, req.body.content.trim()]);
    res.status(201).json({ id: result.insertId, message: "Post published" });
  } catch (error) { next(error); }
});

router.post("/posts/:id/like", authenticate, async (req, res, next) => {
  try {
    const existing = await query("SELECT 1 FROM post_likes WHERE post_id=? AND user_id=?", [req.params.id, req.user.id]);
    if (existing.length) await query("DELETE FROM post_likes WHERE post_id=? AND user_id=?", [req.params.id, req.user.id]);
    else await query("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", [req.params.id, req.user.id]);
    res.json({ liked: !existing.length });
  } catch (error) { next(error); }
});

router.post("/posts/:id/comments", authenticate, async (req, res, next) => {
  try {
    if (!req.body.content?.trim()) return res.status(400).json({ error: "Comment content is required" });
    const result = await query("INSERT INTO comments (post_id, user_id, content, status) VALUES (?, ?, ?, 'visible')", [req.params.id, req.user.id, req.body.content.trim()]);
    res.status(201).json({ id: result.insertId });
  } catch (error) { next(error); }
});

module.exports = router;
