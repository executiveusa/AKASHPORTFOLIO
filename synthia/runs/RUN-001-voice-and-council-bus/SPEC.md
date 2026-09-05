# Spec — RUN-001 (outline; 04_spec completes each section)
## N1 — Rime adapter
Files: `src/lib/voice/rime-voice.ts` (from reference-impl), `src/lib/mercury-voice.ts` (chain: rime → elevenlabs-legacy → text), `src/app/api/spheres/voice/catalog/route.ts`.
Interfaces: `rimeSynthesize(agentId, text, lang, {produced})`, `rimeStreamTurn(...)`, `pickSpeaker`, `estimateWordTiming`.
Failure: missing token → `{ok:false, reason}`; 4xx/5xx → fallback; timeout 15 s.
Security: server-only; token from env; text ≤ 2000 chars; sanitizeForLLM not needed (TTS) but strip control chars.
Tests: unit — pickSpeaker env override, estimateWordTiming monotonic; integration (CI with token) — 200 audio for isa/astra.
## N2 — orchestrator voice events
Hook after each stage turn text: `for turn → rimeStreamTurn(agentId, transcript, lang, emit)`; on WS failure `rimeSynthesize` + `estimateWordTiming` → emit chunk/words/done. Cap: per-meeting voice ms/cost counter; over cap → `voice.fallback`. Events join the 200-event replay buffer (chunks excluded from replay; words/done included).
## N3 — bus + physics
`src/lib/council/bus.ts` from reference-impl; `sphere-physics.ts`: export `applyEventToField`, add `setSpeaking(field, id, speaking, rms)`; dev oracle `__synthiaField`.
## N4 — language
`profiles`/`synthia_memory` key `voice_lang`; header `ES · EN` segmented control; council-engine receives `lang` so text is generated in that language; persona prompts already locale-aware.
## N5 — renderers
Remove EventSource from SphereField/Theater3D; subscribe to bus; uniforms: uEnergy←energy, uPhase←phase, uSpeak←rms, bloom←groupCoherence; HUD status words es/en; `SphereRing2D` for reduced motion / low memory.
## N6 — deletions (owner gate)
Remove `/api/voice`, `/api/alex/voice`, `/api/theater/stream`, `src/lib/avatar-voice-sync.ts`; update `AlexVoice.tsx` to `/api/spheres/voice`.
## N7 — status/fleet
`/api/spheres/status` reads orchestrator meeting registry (active meeting, last speaker, coherence); `/cockpit/fleet` renders it; remove clock-fake refresh.
## Rollback
Flags `VOICE_PROVIDER=off`, `COUNCIL_BUS=0` restore prior behavior without redeploy; git revert of the slice PR otherwise.
