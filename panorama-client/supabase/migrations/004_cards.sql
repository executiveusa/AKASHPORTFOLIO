CREATE TABLE cards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id     uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  column_id    uuid NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  assignee_id  uuid REFERENCES user_profiles(id),
  due_date     date,
  priority     text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  labels       text[] DEFAULT '{}',
  pmi_phase    text,
  position     float NOT NULL DEFAULT 0,
  created_by   uuid REFERENCES user_profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL,
  parent_type          text NOT NULL CHECK (parent_type IN ('card','issue')),
  parent_id            uuid NOT NULL,
  author_id            uuid NOT NULL REFERENCES user_profiles(id),
  body_en              text,
  body_es              text,
  original_lang        text NOT NULL DEFAULT 'es',
  pending_translation  boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON cards FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_isolation" ON comments FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE INDEX idx_cards_board     ON cards(board_id);
CREATE INDEX idx_cards_column    ON cards(column_id);
CREATE INDEX idx_cards_tenant    ON cards(tenant_id);
CREATE INDEX idx_cards_position  ON cards(column_id, position);
CREATE INDEX idx_comments_parent ON comments(parent_type, parent_id);
CREATE INDEX idx_comments_tenant ON comments(tenant_id);
