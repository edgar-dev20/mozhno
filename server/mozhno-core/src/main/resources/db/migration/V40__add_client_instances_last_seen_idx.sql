CREATE INDEX IF NOT EXISTS idx_client_instances_last_seen
    ON client_instances (last_seen_at);
