-- Create agent_tasks table for tracking Agent Zero task execution
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_system TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,  -- pending|running|completed|failed
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    result JSONB,
    error_message TEXT,
    parent_task_id UUID,  -- For sub-agent tasks
    INDEX idx_status (status),
    INDEX idx_agent_system (agent_system),
    INDEX idx_started_at (started_at DESC),
    FOREIGN KEY (parent_task_id) REFERENCES agent_tasks(id)
);

COMMENT ON TABLE agent_tasks IS 'Tracks all Agent Zero task delegations and sub-agent work';
COMMENT ON COLUMN agent_tasks.status IS 'Task lifecycle: pending -> running -> completed/failed';
COMMENT ON COLUMN agent_tasks.parent_task_id IS 'For tracking sub-agent task hierarchies';
