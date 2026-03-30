-- ============================================================
-- HERALD Schema Migration
-- Applies on top of supabase-schema.sql (additive, no drops)
-- ============================================================

-- ----------------------------------------------------------------
-- PREREQUISITE: vibe_nodes + vibe_edges (used by vibe-graph.ts but
-- absent from the original supabase-schema.sql — added here)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vibe_nodes (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('agent','task','fact','memory','goal','resource','relationship')),
    owner_agent_id TEXT NOT NULL,
    label TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    superseded_by TEXT REFERENCES vibe_nodes(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS vibe_edges (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES vibe_nodes(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES vibe_nodes(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('depends_on','conflicts_with','related_to','owns','created','supersedes','references')),
    weight FLOAT DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vibe_nodes_kind ON vibe_nodes(kind);
CREATE INDEX IF NOT EXISTS idx_vibe_nodes_owner ON vibe_nodes(owner_agent_id);
CREATE INDEX IF NOT EXISTS idx_vibe_nodes_confidence ON vibe_nodes(confidence);
CREATE INDEX IF NOT EXISTS idx_vibe_edges_source ON vibe_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_vibe_edges_target ON vibe_edges(target_id);

-- Confidence decay function for vibe_nodes (referenced by vibe-graph.ts)
CREATE OR REPLACE FUNCTION decay_vibe_confidence(cutoff TIMESTAMP WITH TIME ZONE)
RETURNS void AS $$
BEGIN
    UPDATE vibe_nodes
    SET confidence = GREATEST(0.0, confidence * 0.90)
    WHERE last_verified_at < cutoff
      AND superseded_by IS NULL
      AND kind != 'resource'; -- tools don't decay on time
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- HERALD: Tool Registry
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tool_registrations (
    id TEXT PRIMARY KEY,
    tool_id TEXT UNIQUE NOT NULL,
    tool_name TEXT NOT NULL,
    executor_kind TEXT NOT NULL CHECK (executor_kind IN (
        'mcp_server', 'cli_script', 'cli_anything', 'postiz',
        'composio', 'rust_provider', 'http_api'
    )),
    executor_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    capabilities TEXT[] DEFAULT '{}',
    capability_embedding vector(384),
    cli_signature TEXT NOT NULL DEFAULT '',
    input_schema JSONB,
    output_schema JSONB,
    auth_required BOOLEAN DEFAULT false,
    auth_env_key TEXT,
    version TEXT DEFAULT '1.0.0',
    source_file TEXT,
    health_status TEXT DEFAULT 'unknown' CHECK (health_status IN (
        'healthy', 'degraded', 'offline', 'unknown'
    )),
    last_health_check TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_latency_ms INTEGER DEFAULT 0,
    quality_score FLOAT DEFAULT 0.5,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route decisions log (observable, feeds quality scores)
CREATE TABLE IF NOT EXISTS herald_route_log (
    id TEXT PRIMARY KEY,
    intent TEXT NOT NULL,
    selected_tool_id TEXT REFERENCES tool_registrations(tool_id),
    similarity_score FLOAT,
    executor_used TEXT,
    execution_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    agent_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector index for semantic tool routing
CREATE INDEX IF NOT EXISTS idx_tool_capability_embedding
    ON tool_registrations USING ivfflat (capability_embedding vector_cosine_ops)
    WITH (lists = 50);

CREATE INDEX IF NOT EXISTS idx_tool_executor ON tool_registrations(executor_kind);
CREATE INDEX IF NOT EXISTS idx_tool_health ON tool_registrations(health_status);
CREATE INDEX IF NOT EXISTS idx_tool_quality ON tool_registrations(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_route_log_agent ON herald_route_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_route_log_tool ON herald_route_log(selected_tool_id);

-- Quality score update function (called after each execution)
CREATE OR REPLACE FUNCTION update_tool_quality_score(
    p_tool_id TEXT,
    p_success BOOLEAN,
    p_latency_ms INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE tool_registrations
    SET
        usage_count = usage_count + 1,
        success_count = success_count + (CASE WHEN p_success THEN 1 ELSE 0 END),
        error_count = error_count + (CASE WHEN p_success THEN 0 ELSE 1 END),
        avg_latency_ms = ((avg_latency_ms * usage_count) + p_latency_ms) / (usage_count + 1),
        quality_score = LEAST(1.0, GREATEST(0.0,
            (success_count::float + (CASE WHEN p_success THEN 1 ELSE 0 END)) /
            (usage_count + 1)
        )),
        updated_at = NOW()
    WHERE tool_id = p_tool_id;
END;
$$ LANGUAGE plpgsql;

-- Semantic search for tools by intent embedding
CREATE OR REPLACE FUNCTION search_tools_by_intent(
    intent_embedding vector(384),
    executor_filter TEXT DEFAULT NULL,
    min_quality FLOAT DEFAULT 0.3,
    result_count INT DEFAULT 5
) RETURNS TABLE(
    tool_id TEXT,
    tool_name TEXT,
    executor_kind TEXT,
    cli_signature TEXT,
    quality_score FLOAT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.tool_id,
        t.tool_name,
        t.executor_kind,
        t.cli_signature,
        t.quality_score,
        (1 - (t.capability_embedding <=> intent_embedding))::FLOAT AS similarity
    FROM tool_registrations t
    WHERE
        t.health_status != 'offline'
        AND t.quality_score >= min_quality
        AND (executor_filter IS NULL OR t.executor_kind = executor_filter)
        AND t.capability_embedding IS NOT NULL
    ORDER BY t.capability_embedding <=> intent_embedding
    LIMIT result_count;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- ZTE Self-Evolution: mistake_log
-- Every self-correction loop writes here for pattern analysis
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mistake_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id TEXT NOT NULL,
    bead_id TEXT,
    task_description TEXT,
    what_was_tried TEXT,
    what_failed TEXT,
    error_message TEXT,
    fix_applied TEXT,
    success_on_retry BOOLEAN,
    phase TEXT,
    stage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mistake_log_agent ON mistake_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_mistake_log_bead ON mistake_log(bead_id);
CREATE INDEX IF NOT EXISTS idx_mistake_log_phase ON mistake_log(phase);
CREATE INDEX IF NOT EXISTS idx_mistake_log_created ON mistake_log(created_at DESC);

COMMENT ON TABLE mistake_log IS
    'ZTE self-correction loop: every agent failure + fix is tracked for pattern learning. '
    'Feeds the nightly self-improvement cron at /api/cron/self-improvement.';
