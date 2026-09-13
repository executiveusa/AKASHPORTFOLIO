# Council Bus + Graphics — one nervous system for the spheres

Status: DESIGN. Closes the wiring gap: today `SphereField.tsx:297` and `Theater3D.tsx:860` test `event.kind === 'sphere.signal'` while the orchestrator emits `type:'sphere.signal', kind:'ASSERT'`; visuals never react. `sphere-physics.ts` (Kuramoto coherence) is unreachable except via an unused Vapi hook.

## Principle
One boss per truth: **CouncilBus** (client) owns live meeting state. Renderers are dumb views of `CouncilField`. Server owns the event log (in-memory buffer today → `council_events` table in RUN-002).

## Client module `src/lib/council/bus.ts` (zustand store + effects)
```
state: { meetingId, field: CouncilField, transcript[], voiceQueue[], lang, connection: 'idle'|'live'|'replay'|'error' }
inputs:
  - SSE /api/council/orchestrator?meetingId   (all CouncilEvent + voice.* events; match on event.type)
  - Web Audio analyser of the currently playing sphere clip (RMS 60 Hz)
tick (rAF): field = tickCouncilField(field, dt)   // sphere-physics.ts, already written
mapping:
  sphere.signal ASSERT  → energy +0.35, amplitude burst, pulse ring
  sphere.signal INQUIRE → phase nudge toward target, thin ring
  sphere.signal ALIGN   → applyAlignEntrainment(targets → speaker)   (existing fn)
  sphere.signal REFLECT → coherence +0.05, slow glow
  meeting.focus         → spotlight intensity, camera ease to seat
  voice.words           → speakingNow true for [start,end] of each word; amplitude = analyser RMS
  meeting.closing       → groupCoherence drives bloom + ring tightness
  approval.required (new, from La Vigilante) → slate sentinel flashes, meeting pauses, badge
selectors: useSphere(id), useField(), useSpeaker()
```
Delete the per-component `EventSource` code in SphereField/Theater3D; both subscribe to the bus.

## Shader/visual contract (per sphere)
| CouncilField value | Visual |
|---|---|
| `energy` 0..1 | emissive intensity 0.4→1.6, displacement amplitude |
| `phase` | vertex displacement phase (already `uTime*uFrequency`) → use field phase so spheres visibly entrain |
| `coherence` | ring opacity + tightness |
| `speakingNow` + RMS | mouth-like radial pulse, bloom local boost |
| `groupCoherence` | UnrealBloomPass strength 0.6→1.4, background hue drift |
| `entropy` | camera micro-shake ≤ 0.2 px, particle scatter |
| `meetingHealth.status` | HUD word: calentando / activo / coherente / fracturando / cerrando |
La Vigilante (`frequency 0`) renders as a still slate sentinel that only lights on gates — the one intentional exception to the rhythm.

## Performance & access floors
- 60 fps on M1 laptop at 1440p; ≥ 30 fps on iPhone 13 at 390 px; if `deviceMemory < 4` or `prefers-reduced-motion` → 2D canvas ring (SVG `SphereRing` already exists in landing) with the same bus.
- No motion without meaning (Collins motion checklist): every animation maps to a field value or an event.
- Keyboard: focus a sphere → HUD shows role, locale, last utterance; screen-reader live region announces speaker changes.

## Surfaces after subtraction
Keep 2 renderers, 1 bus: `SphereField` (cosmic council, `/spheres`) and `Theater3D` (CDMX locations, `/theater`, `/cockpit/salon`). Retire `/cockpit/spheres` text-only duplicate into a tab of `/spheres`. Remove `/api/theater/stream`.

## Evidence oracles
- Start a council → within 300 ms of each `sphere.signal` the named sphere's `uEnergy` ≥ 0.9 (expose `window.__synthiaField` in dev for the oracle).
- `voice.words` → `speakingNow` toggles true/false matching word boundaries (log diff ≤ 80 ms).
- Reduced-motion → no WebGL context created; ring still shows speaker.
- Lighthouse performance ≥ 85 on `/spheres` without a meeting; INP < 200 ms during a meeting.
