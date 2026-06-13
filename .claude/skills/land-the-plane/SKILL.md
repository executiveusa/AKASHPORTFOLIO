---
name: land-the-plane
description: Use when a branch or PR is ready to finish, merge, and verify. Keep iterating until conflicts, CI failures, review comments, nitpicks, and security gaps are resolved, then land safely on main.
---

# Land The Plane

Use this skill when the work is functionally done and the goal is to close the loop without babysitting.

## Core Rule

Merge only when the branch is green, review-clean, conflict-free, and free of secret leakage.

## Sources To Use

- Read the repo `AGENTS.md` chain before touching files.
- Use Dox-style docs traversal for the nearest folder rules.
- Use `DOCS/architecture/land-the-plane.md` as the shareable canonical copy of this skill.
- If PR review tooling is available, use a Greptile-style loop to check comments, status checks, and description completeness.
- If a simplifier agent is available, use it only after the branch is green and only on recently changed code.
- Treat the closeout as an Optio-style task-to-PR-to-merge flow, not as a free-form chat.

## Workflow

1. Load context.
2. Check branch, PR, and mergeability.
3. Resolve blocking review comments.
4. Fix merge conflicts in a safe branch/worktree if needed.
5. Run verification.
6. Apply low-risk nitpicks.
7. Run a security review.
8. Merge only when all gates pass.
9. Verify the merge landed on `main`.

## Required Gates

- `git status` is clean except for owned work.
- PR exists or is created before merge.
- Required checks are passing.
- No unresolved blocking comments remain.
- No merge conflicts remain.
- No secrets are present in the diff or logs.
- Rollback path is clear.

## Verification

Run the repo's required checks first. If the repo does not clearly document them, default to the common build and lint pair for the stack you are working in. For JavaScript and TypeScript repos, that usually means:

```powershell
npm run lint
npm run build
```

If the branch changes browser or runtime behavior, add a smoke check before merge.

## Negative Prompts

Do not:

- merge with red checks,
- merge with unresolved blocking review comments,
- merge with known conflicts,
- merge if secrets are exposed,
- ignore nitpicks that are low-risk and easy to fix,
- rewrite unrelated files,
- use destructive git commands,
- assume the PR number or branch is correct without checking,
- simplify prompts, docs, or config unless the fix truly requires it.

## Circuit Breakers

Stop and report if:

- the same failure repeats 3 times,
- CI keeps failing after a fix loop,
- mergeability never becomes clean,
- the diff contains unrelated user changes,
- a security issue appears,
- the task would cross an unsafe or unauthorized boundary.

## Output

When finished, report:

```text
Landed: <PR URL>
Merged to: main
Verification: <commands and pass/fail>
Resolved: <conflicts/reviews/checks summary>
Remaining risks: <none or concise list>
```

If blocked, report:

```text
Landing blocked: <reason>
Last passing check: <check>
Needs: <specific next action>
```
