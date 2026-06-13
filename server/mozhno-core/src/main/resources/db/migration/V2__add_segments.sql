-- Segments table
CREATE TABLE segments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_segments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX idx_segments_project_id ON segments(project_id);

-- Segment contexts table (AND condition between rows)
CREATE TABLE segment_contexts (
    id SERIAL PRIMARY KEY,
    segment_id INTEGER NOT NULL,
    context_definition_id INTEGER NOT NULL,
    context_values TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_segment_contexts_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
    CONSTRAINT fk_segment_contexts_definition FOREIGN KEY (context_definition_id) REFERENCES context_definitions(id) ON DELETE CASCADE,
    CONSTRAINT uk_segment_context UNIQUE (segment_id, context_definition_id)
);
CREATE INDEX idx_segment_contexts_segment_id ON segment_contexts(segment_id);
CREATE INDEX idx_segment_contexts_definition_id ON segment_contexts(context_definition_id);

-- Add segment_id to flag_strategies
ALTER TABLE flag_strategies ADD COLUMN segment_id INTEGER;
ALTER TABLE flag_strategies ADD CONSTRAINT fk_flag_strategies_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL;
CREATE INDEX idx_flag_strategies_segment_id ON flag_strategies(segment_id);