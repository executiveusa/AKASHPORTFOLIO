# Voice architecture — Rime-first, es-MX-first, English as a switch

Status: DESIGN (verified against live Rime API on 2026-09-05; not yet wired)

## Why Rime replaces ElevenLabs as primary
- Authentic Mexican voices exist natively: `isa` (young adult, Mexico), `rosalie`, `thea` (adult female, MX), `atardecer`, `alonso`, `celestino`, `mar` (male, MX), `milagros` (elder). Regional voices for every other sphere locale (CO, AR, CL, VE, PE, PR, CU, ES). ElevenLabs config today points at 9 English stock voice IDs.
- Latency: Mist v3 measured 0.37–0.69 s for a 40-word clip over REST; WebSocket `/ws3` streams chunks + **word-level timestamps**, which is exactly what the sphere visuals need.
- `lang: spa-mx` normalizes currency to *pesos* — matters for a finance council.
- One token authenticates REST, WS, and the hosted MCP (`https://mcp.rime.ai`), which gives Claude Code/agents `list_voices`, `get_voice_details`, `normalize_text`, `check_dictionary`, `synthesize_speech`, `generate_integration`.

## Provider chain (server)
```
synthesizeSphereVoice(agentId, text, opts)
  1. Rime  (RIME_API_TOKEN present)       → REST for clips, WS /ws3 for live council
  2. ElevenLabs (legacy env present)      → REST, English-ish fallback, flagged provider='elevenlabs-legacy'
  3. Text-only { fallback:true, text }    → UI renders transcript; spheres animate from text cadence
```
Model policy: `mistv3` for anything real-time (council turns, chat replies); `coda` for produced audio (daily brief, newspaper read-aloud, onboarding); `mistv2` only when a phoneme override is required (brand names) via `phonemizeBetweenBrackets`.

## Language switch
- Source of truth: `profiles.voice_lang` ('es-MX' default | 'en-US') + per-request override `opts.lang`. UI: one toggle in the council header (`ES · EN`), persisted via `/api/synthia/memory` (preference).
- The sphere's *identity* survives the switch: same gender/age class, different speaker. Map in `registry/spheres.md`. English synthia = `astra` (mistv3) / `celeste` (coda).
- Text is generated in the selected language by the LLM (persona prompt already carries locale); voice never translates.

## Live council path (the vertical slice)
```
council-engine turn text ──► /api/council/orchestrator emits sphere.signal{transcript}
                             └─► server opens Rime WS (/ws3, speaker per sphere, spa-mx)
                                   ├─ chunk  ──► SSE event  voice.chunk {agentId, seq, b64}
                                   ├─ timestamps ──► SSE event voice.words {agentId, words[], start[], end[]}
                                   └─ done   ──► SSE event  voice.done {agentId}
client CouncilBus ──► queues audio per sphere (Web Audio), plays sequentially (one speaker at a time; La Vigilante may interrupt)
                 ──► sets sphere.speakingNow from voice.words timing → physics → shaders
```
Fallback when WS blocked on Vercel edge: REST per turn (`Accept: audio/mp3`) + estimated word timing from text (140 wpm es-MX), same events.

## Public API (control-room)
- `POST /api/spheres/voice` `{agentId, text, lang?, model?}` → `audio/mpeg` + headers `X-Voice-Provider`, `X-Voice-Speaker`. **Add `requireUser`**; rate-limit 30/min/user.
- `GET  /api/spheres/voice/catalog` → cached (24h) Rime `get_voice_details` filtered to Spanish + English speakers used by registry.
- `GET  /api/council/orchestrator?meetingId` (existing SSE) gains `voice.*` events; clients ignore unknown types.
- Delete `/api/voice` (random visemes) and `/api/alex/voice` (ElevenLabs alex-only) after callers migrate. `/api/theater/stream` stub deleted.

## Pronunciation
Run brand terms through Rime MCP `check_dictionary` at build time: Kupuri, SYNTHIA, Cazadora, Forjadora, Seductora, Teknos, CDMX, Bizum, OXXO, CFDI. Store overrides in `registry/pronunciation.md`; apply via `mistv2` only when a clip's text contains them (or respell for coda/mistv3).

## Secrets
`RIME_API_TOKEN` lives in Infisical (project SYNTHIA, path `/voice`), synced to Vercel env. Client code never sees it; audio is proxied. The token pasted in chat on 2026-09-05 is a temp test token — rotate.

## Cost guard
Voice spend is a ledger line like LLM spend: `budget_ledger.kind='voice'`, per meeting cap `$0.50`, per day `$5`. Enforced in the orchestrator before opening a stream; over cap → text-only fallback with visible badge.

## Evidence oracles (for GATES)
- `curl -X POST /api/spheres/voice -d '{"agentId":"synthia","text":"Hola"}'` → 200 audio/mpeg, `X-Voice-Speaker: isa`, TTFB ≤ 800 ms (P50 over 10 calls).
- Start a council in the browser → first audible SYNTHIA word within 1.5 s of `meeting.begin`; `voice.words` events observed in SSE; three native es-MX listeners rate accent authenticity ≥ 4/5 blind.
- Toggle EN → next turn is `astra`/English text; toggle back → `isa`.
- Kill token → UI shows transcript with `Voz no disponible` badge, spheres still animate; no 500s.
