# 01_discovery — baseline the truth

One job: turn the registries into an evidence-backed BASELINE for this run's scope only.

## Inputs
- Working: `PROJECT-LOCK.md`, `BAR.md`
- Reference: `../../_shared/registry/pages.md`, `routes.md`, `wiring-bugs.md`, `spheres.md`
- Reference (brownfield method): `../../_shared/standards/wiring-audit-lite.md`

## Process
1. For the run's scope, trace promise → surface → handler → dependency → canonical state → evidence. Record breaks.
2. Re-verify each listed wiring bug against the current revision (`git rev-parse HEAD`); mark stale ones.
3. Run `npx tsc --noEmit` and `npm run build` in `apps/control-room`; record results verbatim (counts, not adjectives).
4. Record rollback baseline: current deployed revision, env var list (names only), DB migration head.
5. Mark unknowns as UNKNOWN. Never infer a working path from code presence.

## Outputs
- `BASELINE.md` with revision hash, evidence refs, risk list
- `STATE.md` → `next_stage: 02_architecture`

## Human check
Only if a finding changes outcome, protected asset, or bar. Otherwise continue.
