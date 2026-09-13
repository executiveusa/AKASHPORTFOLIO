# 10_learn — feed the factory

One job: convert this run's evidence into durable changes to `_shared/` and the next run's intake.

## Inputs
- Working: whole run folder
- Reference: `../../_shared/registry/*.md`

## Process
1. Update registries (pages/routes status, wiring bugs closed, spheres voices confirmed) — the registry is the only home of that fact.
2. Add LEARNINGS.md: what the critic caught, what the oracle missed, what to automate.
3. Draft the next run's `PROJECT-LOCK.md` skeleton from the program roadmap in `_shared/registry/program.md`.

## Outputs
- Registry edits, `LEARNINGS.md`, new `runs/RUN-00N-*/` folder with `STATE.md` at 00_intake

## Human check
Owner reads LEARNINGS.md.
