# Program roadmap — runs in order (each run = one ICM lifecycle, ~1 AI-hour build + owner gates)

| Run | Vertical slice | Proves | Depends on |
|---|---|---|---|
| RUN-001 voice-and-council-bus | Start council → SYNTHIA speaks es-MX (Rime, isa) ≤1.5 s → spheres entrain to her words → memo saved; ES/EN toggle | the OS has a nervous system | — |
| RUN-002 sovereign-foundations | middleware.ts live; 31 routes guarded; rate limit; migrations consolidated (001–016); Infisical-synced secrets; checkout success/cancel | safe to be autonomous | 001 (touches same SSE route lightly) |
| RUN-003 truth-not-mock | 22 mock pages → Supabase or deleted; dashboard-data real; fleet/status from council_events; retire WASM flipbook → web flipbook /bienvenida/libro (Vivliostyle themes, mobile swipe, Rime narration) | nothing on screen lies | 002 |
| RUN-004 multi-market | markets, pricing, tenants tables; next-intl port; es-MX/es-ES/es-PR/en-US; Rime voices per market | one product, many markets | 002 |
| RUN-005 autonomy-with-gates | decision_logs, approval_queues, budget_ledger (LLM+voice), La Vigilante gate wired to bus `approval.required`; captain-hold semantics | walk-away week | 002, 001 |
| RUN-006 media-factory | Seductora pipeline on NCA toolkit (transcribe/caption/concat), creator-intelligence 17-stage workflow as ICM pipeline, Rime coda narration | revenue content at scale | 003 |
| RUN-007 market-launch-PR/MX/ES | payment rails (ATH, Conekta/OXXO+CFDI, Bizum/SEPA+VeriFactu), compliance docs, EU residency | customers | 004, 005 |
| RUN-008 self-improvement | nightly learn loop, PIV skills (review/validate) as La Vigilante tools, A/B, second-brain audit of memories | it gets better alone | 005 |

Definition of done for the program: the owner sets a monthly target per market, a daily budget and approval thresholds, leaves for a week, and returns to decisions logged, budget respected, compliance verified, leads generated, reports spoken in es-MX.
