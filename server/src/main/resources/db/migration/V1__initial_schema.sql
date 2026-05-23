CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE flags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    flag_key VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, flag_key)
);

CREATE TABLE flag_strategies (
    id SERIAL PRIMARY KEY,
    flag_id INTEGER NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
    strategy_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    percentage DOUBLE PRECISION,
    context_key VARCHAR(255),
    segment_value VARCHAR(255),
    segment_percentage DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flags_project_id ON flags(project_id);
CREATE INDEX idx_flag_strategies_flag_id ON flag_strategies(flag_id);