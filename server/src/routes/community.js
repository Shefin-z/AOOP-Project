const express = require("express");
const { pool, query } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { ensureCommunitySchema } = require("../services/community-schema");
const { analyseContent } = require("../services/content-moderation");
const { getPlatformSettings } = require("../services/platform-settings");

const router = express.Router();
router.use(authenticate);

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseStringList(value, limit = 5) {
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.map((item) => cleanText(item, 40)).filter(Boolean))].slice(0, limit);
}

function normaliseUrl(value) {
  const candidate = cleanText(value, 500);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

async function findPost(postId) {
  const [post] = await query("SELECT id, user_id, content, status FROM community_posts WHERE id=? LIMIT 1", [postId]);
  return post;
}

router.get("/posting-status", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const settings = await getPlatformSettings();
    if (req.user.role === "admin") {
      return res.json({ canPost: true, nextPostAt: null, cooldownHours: 0 });
    }
    if (!settings.features.communityPostingEnabled) {
      return res.json({
        canPost: false,
        nextPostAt: null,
        cooldownHours: 12,
        disabled: true,
        reason: "Student community posting is currently disabled by an administrator",
      });
    }
    const [latest] = await query(
      `SELECT MAX(created_at) last_post_at,
              DATE_ADD(MAX(created_at), INTERVAL 12 HOUR) next_post_at
       FROM community_posts WHERE user_id=?`,
      [req.user.id],
    );
    const nextPostAt = latest?.next_post_at || null;
    const canPost = !nextPostAt || new Date(nextPostAt).getTime() <= Date.now();
    return res.json({ canPost, nextPostAt, cooldownHours: 12 });
  } catch (error) { next(error); }
});

router.get("/posts", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const rows = await query(
      `SELECT p.id, p.user_id, p.content, p.media_url, p.link_url, p.tags, p.share_count,
              p.created_at, u.name author, u.role author_role, sp.university, sp.avatar_url,
              (SELECT COUNT(*) FROM post_likes l WHERE l.post_id=p.id) likes,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id AND c.status='visible') comments,
              EXISTS(SELECT 1 FROM post_likes mine WHERE mine.post_id=p.id AND mine.user_id=?) liked,
              (p.user_id=?) is_owner
       FROM community_posts p
       JOIN users u ON u.id=p.user_id
       LEFT JOIN student_profiles sp ON sp.user_id=u.id
       WHERE p.status='visible'
       ORDER BY p.created_at DESC
       LIMIT 100`,
      [req.user.id, req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.post("/posts", async (req, res, next) => {
  let connection;
  try {
    await ensureCommunitySchema();
    const settings = await getPlatformSettings();
    if (req.user.role !== "admin" && !settings.features.communityPostingEnabled) {
      return res.status(403).json({ error: "Student community posting is currently disabled" });
    }
    const content = cleanText(req.body.content, 5000);
    if (!content) return res.status(400).json({ error: "Post content is required" });
    const rawLink = cleanText(req.body.linkUrl, 500);
    const linkUrl = normaliseUrl(rawLink);
    if (rawLink && !linkUrl) return res.status(400).json({ error: "Resource link must be a valid http or https URL" });
    const tags = parseStringList(req.body.tags);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.execute("SELECT id FROM users WHERE id=? FOR UPDATE", [req.user.id]);
    if (req.user.role !== "admin") {
      const [latestRows] = await connection.execute(
        `SELECT created_at, DATE_ADD(created_at, INTERVAL 12 HOUR) next_post_at
         FROM community_posts WHERE user_id=? ORDER BY created_at DESC LIMIT 1`,
        [req.user.id],
      );
      const nextPostAt = latestRows[0]?.next_post_at || null;
      if (nextPostAt && new Date(nextPostAt).getTime() > Date.now()) {
        await connection.rollback();
        return res.status(429).json({
          error: "Students can publish one community post every 12 hours",
          nextPostAt,
        });
      }
    }
    const [duplicate] = await connection.execute(
      `SELECT id FROM community_posts
       WHERE user_id=? AND LOWER(TRIM(content))=LOWER(?) AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       LIMIT 1`,
      [req.user.id, content],
    );
    const moderation = analyseContent(`${content} ${linkUrl || ""}`, { duplicate: duplicate.length > 0 });
    const requiresReview = settings.ai.contentModerationEnabled
      && moderation.score >= settings.ai.moderationThreshold;
    const status = requiresReview ? "pending_review" : "visible";
    const [result] = await connection.execute(
      `INSERT INTO community_posts
       (user_id, content, link_url, tags, status, risk_score, risk_label, risk_reasons)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        content,
        linkUrl,
        tags.length ? JSON.stringify(tags) : null,
        status,
        moderation.score,
        moderation.label,
        moderation.reasons.length ? JSON.stringify(moderation.reasons) : null,
      ],
    );
    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      status,
      nextPostAt: req.user.role === "admin" ? null : new Date(Date.now() + (12 * 60 * 60 * 1000)).toISOString(),
      risk: { score: moderation.score, label: moderation.label, reasons: moderation.reasons },
      message: status === "visible" ? "Post published" : "Post submitted for administrator review",
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

router.delete("/posts/:id", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const post = await findPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "You cannot remove this post" });
    await query("UPDATE community_posts SET status='removed', reviewed_by=?, reviewed_at=NOW() WHERE id=?", [
      req.user.role === "admin" ? req.user.id : null,
      req.params.id,
    ]);
    res.json({ message: "Post removed" });
  } catch (error) { next(error); }
});

router.post("/posts/:id/like", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const post = await findPost(req.params.id);
    if (!post || post.status !== "visible") return res.status(404).json({ error: "Post not found" });
    const existing = await query("SELECT 1 FROM post_likes WHERE post_id=? AND user_id=?", [req.params.id, req.user.id]);
    if (existing.length) await query("DELETE FROM post_likes WHERE post_id=? AND user_id=?", [req.params.id, req.user.id]);
    else await query("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", [req.params.id, req.user.id]);
    const [count] = await query("SELECT COUNT(*) total FROM post_likes WHERE post_id=?", [req.params.id]);
    res.json({ liked: !existing.length, likes: count.total });
  } catch (error) { next(error); }
});

router.get("/posts/:id/comments", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const post = await findPost(req.params.id);
    if (!post || (post.status !== "visible" && req.user.role !== "admin")) return res.status(404).json({ error: "Post not found" });
    res.json(await query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
              u.name author, u.role author_role, sp.avatar_url,
              (c.user_id=?) is_owner
       FROM comments c
       JOIN users u ON u.id=c.user_id
       LEFT JOIN student_profiles sp ON sp.user_id=u.id
       WHERE c.post_id=? AND c.status='visible'
       ORDER BY c.created_at ASC`,
      [req.user.id, req.params.id],
    ));
  } catch (error) { next(error); }
});

router.post("/posts/:id/comments", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const content = cleanText(req.body.content, 1500);
    if (!content) return res.status(400).json({ error: "Comment content is required" });
    const post = await findPost(req.params.id);
    if (!post || post.status !== "visible") return res.status(404).json({ error: "Post not found" });
    const result = await query(
      "INSERT INTO comments (post_id, user_id, content, status) VALUES (?, ?, ?, 'visible')",
      [req.params.id, req.user.id, content],
    );
    res.status(201).json({
      id: result.insertId,
      post_id: Number(req.params.id),
      user_id: req.user.id,
      content,
      author: req.user.name,
      author_role: req.user.role,
      is_owner: 1,
      created_at: new Date().toISOString(),
    });
  } catch (error) { next(error); }
});

router.delete("/comments/:id", async (req, res, next) => {
  try {
    const [comment] = await query("SELECT id, user_id FROM comments WHERE id=? LIMIT 1", [req.params.id]);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.user_id !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "You cannot remove this comment" });
    await query("UPDATE comments SET status='removed' WHERE id=?", [req.params.id]);
    res.json({ message: "Comment removed" });
  } catch (error) { next(error); }
});

router.post("/posts/:id/share", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const post = await findPost(req.params.id);
    if (!post || post.status !== "visible") return res.status(404).json({ error: "Post not found" });
    const existing = await query("SELECT 1 FROM post_shares WHERE post_id=? AND user_id=?", [req.params.id, req.user.id]);
    if (!existing.length) {
      await query("INSERT INTO post_shares (post_id, user_id) VALUES (?, ?)", [req.params.id, req.user.id]);
      await query("UPDATE community_posts SET share_count=share_count+1 WHERE id=?", [req.params.id]);
    }
    const [updated] = await query("SELECT share_count FROM community_posts WHERE id=?", [req.params.id]);
    res.json({ shared: true, share_count: updated.share_count });
  } catch (error) { next(error); }
});

router.post("/posts/:id/report", async (req, res, next) => {
  try {
    await ensureCommunitySchema();
    const reason = cleanText(req.body.reason, 120);
    const details = cleanText(req.body.details, 1000) || null;
    if (!["spam", "fraud", "harassment", "misinformation", "other"].includes(reason)) {
      return res.status(400).json({ error: "Choose a valid report reason" });
    }
    const post = await findPost(req.params.id);
    if (!post || post.status !== "visible") return res.status(404).json({ error: "Post not found" });
    if (post.user_id === req.user.id) return res.status(400).json({ error: "You cannot report your own post" });
    const existing = await query(
      "SELECT id FROM content_reports WHERE post_id=? AND reporter_id=? AND status='open' LIMIT 1",
      [req.params.id, req.user.id],
    );
    if (existing.length) return res.status(409).json({ error: "You already reported this post" });
    const result = await query(
      "INSERT INTO content_reports (post_id, reporter_id, reason, details, status) VALUES (?, ?, ?, ?, 'open')",
      [req.params.id, req.user.id, reason, details],
    );
    res.status(201).json({ id: result.insertId, message: "Report sent to administrators" });
  } catch (error) { next(error); }
});

module.exports = router;
