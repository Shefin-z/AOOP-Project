USE careerforge;

-- Existing databases created before job-match explanations need this column
-- for the application list and match details API.
ALTER TABLE applications
  ADD COLUMN match_explanation JSON NULL AFTER cv_snapshot;
