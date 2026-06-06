ALTER TABLE segment_contexts ADD COLUMN IF NOT EXISTS operator VARCHAR(20) NOT NULL DEFAULT 'in';

-- Drop the old unique constraint so we can add a new one that includes operator.
-- This allows the same segment to have multiple rules for the same context field with different operators (e.g. userId IN [...] AND userId NOT_IN [...]).
ALTER TABLE segment_contexts DROP CONSTRAINT IF EXISTS uk_segment_context;
ALTER TABLE segment_contexts ADD CONSTRAINT uk_segment_context UNIQUE (segment_id, context_definition_id, operator);