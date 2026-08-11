const { query } = require("../config/db");

let schemaPromise;

async function buildEventSchema() {
  await query("ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER status");
  await query("ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
}

async function ensureEventSchema() {
  if (!schemaPromise) {
    schemaPromise = buildEventSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureEventSchema };
