const { query } = require("../config/db");

let schemaPromise;

async function ensureJobSchema() {
  if (!schemaPromise) {
    schemaPromise = query(
      "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER expires_at",
    ).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureJobSchema };
