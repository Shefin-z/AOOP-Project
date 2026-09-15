USE careerforge;

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS experience_years TINYINT UNSIGNED NULL AFTER graduation_year;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS min_experience_years TINYINT UNSIGNED NULL AFTER expiry_date;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_experience_years TINYINT UNSIGNED NULL AFTER min_experience_years;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_published_at DATETIME NULL AFTER max_experience_years;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_verified_at DATETIME NULL AFTER source_published_at;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS validation_status ENUM('unknown', 'valid', 'needs_review', 'invalid') NOT NULL DEFAULT 'unknown' AFTER last_verified_at;
ALTER TABLE jobs MODIFY COLUMN location VARCHAR(500) NULL;
