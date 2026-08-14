const { query } = require("../config/db");

let schemaPromise;

async function buildStudentNetworkSchema() {
  await query(
    `CREATE TABLE IF NOT EXISTS student_connections (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_a_id BIGINT UNSIGNED NOT NULL,
      user_b_id BIGINT UNSIGNED NOT NULL,
      requested_by_id BIGINT UNSIGNED NOT NULL,
      status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
      accepted_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_connection_pair (user_a_id, user_b_id),
      INDEX idx_student_connections_requested (requested_by_id, status),
      INDEX idx_student_connections_status (status, updated_at),
      CONSTRAINT chk_student_connection_pair CHECK (user_a_id < user_b_id),
      CONSTRAINT fk_student_connections_user_a FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_student_connections_user_b FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_student_connections_requester FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS student_messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      connection_id BIGINT UNSIGNED NOT NULL,
      sender_id BIGINT UNSIGNED NOT NULL,
      recipient_id BIGINT UNSIGNED NOT NULL,
      body VARCHAR(2000) NOT NULL,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student_messages_connection (connection_id, created_at),
      INDEX idx_student_messages_recipient_unread (recipient_id, read_at),
      CONSTRAINT fk_student_messages_connection FOREIGN KEY (connection_id) REFERENCES student_connections(id) ON DELETE CASCADE,
      CONSTRAINT fk_student_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_student_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  );
  await query(
    "ALTER TABLE student_connections ADD COLUMN IF NOT EXISTS id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE FIRST",
  );
  await query(
    "ALTER TABLE student_messages ADD COLUMN IF NOT EXISTS id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE FIRST",
  );
}

async function ensureStudentNetworkSchema() {
  if (!schemaPromise) {
    schemaPromise = buildStudentNetworkSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureStudentNetworkSchema };
