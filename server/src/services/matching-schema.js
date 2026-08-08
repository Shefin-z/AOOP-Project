const { query } = require("../config/db");

let schemaPromise;

async function buildMatchingSchema() {
  await query(
    `CREATE TABLE IF NOT EXISTS skills (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL DEFAULT 'CareerForge skills',
      description TEXT NULL
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS user_skills (
      user_id BIGINT UNSIGNED NOT NULL,
      skill_id BIGINT UNSIGNED NOT NULL,
      score DECIMAL(5,2) NOT NULL DEFAULT 50,
      source ENUM('profile', 'assessment', 'admin') NOT NULL DEFAULT 'profile',
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, skill_id),
      CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS job_skills (
      job_id BIGINT UNSIGNED NOT NULL,
      skill_id BIGINT UNSIGNED NOT NULL,
      weight DECIMAL(4,3) NOT NULL DEFAULT 1,
      required_score DECIMAL(5,2) NOT NULL DEFAULT 50,
      PRIMARY KEY (job_id, skill_id),
      CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS job_match_insights (
      user_id BIGINT UNSIGNED NOT NULL,
      job_id BIGINT UNSIGNED NOT NULL,
      profile_signature CHAR(64) NOT NULL,
      job_signature CHAR(64) NOT NULL,
      reasons JSON NOT NULL,
      skill_gaps JSON NOT NULL,
      generated_model VARCHAR(180) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      PRIMARY KEY (user_id, job_id, profile_signature, job_signature),
      INDEX idx_job_match_insights_lookup (user_id, profile_signature, expires_at),
      CONSTRAINT fk_job_match_insights_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_job_match_insights_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )`,
  );
}

async function ensureMatchingSchema() {
  if (!schemaPromise) {
    schemaPromise = buildMatchingSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureMatchingSchema };
