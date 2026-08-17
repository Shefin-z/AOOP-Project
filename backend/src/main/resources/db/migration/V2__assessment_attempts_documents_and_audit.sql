ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS expires_at DATETIME NULL AFTER started_at,
  ADD COLUMN IF NOT EXISTS status ENUM('started', 'submitted', 'expired') NOT NULL DEFAULT 'submitted' AFTER completed_at;

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS correct_answer TEXT NULL AFTER explanation;

CREATE TABLE IF NOT EXISTS assessment_answers (
  attempt_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  option_id BIGINT UNSIGNED NULL,
  answer_text TEXT NULL,
  is_correct BOOLEAN NULL,
  awarded_points DECIMAL(7,2) NOT NULL DEFAULT 0,
  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_id, question_id),
  CONSTRAINT fk_assessment_answers_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_assessment_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_assessment_answers_option FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE SET NULL
);

ALTER TABLE student_documents
  ADD COLUMN IF NOT EXISTS size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER content_type,
  ADD COLUMN IF NOT EXISTS file_data LONGTEXT NULL AFTER storage_path;

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS reason VARCHAR(500) NULL AFTER action;
