-- Create memory_events table for tracking mem0 operations
CREATE TABLE IF NOT EXISTS memory_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation TEXT NOT NULL,  -- add|search|retrieve
    memory_id TEXT NOT NULL,
    context JSONB,
    similarity_score NUMERIC(3,2),
    agent_system TEXT,
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_operation (operation),
    INDEX idx_memory_id (memory_id)
);

COMMENT ON TABLE memory_events IS 'Tracks all mem0 semantic memory operations for observability';
COMMENT ON COLUMN memory_events.operation IS 'Type of memory operation: add, search, retrieve';
COMMENT ON COLUMN memory_events.similarity_score IS 'For search operations, the semantic similarity (0.00-1.00)';
