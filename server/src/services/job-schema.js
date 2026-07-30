const { query } = require("../config/db");

let schemaPromise;

async function buildJobSchema() {
  await query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER expires_at");
  await query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_snapshot JSON NULL AFTER resume_url");
  await query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_file_name VARCHAR(255) NULL AFTER resume_snapshot");
  await query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_file_type VARCHAR(100) NULL AFTER resume_file_name");
  await query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_file_data LONGTEXT NULL AFTER resume_file_type");
}

async function ensureJobSchema() {
  if (!schemaPromise) {
    schemaPromise = buildJobSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureJobSchema };
