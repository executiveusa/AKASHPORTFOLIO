# SYNTHIA lifecycle router

One job: move the active run to its next stage with the smallest safe context.

## Inputs
- Working: `runs/<active>/STATE.md`, `PROJECT-LOCK.md`, `BAR.md`
- Reference: `_shared/standards/evidence.md`, `_shared/standards/bar-and-gauntlet.md`

## Process
1. Read `STATE.md`. Take `next_stage`.
2. Open only `stages/<next_stage>/CONTEXT.md` and the files it names.
3. Produce that stage's outputs inside the run folder.
4. Update `STATE.md`: status word, next_stage, blocker, single next action.
5. Stop only at a human gate, a blocked/unsafe condition, or `PRODUCTION VERIFIED`.

## Stage order
00_intake → 01_discovery → 02_architecture → 03_graph → 04_spec → 05_slice → 06_build → 07_verify → 08_gauntlet → 09_release → 10_learn
(07 and 08 run in a FRESH context — the builder never grades itself.)

## Human check
Owner approves: the bar (00), any discovery that changes outcome/lock (01), the chosen visual territory (02), irreversible edges (03), production release (09).
