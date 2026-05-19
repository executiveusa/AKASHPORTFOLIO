# Stub Audit — PATCH_002

## Audit Results

`npm run audit:stubs` exit code: 0 (no critical stub markers in production paths)

## Stubs Resolved in PATCH_002

| File | Stub Type | Resolution |
|---|---|---|
| `src/app/api/a2a/agent-card/route.ts` | Returned stub JSON `{contract:'A2A-inspired internal contract'}` | Replaced with DB-persisted GET+POST |
| `src/app/api/a2a/registry/route.ts` | Returned `{agents:[]}` | Replaced with DB-persisted registry |
| `src/app/api/a2a/task-report/route.ts` | Echo'd input | Replaced with validated DB-persisted POST+GET |
| `src/app/api/approvals/route.ts` | In-memory Map<string,Approval> | Replaced with Supabase-persisted approvals |
| `src/app/api/approvals/[id]/decision/route.ts` | In-memory mutation | Replaced with DB update |
| `src/app/api/workflows/route.ts` | `localWorkflows` constant | Now reads from DB (`workflow_registry` table) with built-in fallback |
| `src/lib/integrations/status.ts` | Env-only check | Added active HTTP probes with DB persistence |
| `src/lib/observability/langfuse.ts` | `langfuseConfigured()` stub | Real Langfuse HTTP API wrapper with redaction |
| `src/lib/observability/events.ts` | In-memory event emitter | Typed events with DB persistence |
| `next.config.ts` | Hardcoded `kupuri-media-cdmx.vercel.app` domain | Fixed to `akashportfolio-control-room.vercel.app` |

## Remaining Stubs / Mocks

| File | Details | Why Remaining |
|---|---|---|
| `src/app/api/migrate/route.ts` | Has own inline `verifyCronSecret` | Not canonical guard but functional — PATCH_003 |
| `src/app/api/cron/*/route.ts` | Have own `verifyCronSecret` inline | Functional, non-canonical — PATCH_003 |
| 55 unguarded API routes | Proxy-only or unprotected | Volume too large for single patch — PATCH_003 |
| `packages/synthia-core/src/a2a/*.ts` | Type-only, no runtime persistence | Intended: types used by routes |
| `infra/docker-compose.yml` dify-api | Minimal stub service entry | Full Dify deploy requires `infra/vendor/dify` clone per README |

## Production-Critical Stubs Remaining

None in PATCH_002 core paths (auth, approvals, A2A, observability, workflows).
55 unguarded routes remain for PATCH_003 hardening.
