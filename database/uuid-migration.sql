USE careerforge;

-- Keep numeric primary keys for internal joins, and add stable public identifiers.
ALTER TABLE users ADD COLUMN public_uuid CHAR(36) NULL AFTER id;
UPDATE users SET public_uuid = UUID() WHERE public_uuid IS NULL;
ALTER TABLE users
  MODIFY public_uuid CHAR(36) NOT NULL,
  ADD UNIQUE KEY uq_users_public_uuid (public_uuid);

ALTER TABLE jobs ADD COLUMN public_uuid CHAR(36) NULL AFTER id;
UPDATE jobs SET public_uuid = UUID() WHERE public_uuid IS NULL;
ALTER TABLE jobs
  MODIFY public_uuid CHAR(36) NOT NULL,
  ADD UNIQUE KEY uq_jobs_public_uuid (public_uuid);

ALTER TABLE applications ADD COLUMN public_uuid CHAR(36) NULL AFTER id;
UPDATE applications SET public_uuid = UUID() WHERE public_uuid IS NULL;
ALTER TABLE applications
  MODIFY public_uuid CHAR(36) NOT NULL,
  ADD UNIQUE KEY uq_applications_public_uuid (public_uuid);
