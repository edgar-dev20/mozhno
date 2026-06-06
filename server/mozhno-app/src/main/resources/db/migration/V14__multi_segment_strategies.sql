-- Join table for multi-segment strategies
CREATE TABLE strategy_segments (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    segment_id INTEGER NOT NULL,
    CONSTRAINT fk_strategy_segments_strategy FOREIGN KEY (strategy_id) REFERENCES flag_strategies(id) ON DELETE CASCADE,
    CONSTRAINT fk_strategy_segments_segment FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
    CONSTRAINT uk_strategy_segment UNIQUE (strategy_id, segment_id)
);
CREATE INDEX idx_strategy_segments_strategy_id ON strategy_segments(strategy_id);
CREATE INDEX idx_strategy_segments_segment_id ON strategy_segments(segment_id);

-- Migrate existing single-segment data
INSERT INTO strategy_segments (strategy_id, segment_id)
    SELECT id, segment_id FROM flag_strategies WHERE segment_id IS NOT NULL;

-- Drop the old column + constraint
ALTER TABLE flag_strategies DROP CONSTRAINT IF EXISTS fk_flag_strategies_segment;
ALTER TABLE flag_strategies DROP COLUMN IF EXISTS segment_id;