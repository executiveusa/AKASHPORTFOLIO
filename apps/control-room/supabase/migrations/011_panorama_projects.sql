-- 011_panorama_projects.sql — Panorama PM tool persistence
-- Creates the canonical tables for the control-room /panorama/* feature.
-- Replaces the in-memory MVP stores in api/panorama/projects/route.ts and
-- api/panorama/expenses/route.ts so project and expense data survives cold
-- starts and is visible across instances.

-- ---------------------------------------------------------------------------
-- panorama_projects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS panorama_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  sponsor       TEXT NOT NULL DEFAULT 'Ivette',
  business_case TEXT,
  objectives    TEXT,
  stakeholders  TEXT,
  wbs           JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestones    JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks         JSONB NOT NULL DEFAULT '[]'::jsonb,
  phase         TEXT NOT NULL DEFAULT 'iniciacion',
  progress      INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  risk_level    TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_panorama_projects_created_at
  ON panorama_projects (created_at DESC);

-- ---------------------------------------------------------------------------
-- panorama_expenses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS panorama_expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount         NUMERIC(12,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'MXN',
  payment_method TEXT,
  vendor         TEXT,
  category_mx    TEXT,
  category_us    TEXT,
  jurisdiction   TEXT NOT NULL DEFAULT 'MX',
  notes          TEXT,
  receipt_url    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_panorama_expenses_created_at
  ON panorama_expenses (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security — only authenticated users can read/write.
-- Tighten to role-based (operator/admin) in 004_synthia_rls.sql style once
-- role claims are confirmed on the Supabase instance.
-- ---------------------------------------------------------------------------
ALTER TABLE panorama_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE panorama_expenses  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "panorama_projects_authenticated_read"  ON panorama_projects;
DROP POLICY IF EXISTS "panorama_projects_authenticated_write" ON panorama_projects;
DROP POLICY IF EXISTS "panorama_expenses_authenticated_read"  ON panorama_expenses;
DROP POLICY IF EXISTS "panorama_expenses_authenticated_write" ON panorama_expenses;

CREATE POLICY "panorama_projects_authenticated_read"
  ON panorama_projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "panorama_projects_authenticated_write"
  ON panorama_projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "panorama_expenses_authenticated_read"
  ON panorama_expenses FOR SELECT TO authenticated USING (true);

CREATE POLICY "panorama_expenses_authenticated_write"
  ON panorama_expenses FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- updated_at trigger for panorama_projects
CREATE OR REPLACE FUNCTION trg_panorama_projects_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS panorra_projects_set_updated_at ON panorama_projects;
CREATE TRIGGER panorama_projects_set_updated_at
  BEFORE UPDATE ON panorama_projects
  FOR EACH ROW EXECUTE FUNCTION trg_panorama_projects_set_updated_at();
