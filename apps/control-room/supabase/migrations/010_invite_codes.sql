-- Migration 010: Dynamic invite codes (replaces hardcoded InviteGate codes)

CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  label TEXT,
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0 CHECK (uses >= 0),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed — validate-invite API uses service role; codes are not user-owned.
-- Admin manages codes via Supabase dashboard or /api/admin/invite-codes (future).

-- Seed the same codes that were hardcoded in InviteGate.tsx so existing clients are not broken
INSERT INTO invite_codes (code, label, max_uses) VALUES
  ('KUPURI2026',  'Default alfa',    999),
  ('ALEXBETA',    'Beta testers',    50),
  ('CDMX001',     'CDMX early',      20),
  ('SYNTHIA2026', 'Synthia launch',  50),
  ('STAGE8MVP',   'Stage8 MVP',      10)
ON CONFLICT (code) DO NOTHING;
