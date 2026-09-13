# Routes registry — 101 `route.ts` (audited 2026-09-05). ~70 guarded, ~31 unguarded.
Guards available: `src/lib/auth/guards.ts` → requireUser / requireAdmin / requireOperatorOrAdmin / requireCron / requireWebhookSignature.

## Unguarded (fix in RUN-002 unless noted)
/api/stream (raw Anthropic proxy — guard or delete) · /api/spheres/voice (RUN-001) · /api/openfang · /api/pomelli/analyze · /api/coach · /api/daily-brief · /api/council · /api/panorama/expenses(+ocr) · /api/panorama/projects · /api/workers · /api/workers/jobs · /api/workers/verify · /api/vapi/tools (needs Vapi signature) · /api/agents/budgets · /api/agent-mail · /api/clients/[id]/pause|resume · /api/meeting · /api/meeting/live · /api/meetings · /api/telemetry · /api/telemetry/stream · /api/design/dispatch · /api/assets/generate · /api/arbitrage · /api/video/watch · /api/alex/voice (RUN-001 delete) · /api/voice (RUN-001 delete) · /api/theater/stream (RUN-001 delete) · /api/repos (stub).
Public by design (comment them): /api/health, /api/beta, /api/newsletter/subscribe, /api/auth/*, /api/auth/validate-invite.

## Council & voice (RUN-001 scope)
- POST/GET /api/council/orchestrator — requireAdmin; SSE; in-memory pub/sub + 200-event replay (15 min). Gains `voice.*` events.
- POST /api/spheres/voice — add requireUser + rate limit; Rime provider chain.
- GET /api/spheres/status — derive from live meeting registry instead of hardcoded standby.
- GET /api/council/cron, /heartbeat — manual CRON_SECRET check → use requireCron.

## Crons (requireCron): morning, midday, evening, evening-research, nightly-summary, research-cycle, research-latam, self-improvement.
## Payments: /api/stripe/checkout (requireUser), /api/webhooks/stripe (sig), /api/creem (sig — fix HMAC), /api/workers/pay (MercadoPago), /api/income (revenue-agent).
## Synthia core (guarded): /api/synthia, /agents, /assets, /billing, /execute, /integrations, /memory, /projects, /skills, /teams, /thread, /thread/[id]; /api/herald/*; /api/approvals/*; /api/a2a/*; /api/vibe; /api/state; /api/fleet; /api/mail; /api/social; /api/workflows/*; /api/migrate (admin).
