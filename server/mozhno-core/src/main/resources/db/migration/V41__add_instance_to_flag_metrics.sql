ALTER TABLE flag_metrics DROP CONSTRAINT IF EXISTS flag_metrics_flag_id_environment_id_time_bucket_key;
DROP INDEX IF EXISTS flag_metrics_flag_id_environment_id_time_bucket_key;

ALTER TABLE flag_metrics ADD COLUMN IF NOT EXISTS client_instance_id BIGINT
    REFERENCES client_instances(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_flag_metrics_agg_unique
    ON flag_metrics(flag_id, environment_id, time_bucket)
    WHERE client_instance_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_flag_metrics_inst_unique
    ON flag_metrics(flag_id, environment_id, time_bucket, client_instance_id)
    WHERE client_instance_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_flag_metrics_inst_id
    ON flag_metrics(client_instance_id, time_bucket DESC);

CREATE INDEX IF NOT EXISTS idx_client_instances_app_name
    ON client_instances(app_name);
