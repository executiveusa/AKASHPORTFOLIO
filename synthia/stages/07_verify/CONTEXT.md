# 07_verify — prove it, in a fresh context

One job: run every gate's oracle against the exact revision and record evidence.

## Inputs
- Working: `GATES.md`, `BUILD-NOTES.md`, `SLICE.md`
- Reference: `../../_shared/standards/evidence.md`

## Process
1. Start with no memory of the build. Read gates, not build notes' opinions.
2. For each gate run the oracle: curl the route, open the page in a browser at 390px and 1440px, listen to the audio file, read the SSE stream, query the table.
3. Evidence = timestamp + revision + output/screenshot/log path. Stale evidence on changed inputs.
4. A failing failure-path (dependency down, no token, no meeting) is a FAIL even if the happy path passes.

## Outputs
- `GATES.md` updated with pass/fail + evidence, `STATE.md` → `next_stage: 08_gauntlet` (or back to 06 with the smallest gap list)

## Human check
None.
