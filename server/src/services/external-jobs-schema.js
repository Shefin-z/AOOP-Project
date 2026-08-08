const { query } = require("../config/db");

let schemaPromise;

async function buildExternalJobsSchema() {
  await query(
    `CREATE TABLE IF NOT EXISTS external_jobs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(40) NOT NULL,
      source_job_id VARCHAR(190) NOT NULL,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NULL,
      location VARCHAR(255) NULL,
      workplace_type VARCHAR(40) NULL,
      employment_type VARCHAR(80) NULL,
      category VARCHAR(120) NULL,
      description TEXT NULL,
      requirements TEXT NULL,
      salary_text VARCHAR(255) NULL,
      source_url VARCHAR(1000) NOT NULL,
      source_updated_at DATETIME NULL,
      first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      active_until DATETIME NOT NULL,
      payload_hash CHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_external_jobs_source_id (source, source_job_id),
      INDEX idx_external_jobs_active (source, active_until),
      INDEX idx_external_jobs_updated (source_updated_at)
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS external_job_fetches (
      source VARCHAR(40) NOT NULL,
      request_key CHAR(64) NOT NULL,
      last_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_fetched_at DATETIME NULL,
      total_count INT UNSIGNED NOT NULL DEFAULT 0,
      last_error VARCHAR(500) NULL,
      PRIMARY KEY (source, request_key)
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS external_job_match_insights (
      user_id BIGINT UNSIGNED NOT NULL,
      external_job_id BIGINT UNSIGNED NOT NULL,
      profile_signature CHAR(64) NOT NULL,
      job_signature CHAR(64) NOT NULL,
      reasons JSON NOT NULL,
      skill_gaps JSON NOT NULL,
      generated_model VARCHAR(180) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      PRIMARY KEY (user_id, external_job_id, profile_signature, job_signature),
      INDEX idx_external_match_insights_lookup (user_id, profile_signature, expires_at),
      CONSTRAINT fk_external_match_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_external_match_job FOREIGN KEY (external_job_id) REFERENCES external_jobs(id) ON DELETE CASCADE
    )`,
  );
}

async function ensureExternalJobsSchema() {
  if (!schemaPromise) {
    schemaPromise = buildExternalJobsSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureExternalJobsSchema };
