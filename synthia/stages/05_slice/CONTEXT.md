# 05_slice — pick the first verified slice

One job: choose the smallest vertical slice that proves the system, and freeze its boundary.

## Inputs
- Working: `SPEC.md`, `GRAPH.md`
- Reference: `../../_shared/doctrine/collins-level.md` §Build one verified slice

## Process
1. Slice = the path a user experiences end to end (e.g. start a council → hear SYNTHIA in es-MX within 1s → spheres react to her words → memo persisted).
2. List nodes in the slice, in order. Everything else waits.
3. Confirm rollback for the slice is one command or one revert.

## Outputs
- `SLICE.md` (nodes, order, boundary, rollback), `STATE.md` → `next_stage: 06_build`

## Human check
None.
