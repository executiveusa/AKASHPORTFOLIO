# Autonomy guardrails — how SYNTHIA is allowed to act alone

- Confidence gate: council memo confidence ≥ 0.85 AND within budget → auto-execute; else `approval.required` → La Vigilante queue (captain-hold semantics: held with a reason, answered with the owner's exact words, never inferred).
- Budget hard stops: LLM $20/day/market, $10/task/sphere, $5/meeting; voice $0.50/meeting, $5/day. Over cap → queue, never spend.
- Irreversible edges always gated: publish, send, charge/refund, delete data, production deploy, credential/domain change.
- Audit tables are append-only: decision_logs, approval_queues, budget_ledger, compliance_audit_log.
- Zero-token watcher pattern (from firstmate): classify events in code; wake an LLM only for actionable ones.
- Every sub-agent task carries a brief with a machine-readable delivery mode (`mode=no-mistakes|direct-PR|local-only`) and a definition of done.
- Data residency by context (EU → eu-west-1) is routing, not a second codebase.
