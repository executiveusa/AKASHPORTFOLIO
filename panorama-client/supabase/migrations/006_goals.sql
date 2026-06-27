-- PMI Milestone List
CREATE TABLE goals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  board_id         uuid REFERENCES boards(id),
  title_en         text NOT NULL,
  title_es         text,
  target_date      date,
  owner_id         uuid REFERENCES user_profiles(id),
  percent_complete int NOT NULL DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),
  status           text NOT NULL DEFAULT 'in_progress'
                   CHECK (status IN ('not_started','in_progress','completed','at_risk')),
  linked_cards     uuid[] DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Auto-calculate percent_complete from linked card statuses
CREATE OR REPLACE FUNCTION recalculate_goal_progress(goal_id uuid)
RETURNS void AS $$
DECLARE
  total int;
  done  int;
  g     goals%ROWTYPE;
BEGIN
  SELECT * INTO g FROM goals WHERE id = goal_id;
  total := array_length(g.linked_cards, 1);
  IF total IS NULL OR total = 0 THEN RETURN; END IF;

  SELECT COUNT(*) INTO done
  FROM cards c
  JOIN columns col ON c.column_id = col.id
  WHERE c.id = ANY(g.linked_cards)
  AND col.title_en = 'Done';

  UPDATE goals
  SET percent_complete = ROUND((done::float / total::float) * 100),
      status = CASE
        WHEN done = total THEN 'completed'
        WHEN target_date < now() AND done < total THEN 'at_risk'
        ELSE 'in_progress'
      END
  WHERE id = goal_id;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON goals FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

CREATE INDEX idx_goals_tenant ON goals(tenant_id);
CREATE INDEX idx_goals_board  ON goals(board_id);
