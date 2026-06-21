# Onboarding Flipbook — Spec

## Purpose

First-time onboarding experience for Ivette and new Kupuri/Synthia clients.

## Audience

Ivette Milo (founder) and any new user being introduced to the Synthia platform.

## What it explains

1. **Synthia OS** — the AI agent operating system powering Kupuri Media
2. **9 Spheres** — the specialized agent team (SYNTHIA, ALEX, CAZADORA, FORJADORA, SEDUCTORA, CONSEJO, DR. ECONOMÍA, DRA. CULTURA, ING. TEKNOS)
3. **Cockpit** — unified dashboard for real-time control and budget management
4. **Postiz / Social automation** — CAZADORA handles prospect discovery and social posting
5. **Smart-site API** — the control-room API layer backing the platform
6. **Viewing Room / Theater** — visual sphere interaction and agent council meetings
7. **Voice / multimodal command** — Mercury 2 Inception + ElevenLabs Spanish voice interface

## Technical details

| Property | Value |
|----------|-------|
| Runtime | Rust + Bevy WASM (progressive enhancement — CSS flipbook fallback if WASM missing) |
| Build command | `wasm-pack build --target web --out-dir out` |
| Build output | `apps/onboarding-flipbook/out/` |
| Canonical localStorage key | `synthia_onboarding_seen` |
| Deployment | Standalone Vercel static app (`vercel.json` in app root) |
| E2E tests | Playwright (`apps/onboarding-flipbook/e2e/`) |

## Build prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

## Integration with apps/web

`apps/web/index.html` checks `synthia_onboarding_seen` on load. If absent, redirects to `/onboarding/`.
