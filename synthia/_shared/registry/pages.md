# Pages registry — 70 `page.tsx` under apps/control-room/src/app (audited 2026-09-05 @ 987e690)
Counts: WIRED 29 · MOCK 22 · STATIC 14 · STUB 5. Update this table in 10_learn only.

| route | status | data | 3D/voice | plan |
|---|---|---|---|---|
| / | STATIC | redirect → /dashboard | — | keep |
| /agents, /agents/new, /agents/[id]/settings | WIRED | /api/synthia/agents (Supabase) | — | keep |
| /alex | STATIC | marketing arrays, fake testimonials | — | RUN-003 replace testimonials with proof or remove |
| /auth/signin, /auth/denied, /auth/error | WIRED/STATIC | next-auth Google | — | keep |
| /blog, /blog/[slug] | STATIC | file MDX | — | keep |
| /casos | MOCK | 7 hardcoded cases | — | RUN-003 → Supabase or mark "ejemplos" |
| /chat | WIRED | /api/stream (unguarded raw Anthropic) | — | RUN-002 guard route |
| /cockpit | WIRED | watcher/swarm/revenue | — | keep |
| /cockpit/budget | WIRED | /api/agents/budgets | — | RUN-005 ledger |
| /cockpit/cazadora | MOCK | pomelli fallback demo | — | RUN-003 |
| /cockpit/fleet | MOCK | hardcoded 10 agents, clock refresh | — | RUN-001 derive from bus/council_events |
| /cockpit/gastown | MOCK | demo arrays | — | RUN-003 or delete |
| /cockpit/onboarding | WIRED | AlexChat → /api/alex | — | keep |
| /cockpit/payments | MOCK | demo arrays | — | RUN-003 invoices table |
| /cockpit/revenue | MOCK | hardcoded markets/strategies | — | RUN-004 markets table |
| /cockpit/salon | WIRED (visuals broken W1) | SSE orchestrator + Theater3D | Three.js | RUN-001 |
| /cockpit/skills | STATIC | skills-registry.ts | — | keep |
| /cockpit/social | MOCK | demo + POST /api/social | — | RUN-003 |
| /cockpit/spheres | WIRED | orchestrator + spheres/chat | — | RUN-001 fold into /spheres tab |
| /cockpit/subscriptions | MOCK | TIERS, stripe_link "#" | — | RUN-002/004 pricing table |
| /cockpit/tasks | MOCK | SEED_TASKS | — | RUN-003 (.beads sync) |
| /cockpit/theater | WIRED (W1) | orchestrator + Theater3D | Three.js | RUN-001 |
| /cockpit/vault | STATIC | manifest names | — | keep |
| /cockpit/watcher, /watcher | WIRED | watcher/telemetry | — | keep |
| /cockpit/webhooks | MOCK | demo arrays | — | RUN-003 |
| /cockpit/workers (+directory, jobs, pay, verify) | MOCK | seed arrays | — | RUN-003 → workers/jobs/payments tables |
| /coordination | WIRED | synthia-api SWR | — | keep |
| /dashboard | WIRED | revenue/tasks/telemetry/spheres/status(mock) | — | RUN-001 status; RUN-003 dashboard-data |
| /docs, /landing-index, /settings | STATIC | nav | — | keep |
| /featured/[slug] | WIRED | POST synthia/thread | — | keep |
| /integraciones | WIRED | integrations/status | — | keep |
| /landing | STATIC | copy, SVG SphereRing | SVG | RUN-002 Collins pass; reuse SphereRing for reduced-motion |
| /learning, /library, /projects, /teams, /threads, /threads/new, /thread/[id] | WIRED | Supabase via synthia/* | — | keep |
| /newspaper, /newspaper/[slug] | STATIC | 8 inline briefings | — | RUN-006 generate + Rime coda narration |
| /onboarding | WIRED | onboarding/save | — | keep |
| /panorama | MOCK | SEED_PROJECTS | — | RUN-003 |
| /panorama/equipo, /proyecto/[id], /riesgos | STUB | — | — | RUN-003 build or remove from nav |
| /panorama/gastos, /panorama/proyecto/nuevo | WIRED (in-memory API) | panorama/* | — | RUN-003 persist |
| /privacy, /terms | STATIC | legal text | — | RUN-004 per-market docs |
| /proyecto/new | STUB | wizard never POSTs | — | RUN-003 |
| /settings/billing, /settings/integrations | WIRED | synthia/billing | — | keep |
| /settings/notifications, /personalization, /profile | MOCK | setTimeout fake save | — | RUN-003 (voice_lang pref lives in personalization) |
| /settings/security | STUB | — | — | RUN-002 |
| /skills | STATIC | 50+ array | — | keep |
| /spheres | WIRED (W1) | orchestrator + SphereField | Three.js shaders + bloom | RUN-001 |
| /synthia | STATIC | framer orbs | framer | Collins pass RUN-002 |
| /theater | WIRED (W1) | meeting-locations + Theater3D | Three.js + framer | RUN-001 |
