# 04_spec — write the exact instructions

One job: turn each admitted node into a build spec with acceptance oracles.

## Inputs
- Working: `GRAPH.md`, `ARCHITECTURE.md`
- Reference: `../../_shared/schemas/gate.yaml`, `../../_shared/standards/evidence.md`
- Reference (design nodes): `../../_shared/doctrine/collins-level.md` §Build specification

## Process
1. For each node: files touched, interfaces, data shapes, error/failure behavior, security, analytics event, rollback.
2. Write acceptance as Given/When/Then with a runnable oracle (command, curl, browser step, listener test).
3. Never write "make it premium / improve the UI". Numbers and states only.
4. Add `GATES.md` rows: CLAIM / ORACLE / EXPECTED / EVIDENCE=pending.

## Outputs
- `SPEC.md`, `GATES.md`, `ROLLBACK.md`, `STATE.md` → `next_stage: 05_slice`

## Human check
None unless a spec requires a consequential operation.
