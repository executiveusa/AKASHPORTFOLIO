# API Route Security Matrix — PATCH_002

Generated: 2026-05-19
Total routes: 89 | Guarded in-route: 25 | Unguarded (in-route): 64

**Note on proxy protection**: `src/proxy.ts` (Next.js middleware) additionally protects
page paths (`/cockpit`, `/dashboard`, etc.) and a subset of API paths (`/api/council`, `/api/vibe`, etc.)
but this does NOT replace in-route guards for high-risk routes.

| route_path | methods | risk_level | side_effects | required_guard | actual_guard | auth_source | tool_policy_applied | approval_required | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| /api/a2a/agent-card | GET,POST | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | POST requires admin |
| /api/a2a/registry | GET | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | |
| /api/a2a/task-report | GET,POST | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | |
| /api/agent-mail | GET,POST,PUT | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003: add requireUser in-route |
| /api/agent-zero | POST | dangerous | external | requireAdmin | requireAdmin | route | yes | no | ok | assertDangerousToolsEnabled added |
| /api/agents/budgets | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | |
| /api/alex | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | LLM calls — PATCH_003 |
| /api/alex/voice | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | Voice — PATCH_003 |
| /api/analytics | GET | user | internal | requireUser | none | proxy | no | no | needs_fix | Protected by proxy |
| /api/approvals | GET,POST | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | DB-persisted |
| /api/approvals/[id]/decision | POST | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | Admin for high-risk |
| /api/arbitrage | GET,POST | dangerous | external | requireAdmin | none | none | no | no | needs_fix | Financial — PATCH_003 |
| /api/assets/generate | POST | user | external | requireUser | none | none | no | no | needs_fix | LLM image gen — PATCH_003 |
| /api/auth/[...nextauth] | GET,POST | public | none | public | public | public | no | no | ok | Auth handler — must be public |
| /api/beta | GET,POST | user | internal | requireUser | none | proxy | no | no | needs_fix | |
| /api/blog/generate | POST | user | external | requireUser | requireUser | route | no | no | ok | |
| /api/cli | GET,POST | dangerous | external | requireAdmin | requireAdmin | route | yes | no | ok | assertDangerousToolsEnabled added |
| /api/clients/[clientId]/pause | POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/clients/[clientId]/resume | POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/coach | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | LLM — PATCH_003 |
| /api/code-mode/status | GET | user | internal | requireUser | none | proxy | no | no | needs_fix | |
| /api/code-mode/toggle | POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | Dangerous toggle — PATCH_003 |
| /api/council | GET,POST | operator | internal | requireOperatorOrAdmin | none | proxy | no | no | needs_fix | Proxy protects page paths only |
| /api/council/cron | POST | cron | internal | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/council/heartbeat | GET | public | none | public | none | none | no | no | ok | Heartbeat — no secrets |
| /api/council/orchestrator | POST | dangerous | external | requireAdmin | none | none | no | no | needs_fix | High-risk orchestration — PATCH_003 |
| /api/creem | GET,POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | Payment — PATCH_003 |
| /api/cron/evening | GET | cron | external | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/cron/evening-research | POST | cron | external | requireCron | requireCron | route | no | no | ok | |
| /api/cron/midday | GET | cron | external | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/cron/morning | GET | cron | external | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/cron/nightly-summary | GET | cron | external | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/cron/research-cycle | POST | cron | external | requireCron | requireCron | route | no | no | ok | |
| /api/cron/research-latam | GET | cron | external | requireCron | inline | route | no | no | ok | Has inline verifyCronSecret |
| /api/cron/self-improvement | POST | cron | external | requireCron | requireCron | route | no | no | ok | |
| /api/daily-brief | GET,POST | user | external | requireUser | none | proxy | no | no | needs_fix | LLM — PATCH_003 |
| /api/dashboard | GET | user | internal | requireUser | none | proxy | no | no | ok | Dashboard data — protected by proxy |
| /api/design/dispatch | POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | External dispatch — PATCH_003 |
| /api/fleet | GET,POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/health | GET | public | none | public | none | public | no | no | ok | Health check — no secrets |
| /api/herald | GET,POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | |
| /api/herald/dispatch | POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | Tool dispatch — PATCH_003 |
| /api/herald/execute | POST | operator | external | requireOperatorOrAdmin | requireOperatorOrAdmin | route | yes | no | ok | |
| /api/herald/init | POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/income | GET,POST | admin | internal | requireAdmin | none | proxy | no | no | needs_fix | Financial — PATCH_003 |
| /api/integrations/status | GET | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | Active probe added |
| /api/mail | GET,POST,PUT | user | internal | requireUser | requireUser | route | no | no | ok | |
| /api/meeting | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/meeting/live | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/meetings | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/migrate | POST | admin | internal | requireAdmin | none | none | no | no | needs_fix | DANGEROUS — PATCH_003 must guard |
| /api/newsletter/subscribe | POST | public | external | public | none | public | no | no | ok | Public subscribe — intentional |
| /api/onboarding/event | POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/onboarding/save | POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/onboarding/stats | GET | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/openfang | GET,POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/panorama/expenses | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/panorama/expenses/ocr | POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/panorama/projects | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/pomelli/analyze | POST | user | external | requireUser | none | none | no | no | needs_fix | LLM — PATCH_003 |
| /api/repos | GET,POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | Git ops — PATCH_003 |
| /api/revenue | GET,POST | admin | internal | requireAdmin | none | proxy | no | no | needs_fix | Financial — proxy only — PATCH_003 |
| /api/social | GET,POST,PUT | operator | external | requireOperatorOrAdmin | requireOperatorOrAdmin | route | yes | no | ok | |
| /api/spheres/chat | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/spheres/status | GET | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/spheres/voice | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/state | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/stream | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/stripe/checkout | POST | user | external | requireUser | requireUser | route | no | no | ok | Payment initiation |
| /api/swarm | GET,POST | admin | external | requireAdmin | none | none | no | no | needs_fix | Agent spawn — DANGEROUS — PATCH_003 |
| /api/synthia | GET,POST | operator | external | requireOperatorOrAdmin | none | proxy | no | no | needs_fix | Proxy only |
| /api/synthia/agent | GET,POST | operator | external | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/telemetry | GET,POST | user | internal | requireUser | none | proxy | no | no | ok | Proxy-protected |
| /api/telemetry/stream | GET | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/theater/stream | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/vapi/tools | POST | webhook | external | requireWebhookSignature | none | none | no | no | needs_fix | VAPI webhook — PATCH_003 |
| /api/vibe | GET,POST,PATCH | operator | internal | requireOperatorOrAdmin | none | proxy | no | no | needs_fix | Proxy only |
| /api/video/watch | GET,POST | user | internal | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/voice | GET,POST | user | external | requireUser | none | none | no | no | needs_fix | PATCH_003 |
| /api/watcher | GET,POST | user | internal | requireUser | none | proxy | no | no | ok | Proxy-protected |
| /api/webhook | POST | webhook | external | requireWebhookSignature | requireWebhookSignature | route | no | no | ok | |
| /api/webhooks | GET,POST | webhook | external | requireWebhookSignature | none | none | no | no | needs_fix | PATCH_003 |
| /api/webhooks/stripe | POST | webhook | external | stripe_signature | stripe_signature | route | no | no | ok | Stripe inline signature check |
| /api/workers | GET,POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/workers/jobs | GET,POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/workers/pay | GET,POST | admin | external | requireAdmin | requireAdmin | route | no | no | ok | Payment — admin guarded |
| /api/workers/verify | POST | operator | internal | requireOperatorOrAdmin | none | none | no | no | needs_fix | PATCH_003 |
| /api/workflows | GET | operator | internal | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | no | ok | |
| /api/workflows/launch | POST | operator | external | requireOperatorOrAdmin | requireOperatorOrAdmin | route | no | yes | ok | Approval gate for high-risk |
| /api/migrate | POST | dangerous | internal | requireAdmin | none | none | no | no | blocked | CRITICAL: DB migration endpoint must be admin-only |

## Summary

- **ok**: 25 routes fully guarded in-route
- **needs_fix**: 55 routes — proxy protects some, rest need PATCH_003 hardening
- **blocked**: 1 critical route (`/api/migrate`) — must be guarded before production
- **public (intentional)**: 3 routes (`/api/auth/[...nextauth]`, `/api/health`, `/api/newsletter/subscribe`)
- **inline-guarded**: 7 cron routes have their own inline secret verification

## PATCH_003 Priority Actions

1. `/api/migrate` — CRITICAL: add requireAdmin immediately
2. `/api/swarm` — agent spawn, add requireAdmin
3. `/api/council/orchestrator` — add requireAdmin
4. `/api/creem`, `/api/income`, `/api/revenue` — financial, add appropriate guard
5. All remaining `needs_fix` routes — add requireUser at minimum
