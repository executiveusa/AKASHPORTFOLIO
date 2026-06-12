# Land The Plane

This repo now has a closeout skill for finishing a branch and merging it safely.

## What it does

- Checks the current branch and PR state.
- Resolves blocking review feedback.
- Reruns verification until the branch is green.
- Applies low-risk nitpicks.
- Runs a security review before merge.
- Merges only when the branch is clean and mergeable.
- Verifies the merge landed on `main`.

## Guardrails

- No merge on failing checks.
- No merge with unresolved blocking comments.
- No merge with conflicts.
- No merge with secret leakage.
- Stop after the same failure repeats three times.

## Design References

- Dox: read the nearest `AGENTS.md` chain before editing.
- Greptile-style closeout loops: keep iterating until comments and checks are resolved.
- Code simplifier: only simplify recently changed code after the branch is green.
- Optio-style merge flow: treat the work as a task that ends in a merged PR and a post-merge verify.
