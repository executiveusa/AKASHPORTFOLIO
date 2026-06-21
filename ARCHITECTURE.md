# AKASHPORTFOLIO — Architecture

## App Boundaries

| App | Path | Role |
|-----|------|------|
| Kupuri Media landing | `apps/web` | Public front door — static Vite site, no backend logic, no Synthia internals |
| Synthia platform | `apps/control-room` | Next.js 15 App Router — login, dashboard, agents, spheres, 100+ API routes |
| Onboarding sidecar | `apps/onboarding-flipbook` | Rust/Bevy/WASM — first-time onboarding for new users; deployable independently to Vercel |

## Out of scope (separate repo)

- `lamonarchaintl` — separate repository, not part of this monorepo, do not touch here

## Monorepo root

- `packages/` — shared packages (synthia-core, sphere agents)
- `scripts/` — workspace build + audit tooling
- `memory/` — project memory
- `emerald-tablets/` — design law system

## Status

No repo split until build is stable. All three apps (`apps/web`, `apps/control-room`, `apps/onboarding-flipbook`) must build cleanly before any split is considered.
