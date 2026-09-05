# Build notes — RUN-001 (commit 8a9c2cb, 2026-09-05)
Builders: Vox (N0+N1), Pulse (N3), Aurora (N4+N8), Relay (N2), Prism (N5), Ledger (N7). Orchestrator: this thread. N-1 (models) earlier.

Changed: .env.example · package.json (+zustand) · api/council/orchestrator (voice events, registry calls) · api/spheres/status (real) · api/spheres/voice (+guard, Rime) · api/spheres/voice/catalog (new) · app/bienvenida (new) · cockpit/fleet (real) · cockpit/salon (bus) · app/spheres (subtracted) · components: LangToggle, SphereField (rewrite), SphereRing2D, Theater3D (bus), tour/* · lib/council/{bus,registry,selectors,README} · lib/first-run · lib/mercury-voice (Rime-first) · lib/sphere-physics (setSpeaking) · lib/voice/{rime-voice,council-voice} · shared/council-events (+voice.*, approval.required).

Unsure / risks: zustand not in lockfile (Vercel npm install must resolve); `import('ws')` resolves transitively (lockfile has ws ^8.18); `lang` not threaded into council-engine LLM text (voice only); voice queue strictly sequential; SphereField 544 lines (>500 guideline); /bienvenida requires an authenticated admin for the live welcome council (degrades to static memo otherwise); registry in-memory (cold-start resets).
Env needed (names): RIME_API_TOKEN, VOICE_PROVIDER, VOICE_MEETING_CHAR_CAP, VOICE_DAILY_CHAR_CAP, OPEN_ROUTER_API, LLM_DEFAULT_MODEL, LLM_ALLOW_PAID.
