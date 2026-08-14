const express = require("express");
const { pool, query } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { ensureStudentNetworkSchema } = require("../services/student-network-schema");

const router = express.Router();

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function toId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function pairFor(firstId, secondId) {
  return firstId < secondId ? [firstId, secondId] : [secondId, firstId];
}

function studentFields(prefix = "") {
  return `${prefix}u.id student_id, u.name, sp.university, sp.degree, sp.target_role, sp.location,
          COALESCE(NULLIF(sp.avatar_data, ''), sp.avatar_url) avatar`;
}

async function getConnectionForStudent(connectionId, studentId, { acceptedOnly = false } = {}) {
  const conditions = ["c.id=?", "(c.user_a_id=? OR c.user_b_id=?)"];
  const values = [connectionId, studentId, studentId];
  if (acceptedOnly) conditions.push("c.status='accepted'");
  const [connection] = await query(
    `SELECT c.id, c.user_a_id, c.user_b_id, c.requested_by_id, c.status, c.created_at, c.accepted_at
     FROM student_connections c WHERE ${conditions.join(" AND ")} LIMIT 1`,
    values,
  );
  return connection;
}

router.use(authenticate);
router.use((req, res, next) => {
  if (req.user?.role !== "student") return res.status(403).json({ error: "Student access required" });
  next();
});
router.use(async (_req, _res, next) => {
  try {
    await ensureStudentNetworkSchema();
    next();
  } catch (error) { next(error); }
});

router.get("/students", async (req, res, next) => {
  try {
    const term = cleanText(req.query.q, 100);
    const isStudentId = /^\d+$/.test(term);
    if (!term || (!isStudentId && term.length < 2)) return res.json([]);

    const like = `%${term}%`;
    const searchSql = isStudentId
      ? "AND (u.id=? OR u.name LIKE ? OR COALESCE(sp.university, '') LIKE ?)"
      : "AND (u.name LIKE ? OR COALESCE(sp.university, '') LIKE ? OR COALESCE(sp.target_role, '') LIKE ?)";
    const searchValues = isStudentId ? [Number(term), like, like] : [like, like, like];
    const rows = await query(
      `SELECT ${studentFields()}, c.id connection_id,
              CASE
                WHEN c.id IS NULL THEN 'none'
                WHEN c.status='accepted' THEN 'connected'
                WHEN c.requested_by_id=? THEN 'outgoing'
                ELSE 'incoming'
              END connection_status
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id=u.id
       LEFT JOIN student_connections c ON (c.user_a_id=? AND c.user_b_id=u.id)
                                      OR (c.user_b_id=? AND c.user_a_id=u.id)
       WHERE u.role='student' AND u.status='active' AND u.id<>? ${searchSql}
       ORDER BY CASE WHEN u.id=? THEN 0 ELSE 1 END, u.name ASC
       LIMIT 20`,
      [req.user.id, req.user.id, req.user.id, req.user.id, ...searchValues, isStudentId ? Number(term) : 0],
    );
    res.json(rows.map((student) => ({
      ...student,
      student_id: Number(student.student_id),
      connection_id: student.connection_id == null ? null : Number(student.connection_id),
    })));
  } catch (error) { next(error); }
});

router.post("/connections", async (req, res, next) => {
  let connection;
  try {
    const targetId = toId(req.body.studentId);
    if (!targetId) return res.status(400).json({ error: "Choose a valid student" });
    if (targetId === req.user.id) return res.status(400).json({ error: "You cannot add yourself" });
    const [userAId, userBId] = pairFor(req.user.id, targetId);

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [targetRows] = await connection.execute(
      "SELECT id FROM users WHERE id=? AND role='student' AND status='active' FOR UPDATE",
      [targetId],
    );
    if (!targetRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Student not found" });
    }
    const [existingRows] = await connection.execute(
      "SELECT id, requested_by_id, status FROM student_connections WHERE user_a_id=? AND user_b_id=? FOR UPDATE",
      [userAId, userBId],
    );
    const existing = existingRows[0];
    if (existing?.status === "accepted") {
      await connection.rollback();
      return res.status(409).json({ error: "You are already connected with this student" });
    }
    if (existing?.requested_by_id === req.user.id) {
      await connection.rollback();
      return res.status(409).json({ error: "Connection request already sent" });
    }
    if (existing) {
      await connection.execute(
        "UPDATE student_connections SET status='accepted', accepted_at=NOW() WHERE id=?",
        [existing.id],
      );
      await connection.commit();
      return res.json({
        id: Number(existing.id),
        status: "accepted",
        message: "You are now connected. Start a conversation anytime.",
      });
    }

    const [result] = await connection.execute(
      "INSERT INTO student_connections (user_a_id, user_b_id, requested_by_id, status) VALUES (?, ?, ?, 'pending')",
      [userAId, userBId, req.user.id],
    );
    await connection.commit();
    res.status(201).json({ id: Number(result.insertId), status: "pending", message: "Connection request sent" });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

router.get("/connections", async (req, res, next) => {
  try {
    const [connections, incomingRequests] = await Promise.all([
      query(
        `SELECT c.id connection_id, c.created_at, c.accepted_at,
                ${studentFields()},
                latest_message.body last_message, message_summary.last_message_at,
                COALESCE(message_summary.unread_count, 0) unread_count
         FROM student_connections c
         JOIN users u ON u.id=CASE WHEN c.user_a_id=? THEN c.user_b_id ELSE c.user_a_id END
         LEFT JOIN student_profiles sp ON sp.user_id=u.id
         LEFT JOIN (
           SELECT connection_id, MAX(id) latest_message_id, MAX(created_at) last_message_at,
                  SUM(CASE WHEN recipient_id=? AND read_at IS NULL THEN 1 ELSE 0 END) unread_count
           FROM student_messages
           GROUP BY connection_id
         ) message_summary ON message_summary.connection_id=c.id
         LEFT JOIN student_messages latest_message ON latest_message.id=message_summary.latest_message_id
         WHERE c.status='accepted' AND (c.user_a_id=? OR c.user_b_id=?)
         ORDER BY COALESCE(message_summary.last_message_at, c.accepted_at, c.created_at) DESC`,
        [req.user.id, req.user.id, req.user.id, req.user.id],
      ),
      query(
        `SELECT c.id connection_id, c.created_at, ${studentFields()}
         FROM student_connections c
         JOIN users u ON u.id=c.requested_by_id
         LEFT JOIN student_profiles sp ON sp.user_id=u.id
         WHERE c.status='pending' AND c.requested_by_id<>? AND (c.user_a_id=? OR c.user_b_id=?)
         ORDER BY c.created_at DESC`,
        [req.user.id, req.user.id, req.user.id],
      ),
    ]);
    const normalise = (record) => ({
      ...record,
      connection_id: Number(record.connection_id),
      student_id: Number(record.student_id),
      unread_count: Number(record.unread_count || 0),
    });
    res.json({
      connections: connections.map(normalise),
      incomingRequests: incomingRequests.map(normalise),
      unreadCount: connections.reduce((total, item) => total + Number(item.unread_count || 0), 0),
    });
  } catch (error) { next(error); }
});

router.patch("/connections/:id", async (req, res, next) => {
  try {
    const connectionId = toId(req.params.id);
    const action = cleanText(req.body.action, 20);
    if (!connectionId || !["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "Choose accept or decline" });
    }
    const connection = await getConnectionForStudent(connectionId, req.user.id);
    if (!connection) return res.status(404).json({ error: "Connection request not found" });
    if (connection.status !== "pending" || Number(connection.requested_by_id) === req.user.id) {
      return res.status(409).json({ error: "This request is no longer awaiting your response" });
    }
    if (action === "accept") {
      await query("UPDATE student_connections SET status='accepted', accepted_at=NOW() WHERE id=?", [connectionId]);
      return res.json({ id: connectionId, status: "accepted", message: "Connection accepted. You can now message each other." });
    }
    await query("DELETE FROM student_connections WHERE id=?", [connectionId]);
    res.json({ id: connectionId, status: "declined", message: "Connection request declined" });
  } catch (error) { next(error); }
});

router.delete("/connections/:id", async (req, res, next) => {
  try {
    const connectionId = toId(req.params.id);
    if (!connectionId) return res.status(400).json({ error: "Choose a valid connection" });
    const connection = await getConnectionForStudent(connectionId, req.user.id);
    if (!connection) return res.status(404).json({ error: "Connection not found" });
    await query("DELETE FROM student_connections WHERE id=?", [connectionId]);
    res.json({ message: connection.status === "accepted" ? "Connection removed" : "Connection request cancelled" });
  } catch (error) { next(error); }
});

router.get("/conversations/:connectionId/messages", async (req, res, next) => {
  try {
    const connectionId = toId(req.params.connectionId);
    if (!connectionId) return res.status(400).json({ error: "Choose a valid conversation" });
    const connection = await getConnectionForStudent(connectionId, req.user.id, { acceptedOnly: true });
    if (!connection) return res.status(404).json({ error: "Conversation not found" });
    await query(
      "UPDATE student_messages SET read_at=NOW() WHERE connection_id=? AND recipient_id=? AND read_at IS NULL",
      [connectionId, req.user.id],
    );
    const messages = await query(
      `SELECT id, connection_id, sender_id, recipient_id, body, read_at, created_at
       FROM student_messages WHERE connection_id=? ORDER BY created_at ASC, id ASC LIMIT 200`,
      [connectionId],
    );
    res.json(messages.map((message) => ({
      ...message,
      id: Number(message.id),
      connection_id: Number(message.connection_id),
      sender_id: Number(message.sender_id),
      recipient_id: Number(message.recipient_id),
    })));
  } catch (error) { next(error); }
});

router.post("/conversations/:connectionId/messages", async (req, res, next) => {
  try {
    const connectionId = toId(req.params.connectionId);
    const body = cleanText(req.body.body, 2000);
    if (!connectionId) return res.status(400).json({ error: "Choose a valid conversation" });
    if (!body) return res.status(400).json({ error: "Write a message before sending" });
    const connection = await getConnectionForStudent(connectionId, req.user.id, { acceptedOnly: true });
    if (!connection) return res.status(404).json({ error: "Conversation not found" });
    const recipientId = Number(connection.user_a_id) === req.user.id
      ? Number(connection.user_b_id)
      : Number(connection.user_a_id);
    const result = await query(
      "INSERT INTO student_messages (connection_id, sender_id, recipient_id, body) VALUES (?, ?, ?, ?)",
      [connectionId, req.user.id, recipientId, body],
    );
    const [message] = await query(
      "SELECT id, connection_id, sender_id, recipient_id, body, read_at, created_at FROM student_messages WHERE id=? LIMIT 1",
      [result.insertId],
    );
    res.status(201).json({
      ...message,
      id: Number(message.id),
      connection_id: Number(message.connection_id),
      sender_id: Number(message.sender_id),
      recipient_id: Number(message.recipient_id),
    });
  } catch (error) { next(error); }
});

module.exports = router;
