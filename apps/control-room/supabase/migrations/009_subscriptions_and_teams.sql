-- Migration 009: Add missing subscriptions + team member tables

-- synthia_team_members (referenced in /api/synthia/teams but table was missing)
CREATE TABLE IF NOT EXISTS synthia_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

ALTER TABLE synthia_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_visible_to_team" ON synthia_team_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "team_members_insert_by_owner" ON synthia_team_members
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "team_members_delete_by_owner" ON synthia_team_members
  FOR DELETE USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- subscriptions (referenced in Stripe webhook handler but table was missing)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'lector',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_visible_to_owner" ON subscriptions
  FOR SELECT USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Service role can upsert (Stripe webhook runs as service role)
CREATE POLICY "subscriptions_service_role_write" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
