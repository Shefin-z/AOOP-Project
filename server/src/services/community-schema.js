const { query } = require("../config/db");

let schemaPromise;

async function buildCommunitySchema() {
  await query("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS link_url VARCHAR(500) NULL AFTER media_url");
  await query("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS risk_score TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER status");
  await query(
    "ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS risk_label ENUM('safe', 'spam', 'fraud', 'suspicious') NOT NULL DEFAULT 'safe' AFTER risk_score",
  );
  await query("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS risk_reasons JSON NULL AFTER risk_label");
  await query("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS reviewed_by BIGINT UNSIGNED NULL AFTER risk_reasons");
  await query("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL AFTER reviewed_by");
  await query(
    `CREATE TABLE IF NOT EXISTS post_shares (
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      CONSTRAINT fk_shares_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      CONSTRAINT fk_shares_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  );
}

async function ensureCommunitySchema() {
  if (!schemaPromise) {
    schemaPromise = buildCommunitySchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

module.exports = { ensureCommunitySchema };
