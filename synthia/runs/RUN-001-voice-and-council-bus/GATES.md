# Gates — RUN-001
| id | claim | oracle | expected | evidence | revision | status |
|---|---|---|---|---|---|---|
| G1 | voice route returns Rime audio for synthia in es | `curl -s -o out.mp3 -w '%{http_code} %{time_starttransfer}' -X POST $URL/api/spheres/voice -H 'Cookie: <session>' -d '{"agentId":"synthia","text":"Hola, soy SYNTHIA."}'` ×10 | 200, `X-Voice-Speaker: isa`, TTFB P50 ≤ 0.8 s | pending | | pending |
| G2 | unauthenticated call is refused | same curl without cookie | 401/403 | pending | | pending |
| G3 | council emits voice events | `curl -N $URL/api/council/orchestrator?meetingId=<id>` during a meeting | ≥1 `voice.words` and `voice.done` per speaking turn | pending | | pending |
| G4 | first audible word latency | browser recording; timestamp meeting.begin → first audio | ≤ 1.5 s P50 (REST) | pending | | pending |
| G5 | spheres react to events | dev hook `__synthiaField()` sampled after `sphere.signal` | named sphere energy ≥ 0.9 within 300 ms | pending | | pending |
| G6 | speakingNow tracks words | log `voice.words` vs field.speakingNow toggles | boundary error ≤ 80 ms | pending | | pending |
| G7 | EN toggle works | toggle → next turn | speaker `astra`, English text; toggle back → `isa` | pending | | pending |
| G8 | failure path honest | remove RIME_API_TOKEN in preview | transcript shown, badge "Voz no disponible", spheres animate, 0×500 | pending | | pending |
| G9 | performance + a11y | Lighthouse /spheres idle; INP during meeting; prefers-reduced-motion | perf ≥ 85; INP < 200 ms; no WebGL context under reduced motion | pending | | pending |
| G10 | islands removed, nothing else broke | `npm run build`, `npx tsc --noEmit`, grep callers | 0 errors; 0 references to deleted routes | pending | | pending |
| G11 | blind authenticity | 3 native es-MX listeners rate 5 clips vs bar, labels stripped | ≥ 4/5 mean; ours picked ≥ 2/3 vs bar 1 | pending | | pending |
| G12 | first-run voice | cold load /bienvenida, timestamp → first audible word | ≤ 3 s | pending | | pending |
| G13 | tour completes | 5 test users, screen recording | ≤ 75 s median; 3 overlays max; each 1 sentence | pending | | pending |
| G14 | no clutter before memo | DOM count of interactive elements before memo | exactly 2 (input, ES·EN) | pending | | pending |
| G15 | mobile first-run | 390 px, iPhone 13 | no overflow; SphereRing2D ≥ 30 fps; swipe works | pending | | pending |
| G16 | secrets proven | `python3 synthia/scripts/probe-secrets.py` + `/api/health/secrets` | ANTHROPIC or OPEN_ROUTER OK; RIME OK; STRIPE OK; SUPABASE OK; 0 placeholders | pending | | pending |
| G17 | parity gauntlet | critic: SYNTHIA meeting screen vs Hyperagent command center screenshot, blind | ours picked; clutter ≤ 60% | pending | | pending |
| G18 | free by default | POST /api/synthia/agent {message} with no model | response.model endsWith ':free'; cost_cents 0 | pending | | pending |
| G19 | switcher changes model | select 'anthropic/claude-sonnet-5' in /chat → send | response.model = anthropic/claude-sonnet-5; cost_cents > 0; badge amber | pending | | pending |
| G20 | free fallback chain | force 429 on gemma (or pick z-ai/glm-5.2:free while rate-limited) | reply still arrives from next free model; no 500 | pending | | pending |
| G21 | /api/stream guarded + streams | curl without session → 401/403; with session → SSE deltas + done{model} | as stated | pending | | pending |
