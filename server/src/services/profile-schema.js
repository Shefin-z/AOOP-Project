const { query } = require("../config/db");

let schemaPromise;

async function buildProfileSchema() {
  await query("ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS avatar_data LONGTEXT NULL AFTER avatar_url");
  await query("ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS career_interests JSON NULL AFTER target_role");
}

async function ensureProfileSchema() {
  if (!schemaPromise) {
    schemaPromise = buildProfileSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureProfileSchema };
