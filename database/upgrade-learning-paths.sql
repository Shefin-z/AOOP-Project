-- Run this once for an existing CareerForge database.
CREATE TABLE IF NOT EXISTS learning_paths (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  topic VARCHAR(180) NOT NULL,
  path_type ENUM('skill', 'job') NOT NULL,
  level_count TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_learning_paths_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_learning_paths_user (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learning_levels (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path_id BIGINT UNSIGNED NOT NULL,
  level_number TINYINT UNSIGNED NOT NULL,
  question_set TEXT NULL,
  CONSTRAINT fk_learning_levels_path FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  CONSTRAINT uq_learning_level_number UNIQUE (path_id, level_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learning_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  correct_answers TINYINT UNSIGNED NOT NULL,
  total_questions TINYINT UNSIGNED NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers TEXT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_learning_attempts_level FOREIGN KEY (level_id) REFERENCES learning_levels(id) ON DELETE CASCADE,
  CONSTRAINT fk_learning_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_learning_attempts_progress (user_id, level_id, passed)
) ENGINE=InnoDB;
