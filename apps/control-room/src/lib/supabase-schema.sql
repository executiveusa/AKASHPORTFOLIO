-- Synthia 3.0 Supabase Schema (Open Brain)
-- Tables for agent state, memories, observations, conversations

-- Agent State Table
CREATE TABLE IF NOT EXISTS agent_state (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'offline', 'error')),
    current_task TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Observations (Telemetry Events)
CREATE TABLE IF NOT EXISTS observations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    summary TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories with Vector Embeddings (pgvector 384-dim)
CREATE TABLE IF NOT EXISTS memories (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    type TEXT DEFAULT 'observation',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    importance INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory Links (Relationships)
CREATE TABLE IF NOT EXISTS memory_links (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'related',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    participants TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Messages with Embeddings
CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_state_status ON agent_state(status);
CREATE INDEX idx_agent_state_last_seen ON agent_state(last_seen);
CREATE INDEX idx_observations_session ON observations(session_id);
CREATE INDEX idx_observations_type ON observations(event_type);
CREATE INDEX idx_memories_agent ON memories(agent_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_status ON memories(status);
CREATE INDEX idx_memories_created ON memories(created_at);
CREATE INDEX idx_memory_links_source ON memory_links(source_id);
CREATE INDEX idx_memory_links_target ON memory_links(target_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversation_messages_conv ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_agent ON conversation_messages(agent_id);

-- Vector Index (for semantic search with pgvector)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_embedding ON conversation_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Search Functions (if pgvector is installed)
CREATE OR REPLACE FUNCTION search_memories_by_vector(
    embedding vector,
    count INT DEFAULT 10,
    min_similarity FLOAT DEFAULT 0.7
) RETURNS TABLE(id BIGINT, title TEXT, summary TEXT, similarity FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.title, m.summary, (m.embedding <=> embedding)::FLOAT AS sim
    FROM memories m
    WHERE (m.embedding <=> embedding)::FLOAT <= (1 - min_similarity)
    ORDER BY sim ASC
    LIMIT count;
END;
$$ LANGUAGE plpgsql;

-- Full-text search helper
CREATE OR REPLACE FUNCTION search_memories_fulltext(
    query TEXT,
    count INT DEFAULT 10
) RETURNS TABLE(id BIGINT, title TEXT, summary TEXT, rank FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.title, m.summary, ts_rank(to_tsvector('english', m.title || ' ' || COALESCE(m.summary, '')), plainto_tsquery('english', query))::FLOAT
    FROM memories m
    WHERE to_tsvector('english', m.title || ' ' || COALESCE(m.summary, '')) @@ plainto_tsquery('english', query)
    ORDER BY ts_rank DESC
    LIMIT count;
END;
$$ LANGUAGE plpgsql;

-- Update triggers
CREATE OR REPLACE FUNCTION update_agent_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_state_updated_at BEFORE UPDATE ON agent_state
FOR EACH ROW EXECUTE FUNCTION update_agent_state_updated_at();

CREATE TRIGGER memories_updated_at BEFORE UPDATE ON memories
FOR EACH ROW EXECUTE FUNCTION update_agent_state_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_agent_state_updated_at();
