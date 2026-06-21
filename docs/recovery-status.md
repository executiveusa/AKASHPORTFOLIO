# Recovery Status — 2026-06-21

## What was preserved

- `_recovery/status-before.txt` — git status snapshot
- `_recovery/dirty-working-tree.patch` — working tree diff (was clean)
- `_recovery/AGENTS-before-sync.patch` — AGENTS.md diff (was clean)
- `_recovery/log-before.txt` — last 30 commits
- `_recovery/branch-before.txt` — branch at start: `claude/tender-thompson-to58n8`

## What was fixed

| Task | Status | Files |
|------|--------|-------|
| localStorage key standardized to `synthia_onboarding_seen` | DONE | `apps/web/index.html`, `apps/onboarding-flipbook/index.html`, `apps/onboarding-flipbook/e2e/onboarding.spec.ts` |
| Windows-safe route audit (replaced `find` with Node.js fs traversal) | DONE | `scripts/audit-routes.mjs` |
| build-all includes apps/onboarding-flipbook | DONE | `scripts/build-all.mjs` |
| Flipbook package.json now has `build:wasm` and `build` scripts | DONE | `apps/onboarding-flipbook/package.json` |
| Beads ledger created | DONE | `beads/` (0001–0010) |
| Architecture documented | DONE | `ARCHITECTURE.md` |

## What still fails

| Item | Why | Fix needed |
|------|-----|-----------|
| `npm run audit:stubs` | 361 CRITICAL stub markers in production paths | Stub triage pass (separate task) |
| `npm run typecheck:control` | `node_modules` not installed in CI | `cd apps/control-room && npm install` before typecheck |
| `npm run build` (flipbook step) | Rust + wasm-pack not installed in this environment | Install `rustup` + `wasm-pack` on build machine |

## Intentionally not changed

- `apps/control-room/` — no functional changes
- `apps/control-room/src/app/api/auth/**` — requires human review
- `.env` / secrets — not touched
- Viewing room / theater — not touched
- Repo split — not done; waiting for stable build

## Next safe task

1. Install `node_modules` in `apps/control-room` and run `typecheck:control`
2. Triage 361 stub markers (classify: runtime-blocker vs docs-only vs roadmap)
3. Add Rust/wasm-pack to CI environment and run flipbook build
