-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Environments table
CREATE TABLE environments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_environments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX idx_environments_project_id ON environments(project_id);
-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tags_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX idx_tags_project_id ON tags(project_id);
-- Context definitions table
CREATE TABLE context_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_context_definitions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX idx_context_definitions_project_id ON context_definitions(project_id);
-- Context values table
CREATE TABLE context_values (
    id SERIAL PRIMARY KEY,
    context_definition_id INTEGER NOT NULL,
    context_values TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_context_values_definition FOREIGN KEY (context_definition_id) REFERENCES context_definitions(id) ON DELETE CASCADE
);
CREATE INDEX idx_context_values_definition_id ON context_values(context_definition_id);
-- Flags table (includes flag_type column)
CREATE TABLE flags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    flag_key VARCHAR(255) NOT NULL,
    description TEXT,
    flag_type VARCHAR(20) NOT NULL DEFAULT 'RELEASE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flags_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uk_flags_project_key UNIQUE (project_id, flag_key)
);
CREATE INDEX idx_flags_project_id ON flags(project_id);
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

-- Flag strategies table
CREATE TABLE flag_strategies (
    id SERIAL PRIMARY KEY,
    flag_id INTEGER NOT NULL,
    environment_id INTEGER NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    percentage DOUBLE PRECISION,
    rollout_percentage DOUBLE PRECISION,
    context_definition_id INTEGER,
    context_values_json TEXT,
    segment_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flag_strategies_flag FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE,
    CONSTRAINT fk_flag_strategies_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);
CREATE INDEX idx_flag_strategies_flag_id ON flag_strategies(flag_id);
CREATE INDEX idx_flag_strategies_environment_id ON flag_strategies(environment_id);
CREATE INDEX idx_flag_strategies_segment_id ON flag_strategies(segment_id);

-- Flag tag values table (many-to-many with values)
CREATE TABLE flag_tag_values (
    id SERIAL PRIMARY KEY,
    flag_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    tag_value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_flag_tag_values_flag FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE,
    CONSTRAINT fk_flag_tag_values_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT uk_flag_tag UNIQUE (flag_id, tag_id)
);
CREATE INDEX idx_flag_tag_values_flag_id ON flag_tag_values(flag_id);
CREATE INDEX idx_flag_tag_values_tag_id ON flag_tag_values(tag_id);