# Wiring bugs — verified 2026-09-05 at `git log -1 = 987e690`

| # | Where | Bug | Fix stage |
|---|---|---|---|
| W1 | `src/components/SphereField.tsx:297`, `Theater3D.tsx:860` | match `event.kind==='sphere.signal'`; orchestrator sends `type`. Visuals never react. | RUN-001 (bus) |
| W2 | `src/app/api/spheres/voice/route.ts` | no auth guard; zero UI callers; ElevenLabs English defaults | RUN-001 |
| W3 | `src/app/api/voice/route.ts` | fake `Math.random()` visemes, no TTS | RUN-001 delete |
| W4 | `src/app/api/theater/stream/route.ts` | SSE stub, one hardcoded event, unused | RUN-001 delete |
| W5 | `src/lib/sphere-physics.ts` | Kuramoto engine only reached by `hooks/useVapiSphereSync.ts` (Vapi) | RUN-001 (bus) |
| W6 | `src/lib/avatar-voice-sync.ts` | orphaned | RUN-001 delete or absorb |
| W7 | `src/proxy.ts` | Next middleware named wrong → never loads; premium gate dead | RUN-002 |
| W8 | 31 unguarded routes incl. `/api/stream` (raw Anthropic proxy), `/api/pomelli/analyze`, `/api/coach`, `/api/daily-brief`, `/api/openfang`, workers/*, panorama/* | add guards / delete | RUN-002 |
| W9 | `src/lib/dashboard-data.ts` | clock-seeded fake KPIs | RUN-003 |
| W10 | 22 MOCK pages (see pages.md) | hardcoded arrays, `setTimeout` fake saves | RUN-003 |
| W11 | `auth.ts` jwt callback vs `subscriptions` schema; no `/checkout/success` | RUN-002 |
| W12 | `supabase-schema.sql` vs `herald-schema.sql`: `vibe_nodes/edges` defined twice with different decay; `conversations` twice | RUN-002 |
| W13 | `/api/arbitrage` GET returns hardcoded rates in one path while `lib/arbitrage` fetches live FX | RUN-003 |
| W14 | `/api/spheres/status` hardcoded standby | RUN-001 (derive from bus/council_events) |
| W15 | `checkRateLimit()` in `sanitize.ts` never called | RUN-002 |
