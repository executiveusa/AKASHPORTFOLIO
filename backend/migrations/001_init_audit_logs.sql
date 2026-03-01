-- Create audit_logs table for tracking all Synthia decisions and operations
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    agent_system TEXT NOT NULL,  -- 'synthia' | 'agent-zero' | 'openclaw'
    task_id UUID,
    user_id TEXT,
    details JSONB,
    decision_chain JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_agent_system (agent_system),
    INDEX idx_task_id (task_id)
);

COMMENT ON TABLE audit_logs IS 'Complete audit trail of Synthia autonomous decisions';
COMMENT ON COLUMN audit_logs.agent_system IS 'Which agent system initiated this action';
COMMENT ON COLUMN audit_logs.decision_chain IS 'Full decision tree with reasoning for complex decisions';
