USE careerforge;

-- Resource cards can show a visual preview and make administrator picks explicit.
ALTER TABLE learning_resources
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(600) NULL AFTER resource_url,
  ADD COLUMN IF NOT EXISTS provider_name VARCHAR(160) NULL AFTER thumbnail_url,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE AFTER provider_name,
  ADD COLUMN IF NOT EXISTS recommendation_note VARCHAR(300) NULL AFTER featured;
