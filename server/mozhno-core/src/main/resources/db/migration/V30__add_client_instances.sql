CREATE TABLE IF NOT EXISTS client_instances (
    id              BIGSERIAL PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    environment_id  INTEGER NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    api_key_id      INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
    app_name        VARCHAR(128) NOT NULL,
    instance_id     VARCHAR(128) NOT NULL,
    app_type        VARCHAR(16) NOT NULL DEFAULT 'java',
    sdk_version     VARCHAR(32),
    key_type        VARCHAR(16) NOT NULL DEFAULT 'SERVER',
    first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_instances_unique
    ON client_instances (project_id, environment_id, app_name, instance_id);
