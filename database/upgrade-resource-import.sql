USE careerforge;

-- Tracks the origin of imported learning resources and prevents a source item
-- from appearing more than once in the administrator review queue.
ALTER TABLE learning_resources ADD COLUMN IF NOT EXISTS source VARCHAR(40) NULL AFTER created_by;
ALTER TABLE learning_resources ADD COLUMN IF NOT EXISTS external_id VARCHAR(120) NULL AFTER source;
ALTER TABLE learning_resources ADD UNIQUE KEY uq_resources_external_source (source, external_id);
