ALTER TABLE flag_metrics ADD COLUMN IF NOT EXISTS evaluation_true_count BIGINT NOT NULL DEFAULT 0;
ALTER TABLE flag_metrics ADD COLUMN IF NOT EXISTS evaluation_false_count BIGINT NOT NULL DEFAULT 0;

UPDATE flag_metrics SET evaluation_false_count = evaluation_count WHERE evaluation_true_count = 0 AND evaluation_false_count = 0;

ALTER TABLE flag_metrics DROP COLUMN IF EXISTS evaluation_count;

CREATE INDEX IF NOT EXISTS idx_flag_metrics_project_env_time ON flag_metrics(project_id, environment_id, time_bucket DESC);
