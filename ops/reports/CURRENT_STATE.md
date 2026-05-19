# Current State — PATCH_002

## Summary

PATCH_002 converts the Synthia Control Room skeleton into a production-oriented deployment.
Core infrastructure is now production-grade. 55 of 89 API routes still need PATCH_003 hardening.

## What Was Done

### Workspace
- `packages/synthia-core/package.json` — real package manifest added
- `packages/synthia-core/src/` — A2A-inspired typed contracts (AgentCard, TaskReport, Registry)
- Root scripts upgraded: `build-all.mjs`, `audit-stubs.mjs`, `audit-routes.mjs`, `patch-report.mjs`

### Auth
- `src/auth.ts` — domain drift fixed, NEXTAUTH_URL no longer hardcoded
- `next.config.ts` — removed `kupuri-media-cdmx.vercel.app` hardcoded fallback
- Guard functions already exist and are used: `requireUser`, `requireAdmin`, `requireOperatorOrAdmin`, `requireCron`, `requireWebhookSignature`, `toErrorResponse`

### Route Hardening
- A2A routes: fully guarded + DB-persisted
- Approvals routes: fully guarded + DB-persisted
- Workflows routes: fully guarded + DB-persisted + approval gate for high-risk
- Integration status: guarded + active HTTP probes
- High-risk routes hardened: `/api/social`, `/api/cli`, `/api/agent-zero`, `/api/herald/execute`, `/api/workers/pay`, `/api/stripe/checkout`, `/api/webhook`, `/api/blog/generate`, `/api/mail`

### Database
- `supabase/migrations/001_control_room_foundation.sql` — full production schema
  - Tables: profiles, agents, agent_runs, approvals, workflow_registry, control_room_events, a2a_agent_cards, a2a_task_reports, integration_status
  - Indexes, foreign keys, enums, idempotent SQL
  - RLS disabled in PATCH_002 (service-role access only); PATCH_003 to add RLS policies
- `supabase/seed.sql` — safe baseline data (agents + workflow registry)

### Observability
- `src/lib/observability/langfuse.ts` — real Langfuse HTTP API wrapper with redaction
- `src/lib/observability/events.ts` — typed events, DB-persisted
- `ops/reports/OBSERVABILITY_CONTRACT.md` — full contract documented

### Integrations
- `src/lib/integrations/status.ts` — env check + active HTTP probes + DB persistence

### i18n
- `src/lib/i18n/es-MX.ts` — complete es-MX strings (default locale)
- `src/lib/i18n/en-US.ts` — complete en-US strings (fallback)
- `src/lib/i18n/index.ts` — locale resolver

### Infra
- `infra/docker-compose.yml` — full blueprint (Traefik, Keycloak, oauth2-proxy, Postgres, Redis, Dify, Langfuse, Open WebUI)
- `infra/.env.example` — all vars documented
- `infra/traefik/dynamic.yml` — ForwardAuth middleware
- `infra/README.md` — setup guide with Google auth wiring

### Reports
- `ops/reports/API_ROUTE_SECURITY_MATRIX.md` — all 89 routes classified
- `ops/reports/OBSERVABILITY_CONTRACT.md`
- `ops/reports/STUB_AUDIT.md`
- `ops/reports/UPSTREAM_VERIFICATION.md` — BLOCKED_BY_BROWSER_ACCESS documented
- `ops/reports/PATCH_002_FILE_INVENTORY.txt`

## Production Readiness

**yellow** — Core infrastructure production-grade.
55 routes still need PATCH_003 in-route hardening.
DB migration must be applied to target environment.
Env vars must be filled before deployment.
