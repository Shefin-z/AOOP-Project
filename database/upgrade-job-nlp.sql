-- Deterministic NLP baseline fields. Run once after upgrade-job-recommendation.sql.
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS normalized_role VARCHAR(180) NULL AFTER validation_status,
  ADD COLUMN IF NOT EXISTS extracted_skills TEXT NULL AFTER normalized_role,
  ADD COLUMN IF NOT EXISTS nlp_status VARCHAR(30) NOT NULL DEFAULT 'pending' AFTER extracted_skills,
  ADD COLUMN IF NOT EXISTS nlp_confidence DECIMAL(5,2) NULL AFTER nlp_status,
  ADD COLUMN IF NOT EXISTS nlp_processed_at DATETIME NULL AFTER nlp_confidence;
