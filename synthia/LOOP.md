# The Build Loop — how SYNTHIA gets finished without a human at the keyboard

One loop, repeated per run, until the OS-level bar (`_shared/standards/hyperagent-parity-bar.md`) is cleared:

```
PLAN   read runs/<active>/STATE.md → next_stage (ICM router)
BUILD  fan out builders by parallel_group from GRAPH.md; one writer per owned path; each returns BUILD-NOTES
CHECK  commit → push branch (GitHub) → Vercel preview build = typecheck; on ERROR → repair slice (builder gets the exact log)
VERIFY fresh-context verifier runs every oracle in GATES.md it can reach (curl, SSE, node checks, build logs); marks pass/fail/blocked
GAUNTLET fresh-context critic (never the builder) compares against the bar: Hyperagent docs/app for capabilities + clutter, Collins card for design, voice sub-score; A/B blind where artifacts exist; names the single biggest gap
REPAIR bounded slice for the gap → back to CHECK
RELEASE when floors clear: approval packet → owner → production → receipt
LEARN registries updated; next run opened from program.md
```

Exit conditions (only these): ours wins the comparison and floors clear → RELEASE; owner says stop; a safety/authority gate blocks (deletions, spend, prod deploy, credential changes); evidence shows the bar itself is wrong. Never a round count. Every loop pass has a token/spend ceiling as a *safety* cap (default 1.5M tokens per pass), not as an exit.

## Roles per pass
- Orchestrator (this thread / the Build Loop agent): routes, fans out, merges, commits, pushes, reads Vercel.
- Builders (subagents, sonnet): one node group each, disjoint `owns`, return BUILD-NOTES.
- Verifier (fresh subagent): GATES.md oracles only; no opinions.
- Critic (fresh subagent, opus when the comparison is visual/strategic): `_shared/standards/gauntlet-critic-brief.md`.

## Owner gates that pause the loop
N6 deletions · production release · schema migrations on prod · any spend above ledger caps · credential/domain changes · anything the critic flags as "changes the outcome".

## Current pass
See `runs/RUN-001-voice-and-council-bus/STATE.md`.
