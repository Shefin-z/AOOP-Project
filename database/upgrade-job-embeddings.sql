-- Gemini embedding storage. Vectors are JSON to remain compatible with the current MariaDB setup.
CREATE TABLE IF NOT EXISTS job_embeddings (
  job_id BIGINT UNSIGNED PRIMARY KEY,
  model VARCHAR(80) NOT NULL,
  dimensions INT UNSIGNED NOT NULL,
  vector_json LONGTEXT NOT NULL,
  content_hash CHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message VARCHAR(500) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_embeddings_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS profile_embeddings (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  model VARCHAR(80) NOT NULL,
  dimensions INT UNSIGNED NOT NULL,
  vector_json LONGTEXT NOT NULL,
  content_hash CHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message VARCHAR(500) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_embeddings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
