CREATE TABLE user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','pm','client_admin','client_viewer')),
  display_name text,
  avatar_url   text,
  locale       text NOT NULL DEFAULT 'es' CHECK (locale IN ('en','es')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "pm_sees_tenant_users" ON user_profiles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('owner','pm')
  );

CREATE INDEX idx_user_profiles_tenant ON user_profiles(tenant_id);
