-- ============================================================
-- Migration 003: Synthia HyperAgent + Hermes Tables
-- Run after: 001_control_room_foundation.sql
-- ============================================================

-- Agent Threads (HyperAgent task sessions)
CREATE TABLE IF NOT EXISTS agent_threads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email       TEXT NOT NULL,
  agent_id         TEXT,
  project_id       UUID,
  title            TEXT NOT NULL DEFAULT 'Nueva tarea',
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','running','completed','failed','cancelled')),
  execution_mode   TEXT NOT NULL DEFAULT 'auto'
                   CHECK (execution_mode IN ('plan','auto','ask_before_tools','admin_kernel')),
  risk_level       TEXT NOT NULL DEFAULT 'low'
                   CHECK (risk_level IN ('low','medium','high','critical')),
  summary          TEXT,
  cost_usd         NUMERIC(10,6) DEFAULT 0,
  latency_ms       INTEGER,
  trace_url        TEXT,
  hermes_thread_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_threads_user_idx     ON agent_threads (user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_threads_status_idx   ON agent_threads (status);
CREATE INDEX IF NOT EXISTS agent_threads_project_idx  ON agent_threads (project_id);

-- Thread Messages
CREATE TABLE IF NOT EXISTS agent_thread_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID NOT NULL REFERENCES agent_threads(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content    TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_msgs_thread_idx ON agent_thread_messages (thread_id, created_at ASC);

-- Assets produced by threads
CREATE TABLE IF NOT EXISTS agent_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES agent_threads(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('document','image','video','audio','webpage','data')),
  title        TEXT NOT NULL,
  url          TEXT,
  storage_path TEXT,
  preview_url  TEXT,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_assets_thread_idx ON agent_assets (thread_id);

-- Skills catalogue (synced from Hermes, seeded locally)
CREATE TABLE IF NOT EXISTS agent_skills (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT 'general',
  risk_level       TEXT NOT NULL DEFAULT 'low'
                   CHECK (risk_level IN ('low','medium','high','critical')),
  hermes_skill_ref TEXT,
  enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memories (per-agent learnings, suggestions, rubrics)
CREATE TABLE IF NOT EXISTS agent_memories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT,
  thread_id   UUID REFERENCES agent_threads(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL
              CHECK (memory_type IN ('fact','preference','skill','rubric','suggestion')),
  content     TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'synthia',
  accepted    BOOLEAN,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_memories_agent_idx  ON agent_memories (agent_id);
CREATE INDEX IF NOT EXISTS agent_memories_thread_idx ON agent_memories (thread_id);
CREATE INDEX IF NOT EXISTS agent_memories_type_idx   ON agent_memories (memory_type);

-- Tool events log (audit trail for all tool calls)
CREATE TABLE IF NOT EXISTS agent_tool_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID NOT NULL,
  tool_name      TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('pending','running','success','failed','blocked')),
  input_summary  TEXT,
  output_summary TEXT,
  risk_level     TEXT NOT NULL DEFAULT 'low',
  approval_id    UUID,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_tool_events_thread_idx ON agent_tool_events (thread_id, created_at DESC);

-- Projects (group threads by context)
CREATE TABLE IF NOT EXISTS projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  owner_email    TEXT NOT NULL,
  shared_context TEXT,
  archived       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_owner_idx ON projects (owner_email);

-- Teams (shared workspaces)
CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations status (per-workspace connection state)
CREATE TABLE IF NOT EXISTS integrations (
  id                TEXT PRIMARY KEY,
  provider          TEXT NOT NULL,
  category          TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'not_set'
                    CHECK (status IN ('connected','not_set','error','pending')),
  connected_account TEXT,
  metadata          JSONB DEFAULT '{}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on agent_threads
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS agent_threads_updated_at ON agent_threads;
CREATE TRIGGER agent_threads_updated_at
  BEFORE UPDATE ON agent_threads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
