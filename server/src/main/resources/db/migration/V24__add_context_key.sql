ALTER TABLE context_definitions ADD COLUMN IF NOT EXISTS context_key VARCHAR(255);
UPDATE context_definitions SET context_key = name WHERE context_key IS NULL;
ALTER TABLE context_definitions ALTER COLUMN context_key SET NOT NULL;
ALTER TABLE context_definitions ADD CONSTRAINT uq_context_definitions_key UNIQUE (project_id, context_key);
