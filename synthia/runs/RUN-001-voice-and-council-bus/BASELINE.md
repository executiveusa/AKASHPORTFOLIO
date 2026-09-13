# Baseline — RUN-001 (to be completed in 01_discovery)
revision: (run `git rev-parse HEAD`)
build: (npm run build — record pass/fail + warnings count)
typecheck: (npx tsc --noEmit — record error count)
migration head: (supabase/migrations latest + lib SQL drift note)
env (names): RIME_API_TOKEN, INFISICAL_TOKEN, ELEVENLABS_API_KEY|ELEVEN_LABS_API_KEY (legacy), OPENROUTER_API_KEY, ANTHROPIC_API_KEY, SUPABASE_*, NEXTAUTH_*, CRON_SECRET

## Promise → runtime traces (scope: council voice + spheres)
| promise | surface | handler | dependency | state owner | result | evidence |
|---|---|---|---|---|---|---|
| "spheres react live" | /spheres, /theater, /cockpit/salon | SphereField/Theater3D EventSource | orchestrator SSE | in-memory buffer | BROKEN (W1) | code read 2026-09-05 |
| "spheres speak Spanish" | none (no caller) | /api/spheres/voice | ElevenLabs | — | UNREACHABLE (W2) | grep: 0 callers |
| "council decides" | /cockpit/spheres, /theater | POST orchestrator → council-engine | Anthropic via gateway | sphere_meetings? | WIRED (persist unverified) | needs runtime check |
| "sphere status" | /dashboard | /api/spheres/status | — | hardcoded | MOCK (W14) | code read |

## Rollback baseline
Deployed revision: (Vercel prod deployment id) · Feature flag proposal: `VOICE_PROVIDER=rime|elevenlabs|off`, `COUNCIL_BUS=1`.
