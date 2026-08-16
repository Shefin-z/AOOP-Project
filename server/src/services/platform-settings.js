const { query } = require("../config/db");

const defaultSettings = Object.freeze({
  general: {
    platformName: "CareerCube",
    supportEmail: "support@careercube.com",
    timezone: "Asia/Dhaka",
    locale: "English (Bangladesh)",
  },
  features: {
    registrationEnabled: true,
    coverLetterEnabled: true,
    communityPostingEnabled: true,
    maintenanceMode: false,
  },
  security: {
    minimumPasswordLength: 8,
    requireUppercase: false,
    requireNumber: false,
    sessionHours: 168,
  },
  email: {
    senderName: "CareerCube",
    replyTo: "support@careercube.com",
    welcomeSubject: "Welcome to CareerCube",
    welcomeBody: "Welcome {{name}}. Your CareerCube student workspace is ready.",
    applicationSubject: "Application received for {{job_title}}",
    applicationBody: "Hi {{name}}, your application for {{job_title}} has been received.",
  },
  integrations: {
    supportPortalUrl: "",
    careerPageUrl: "",
    webhookUrl: "",
    webhookEnabled: false,
  },
  ai: {
    jobRecommendationsEnabled: true,
    contentModerationEnabled: true,
    moderationThreshold: 38,
    coverLetterTone: "Professional",
  },
});

let schemaPromise;
let cachedSettings;
let cacheExpiresAt = 0;

const replaceLegacyBrand = (value) => {
  if (Array.isArray(value)) return value.map(replaceLegacyBrand);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceLegacyBrand(item)]));
  }
  return typeof value === "string"
    ? value.replaceAll("CareerForge", "CareerCube").replaceAll("careerforge.com", "careercube.com")
    : value;
};

async function migrateLegacyBrandSettings() {
  const [row] = await query("SELECT setting_value FROM platform_settings WHERE setting_key='platform' LIMIT 1");
  if (!row) return;
  const raw = typeof row.setting_value === "string" ? row.setting_value : JSON.stringify(row.setting_value);
  if (!/CareerForge|careerforge\.com/.test(raw)) return;
  let settings;
  try {
    settings = typeof row.setting_value === "string" ? JSON.parse(row.setting_value) : row.setting_value;
  } catch {
    return;
  }
  await query(
    "UPDATE platform_settings SET setting_value=?, updated_at=NOW() WHERE setting_key='platform'",
    [JSON.stringify(replaceLegacyBrand(settings))],
  );
  cachedSettings = null;
  cacheExpiresAt = 0;
}

const deepMerge = (base, override = {}) => Object.fromEntries(
  Object.entries(base).map(([key, value]) => [
    key,
    value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(value, override?.[key] && typeof override[key] === "object" ? override[key] : {})
      : override?.[key] ?? value,
  ]),
);

async function ensureSettingsSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await query(
        `CREATE TABLE IF NOT EXISTS platform_settings (
          setting_key VARCHAR(80) PRIMARY KEY,
          setting_value JSON NOT NULL,
          updated_by BIGINT UNSIGNED NULL,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      );
      await query(
        `INSERT INTO platform_settings (setting_key, setting_value)
         VALUES ('platform', ?)
         ON DUPLICATE KEY UPDATE setting_key=VALUES(setting_key)`,
        [JSON.stringify(defaultSettings)],
      );
      await migrateLegacyBrandSettings();
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

function parseSettings(value) {
  if (!value) return defaultSettings;
  if (typeof value === "object") return deepMerge(defaultSettings, value);
  try {
    return deepMerge(defaultSettings, JSON.parse(value));
  } catch {
    return defaultSettings;
  }
}

async function getPlatformSettings({ fresh = false } = {}) {
  if (!fresh && cachedSettings && cacheExpiresAt > Date.now()) return cachedSettings;
  await ensureSettingsSchema();
  const [row] = await query(
    "SELECT setting_value, updated_at FROM platform_settings WHERE setting_key='platform' LIMIT 1",
  );
  cachedSettings = parseSettings(row?.setting_value);
  cacheExpiresAt = Date.now() + 10_000;
  return cachedSettings;
}

async function savePlatformSettings(settings, adminId) {
  await ensureSettingsSchema();
  const merged = deepMerge(defaultSettings, settings);
  await query(
    `UPDATE platform_settings
     SET setting_value=?, updated_by=?, updated_at=NOW()
     WHERE setting_key='platform'`,
    [JSON.stringify(merged), adminId || null],
  );
  cachedSettings = merged;
  cacheExpiresAt = Date.now() + 10_000;
  return merged;
}

module.exports = {
  defaultSettings,
  ensureSettingsSchema,
  getPlatformSettings,
  savePlatformSettings,
};
