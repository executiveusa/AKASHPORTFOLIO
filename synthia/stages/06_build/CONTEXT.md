# 06_build — implement only the slice

One job: build the admitted slice with the minimum justified change.

## Inputs
- Working: `SLICE.md`, `SPEC.md`, `GATES.md`, `ROLLBACK.md`
- Reference: `../../_shared/reference-impl/` (copy, adapt, do not import from here), `../../_shared/standards/security-floor.md`

## Process
1. Inspect touched code first. Reuse existing libs (`litellm-gateway`, `sphere-physics`, `council-engine`) before adding.
2. Keep one writer per owned artifact. Files > 500 lines: split before adding.
3. Run `npx tsc --noEmit` continuously; do NOT mark gates passed from your own report.
4. Record exactly what changed, what you're unsure about, and any secret/env you needed (name only).
5. Stop at the slice boundary. No opportunistic scope.

## Outputs
- Code changes in `apps/control-room` on a feature branch
- `BUILD-NOTES.md`, `STATE.md` → `next_stage: 07_verify`

## Human check
None. The builder never approves the slice.
