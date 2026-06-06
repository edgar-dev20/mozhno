ALTER TABLE context_definitions ADD COLUMN IF NOT EXISTS context_type VARCHAR(50) NOT NULL DEFAULT 'string';
