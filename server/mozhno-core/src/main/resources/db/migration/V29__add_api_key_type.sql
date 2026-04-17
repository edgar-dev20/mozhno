ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_type VARCHAR(16) NOT NULL DEFAULT 'SERVER';

CREATE INDEX IF NOT EXISTS idx_api_keys_key_type ON api_keys(key_type);
