# council/ — Event → Physics → Visual Contract

## Overview

`CouncilBus` is the single source of truth for live meeting state on the client.
Renderers are dumb views of `CouncilField`; they never open their own `EventSource`.

## Data flow

```
SSE /api/council/orchestrator
        │  (event.type — not event.kind)
        ▼
  bus.ts onmessage
        │
        ├─ sphere.signal / meeting.* → applyEventToField(field, ev)
        ├─ voice.chunk / .words / .done → voice queue → Web Audio
        ├─ approval.required → approvalPending badge
        └─ voice.fallback → transcript only
        │
        ▼
  rAF tick → tickCouncilField(field, dt)   ← Kuramoto + group coherence
        │
        ▼
  CouncilField  (read via selectors.ts)
        │
        ▼
  Renderer (SphereField / Theater3D / HUD)
```

## CouncilField → visual mapping

| Field | Visual |
|---|---|
| `sphere.energy` 0..1 | emissive intensity 0.4→1.6, displacement amplitude |
| `sphere.phase` | vertex displacement phase (entrains with speaker) |
| `sphere.coherence` | ring opacity + tightness |
| `sphere.speakingNow` + bus `rms` | radial pulse, local bloom boost |
| `field.groupCoherence` | UnrealBloomPass strength 0.6→1.4, hue drift |
| `field.entropy` | camera micro-shake ≤0.2 px, particle scatter |
| `field.meetingHealth.status` | HUD word: calentando/activo/coherente/fracturando/cerrando |

La Vigilante (`frequency_hz 0`) renders as a still slate sentinel — only lights
on `approval.required` gate events.

## Selectors

```ts
const sphere  = useSphere('cazadora');   // SphereState | null
const field   = useField();              // CouncilField | null
const { speaking, rms } = useSpeaker(); // SphereAgentId | null, 0..1
const [lang, setLang] = useCouncilLang();
```

## Dev oracle

`window.__synthiaField()` returns the live `CouncilField` in development.
Used by Playwright evidence oracles (e.g. assert `uEnergy ≥ 0.9` within 300 ms).
