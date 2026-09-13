# Observatorio — the chosen territory, and the first-run journey

Status: CHOSEN by owner 2026-09-05 (territory A). This file is the design contract for RUN-001 N5 + the new node N8 (first-run demo + tour) and RUN-003 (flipbook).

## Why Observatorio
An observatory is the one physical place where humans *read a system too large to see* by watching a few bright bodies move. That is exactly SYNTHIA's job for the operator: nine agents, three markets, budgets, approvals — read at a glance from how the spheres move. The metaphor gives every visual rule a reason:

| Element | Observatory logic | Rule |
|---|---|---|
| Field | night sky, no light pollution | `#07080c`; no gradients; sphere colors are the only saturation |
| Spheres | celestial bodies with real orbits | position = seat; radius = energy; glow = speaking; orbit speed = frequency_hz |
| Coherence | bodies aligning (syzygy) | orbits tighten into one ring; bloom rises 0.6→1.4 |
| La Vigilante | the fixed star | never orbits; lights slate→amber only on `approval.required` |
| HUD | instrument readouts pinned to edges | IBM Plex Mono, 12–13 px, uppercase tracking .12em; four readouts max: mercado · presupuesto · coherencia · pendientes |
| Memo | the astronomer's log | when coherence locks, the memo materializes as text in the center; the sky dims 20% |
| Sound | the dome is quiet | only sphere voices; no UI sounds |
| Motion | the sky only moves because bodies move | zero idle animation; every motion maps to a field value or event |
| Mobile | a handheld star chart | ring collapses to a 2D chart (SphereRing2D); voice + transcript are the hero; HUD becomes a single line |

Signature moment: **the lock**. Spheres converge to one ring, bloom peaks for 600 ms, then the memo text fades in over 400 ms while the sky dims. It happens once per meeting and never as decoration.

Type: IBM Plex Sans 300/400/500 for UI, Plex Mono for numbers and readouts. Spanish display headings tested with á é í ó ú ñ at 60 px. Money always tabular with currency code (MXN 12,000).

## First-run journey (the 60-second rule)
Goal: within 60 s of first load, the operator sees and hears the council do one true thing about *her* business, then understands the three things she will do here. No settings, menus, pricing, or empty dashboards before that.

```
0 s   /  (first visit, no session cookie flag `synthia_seen`)
      → route to /bienvenida (full-screen Observatorio, no nav)
      → nine spheres drift in from black over 1.2 s (the only intro motion allowed; skippable; reduced-motion = fade)
3 s   SYNTHIA speaks (Rime isa): "Hola. Soy SYNTHIA. Dime en una frase qué hace tu negocio." — transcript under the ring
      → single input, one line, autofocus. ES·EN toggle top-right (the only control)
~15 s operator types one sentence → Enter
      → orchestrator runs a 45-second "consejo de bienvenida" (3 spheres only: SYNTHIA, ALEX, CAZADORA; capped $0.30)
      → spheres speak in turn (voice.words drive glow); tour overlay #1 anchors to the speaking sphere:
        "Cada esfera es una agente. Esta es CAZADORA: busca clientes." (one sentence, one arrow, dismiss on next turn)
~50 s coherence lock → memo materializes: 3 bullets about her business + 1 recommended first action
      → overlay #2 anchors to the memo: "Esto es un memo del consejo. Lo que necesite tu aprobación aparecerá aquí." (points to La Vigilante)
60 s  one button: "Entrar al observatorio" → /spheres with session flag set; nav appears for the first time
      → overlay #3 (on /spheres, once): three hotspots — Iniciar consejo · Aprobaciones · Mercados. Dismiss = done. Never shown again; replayable from ⌘K "tour".
```
Rules: overlays are 1 sentence each, max 3 per session, anchored to a real element, dismissed by progress not by clicking "next". No modal, no carousel, no "skip" button larger than the content. If voice fails, the transcript plays with the same timing; the journey never blocks on audio.

Evidence oracles (add to GATES as G12–G15): time-to-first-voice ≤ 3 s on first load (cold); tour completes in ≤ 75 s median across 5 test users; 0 UI elements other than input + toggle before the memo; 390 px: no overflow, spheres render as 2D ring ≥ 30 fps; `synthia_seen` prevents replay; ⌘K "tour" replays.

## Sphere detail upgrade (N5 addendum)
- Geometry: icosphere subdiv 5 (was low-poly); per-sphere noise displacement seeded by `frequency_hz`; Fresnel rim tinted by `emissiveColor`.
- Speaking: radial pulse from RMS (Web Audio) + word-boundary flash from `voice.words`; mouth-like band along the equator scales with RMS.
- Orbit: seat positions on an ellipse; phase from physics drives micro-orbit (±3% radius); ALIGN entrains neighbors' phase visibly within 2 s.
- Labels: name + role appear only on hover/focus or while speaking; HUD readouts otherwise.
- Particles: none. Stars: static 400-point field, no twinkle (sky only moves because bodies move).
- Performance: instanced stars; single bloom pass; DPR capped at 1.5 on mobile; `deviceMemory < 4` → SphereRing2D.

## Onboarding flipbook (RUN-003 node)
Current: `apps/onboarding-flipbook` is Rust/Bevy/WASM — heavy, not mobile-friendly, separate deploy. Decision: **retire the WASM flipbook; rebuild as a web flipbook at `/bienvenida/libro`** using Vivliostyle's CSS paged-media themes (`@vivliostyle/theme-base` for typography scale; `theme-academic`/`theme-techbook` as references only — restyle to Observatorio tokens) rendered with `@vivliostyle/viewer` or a lightweight CSS `scroll-snap` book on mobile (one page per viewport, swipe = next page, `prefers-reduced-motion` = no page-turn). Content = the 8 pages of "Cómo trabaja tu consejo" derived from the memo the operator just received (personalized), Rime `coda` narration per page (rosalie), Spanish first, English switch. Print-to-PDF via Vivliostyle CLI for the sales deck. Mobile oracles: 390 px no overflow; swipe latency < 100 ms; each page ≤ 60 words; Lighthouse ≥ 90.
