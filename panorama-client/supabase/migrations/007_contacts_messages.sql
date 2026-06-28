CREATE TABLE contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  role            text,
  email           text,
  phone           text,
  whatsapp        text,
  avatar_url      text,
  is_kupuri_staff boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL,
  thread_id           uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id           uuid NOT NULL REFERENCES user_profiles(id),
  body                text NOT NULL,
  original_lang       text NOT NULL DEFAULT 'es',
  body_translated     text,
  pending_translation boolean NOT NULL DEFAULT false,
  read_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON contacts FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_isolation" ON messages FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE INDEX idx_contacts_tenant  ON contacts(tenant_id);
CREATE INDEX idx_messages_tenant  ON messages(tenant_id);
CREATE INDEX idx_messages_thread  ON messages(thread_id);
CREATE INDEX idx_messages_sender  ON messages(sender_id);
