-- ============================================================
-- Migration 004: Row Level Security Policies — Synthia
-- Requires: 003_synthia_hyperagent_hermes.sql
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE agent_threads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations         ENABLE ROW LEVEL SECURITY;

-- ── agent_threads ────────────────────────────────────────────
-- Users can read/write their own threads
CREATE POLICY "threads_own_read" ON agent_threads
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "threads_own_insert" ON agent_threads
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "threads_own_update" ON agent_threads
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- Admins can read all threads
CREATE POLICY "threads_admin_all" ON agent_threads
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ── agent_thread_messages ────────────────────────────────────
-- Users can read messages in their own threads
CREATE POLICY "msgs_own_thread" ON agent_thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_threads t
      WHERE t.id = agent_thread_messages.thread_id
        AND t.user_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "msgs_own_insert" ON agent_thread_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_threads t
      WHERE t.id = agent_thread_messages.thread_id
        AND t.user_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "msgs_admin_all" ON agent_thread_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── agent_assets ─────────────────────────────────────────────
CREATE POLICY "assets_own_thread" ON agent_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_threads t
      WHERE t.id = agent_assets.thread_id
        AND t.user_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "assets_admin_all" ON agent_assets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── agent_skills ─────────────────────────────────────────────
-- Skills catalogue is readable by all authenticated users
CREATE POLICY "skills_authenticated_read" ON agent_skills
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify skills
CREATE POLICY "skills_admin_write" ON agent_skills
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── agent_memories ───────────────────────────────────────────
CREATE POLICY "memories_own_agent" ON agent_memories
  FOR SELECT USING (
    agent_id = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM agent_threads t
      WHERE t.id = agent_memories.thread_id
        AND t.user_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "memories_own_insert" ON agent_memories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "memories_own_update" ON agent_memories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "memories_admin_all" ON agent_memories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── agent_tool_events ────────────────────────────────────────
-- Tool events are read-only for users (audit trail)
CREATE POLICY "tool_events_own_thread" ON agent_tool_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_threads t
      WHERE t.id = agent_tool_events.thread_id
        AND t.user_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "tool_events_system_insert" ON agent_tool_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "tool_events_admin_all" ON agent_tool_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── projects ─────────────────────────────────────────────────
CREATE POLICY "projects_own_read" ON projects
  FOR SELECT USING (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "projects_own_write" ON projects
  FOR ALL USING (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── teams ────────────────────────────────────────────────────
-- Any authenticated user can read teams (for join by invite code)
CREATE POLICY "teams_authenticated_read" ON teams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "teams_own_write" ON teams
  FOR ALL USING (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "teams_admin_all" ON teams
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ── integrations ─────────────────────────────────────────────
-- Integration status readable by operators and admins
CREATE POLICY "integrations_operator_read" ON integrations
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'operator')
  );

CREATE POLICY "integrations_admin_write" ON integrations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
