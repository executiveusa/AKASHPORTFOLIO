-- PMI Issue Log
CREATE TABLE issues (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  board_id        uuid REFERENCES boards(id),
  title           text NOT NULL,
  description_en  text,
  description_es  text,
  severity        text NOT NULL DEFAULT 'medium'
                  CHECK (severity IN ('low','medium','high','critical')),
  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','in_progress','resolved','closed')),
  raised_by       uuid NOT NULL REFERENCES user_profiles(id),
  assigned_to     uuid REFERENCES user_profiles(id),
  resolution_en   text,
  resolution_es   text,
  closed_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Full audit trail — every state change recorded, never deleted
CREATE TABLE issue_audit (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id     uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  action       text NOT NULL,
  performed_by uuid NOT NULL REFERENCES user_profiles(id),
  old_status   text,
  new_status   text,
  metadata     jsonb DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues      ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON issues FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);

-- Audit is read-only for all roles; write only via service role
CREATE POLICY "tenant_read_audit" ON issue_audit FOR SELECT USING (
  issue_id IN (
    SELECT id FROM issues
    WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  )
);

-- Auto-audit trigger on issue status changes
CREATE OR REPLACE FUNCTION audit_issue_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO issue_audit (issue_id, action, performed_by, old_status, new_status)
    VALUES (NEW.id, 'status_changed', auth.uid(), OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER issue_status_audit
  AFTER UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION audit_issue_status_change();

CREATE INDEX idx_issues_tenant   ON issues(tenant_id);
CREATE INDEX idx_issues_board    ON issues(board_id);
CREATE INDEX idx_issues_status   ON issues(status);
CREATE INDEX idx_audit_issue     ON issue_audit(issue_id);
