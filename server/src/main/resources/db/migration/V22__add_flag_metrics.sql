CREATE TABLE IF NOT EXISTS flag_metrics (
    id BIGSERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    flag_id INTEGER NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
    environment_id INTEGER NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    evaluation_count BIGINT NOT NULL DEFAULT 1,
    time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(flag_id, environment_id, time_bucket)
);

CREATE INDEX IF NOT EXISTS idx_flag_metrics_project_time ON flag_metrics(project_id, time_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_flag_metrics_flag_time ON flag_metrics(flag_id, time_bucket DESC);
