# Project lock — RUN-001
```yaml
mode: brownfield
outcome: "An operator starts a council and hears SYNTHIA speak authentic Mexico City Spanish within 1.5 s, sees the nine spheres react to real council events and to her words, can flip to English, and the memo is persisted."
target: "Ivette / Kupuri Media operator (Spanish-first, on laptop and phone)"
primary_action: "Start council → listen → approve/act on memo"
bar_ref: "BAR.md (pending owner choice)"
constraints:
  - Next.js 16.2 / React 19.2 / three 0.183 / Supabase; Vercel deploy
  - Rime as primary TTS (owner directive); ElevenLabs legacy fallback only
  - es-MX default, English switch (never auto-translate audio)
  - No secrets in repo; RIME_API_TOKEN via Infisical → Vercel env
  - Spend caps: voice $0.50/meeting, $5/day
protected_assets:
  - src/lib/council-engine.ts (3-stage council), src/lib/vibe-graph.ts, src/lib/litellm-gateway.ts budgets
  - src/components/Theater3D.tsx CDMX scenes (geometry), SPHERE_FREQUENCY_MAP colors/frequencies
  - Supabase data; existing guarded routes
proof_required:
  - GATES G1–G10 with runtime evidence; blind listener test; browser recording at 1440 and 390 px
commercial_value: "Demo-able OS identity (voice + living council) for sales in MX/ES/PR; unlocks spoken briefs (RUN-006)"
classification: SELL
workstream: shared_platform
owner_approval_required: [bar, visual_territory, deleting /api/voice /api/alex/voice /api/theater/stream, production release]
```
## Facts (evidence)
- Rime live test 2026-09-05: isa/mistv3 0.69 s for 40 words; rosalie/thea/atardecer coda ~4–5 s; astra/mistv3 eng 0.37 s; `spa-mx` accepted.
- W1–W6, W14 confirmed at 987e690 (see registry/wiring-bugs.md).
- Orchestrator already emits typed CouncilEvent with `transcript` on sphere.signal — the voice hook point exists.
## Assumptions (to verify in 01)
- Vercel serverless can hold a Rime WS for ≤ 30 s per turn; else REST-per-turn path.
- `sphere-physics.applyEventToField` accepts all CouncilEvent kinds (currently exercised only by Vapi hook).
