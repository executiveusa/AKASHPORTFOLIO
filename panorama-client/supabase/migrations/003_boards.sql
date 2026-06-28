CREATE TABLE boards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  pm_user_id  uuid REFERENCES user_profiles(id),
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE columns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  tenant_id   uuid NOT NULL,
  title_en    text NOT NULL,
  title_es    text NOT NULL,
  position    int NOT NULL,
  wip_limit   int,
  color       text DEFAULT '#6b7280'
);

-- Seed 5 PMI-aligned columns on every new board
CREATE OR REPLACE FUNCTION seed_default_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO columns (board_id, tenant_id, title_en, title_es, position, color) VALUES
    (NEW.id, NEW.tenant_id, 'Backlog',      'Pendiente',        0, '#6b7280'),
    (NEW.id, NEW.tenant_id, 'In Planning',  'En planificación', 1, '#3b82f6'),
    (NEW.id, NEW.tenant_id, 'In Progress',  'En progreso',      2, '#f59e0b'),
    (NEW.id, NEW.tenant_id, 'In Review',    'En revisión',      3, '#8b5cf6'),
    (NEW.id, NEW.tenant_id, 'Done',         'Completado',       4, '#10b981');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_board_insert
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION seed_default_columns();

ALTER TABLE boards  ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON boards FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_isolation" ON columns FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE INDEX idx_boards_tenant   ON boards(tenant_id);
CREATE INDEX idx_columns_board   ON columns(board_id);
CREATE INDEX idx_columns_tenant  ON columns(tenant_id);
