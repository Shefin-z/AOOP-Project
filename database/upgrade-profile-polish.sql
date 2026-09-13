-- Run this once for an existing CareerForge database.
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS skills TEXT NULL AFTER bio,
  ADD COLUMN IF NOT EXISTS hobbies TEXT NULL AFTER skills;
