# Land The Plane

Repo-agnostic closeout skill for finishing a branch or pull request safely.

## Purpose

Use this when a change is functionally done and the remaining work is to clear the merge path: review comments, CI checks, conflicts, nitpicks, and security concerns.

The goal is not to rush to merge. The goal is to land cleanly, with evidence that the branch is green, review-clean, conflict-free, and safe to merge.

## When To Use

Use this skill when any of the following are true:

- a branch is ready to merge,
- a pull request exists but still has blocking comments or failed checks,
- mergeability is dirty or uncertain,
- a closeout sweep is needed before merging to main,
- a code review is done but the branch still needs verification, polish, or security review.

Do not use it for early exploration, large redesigns, or open-ended brainstorming. It is a finish-line workflow.

## Core Rule

Merge only when the branch is:

- green,
- review-clean,
- conflict-free,
- free of secret leakage,
- and safe to roll back.

If any of those are false, keep working.

## Load Context First

Before changing files or merging anything:

1. Read the repo's `AGENTS.md` chain and any nearby operating docs.
2. Check the current branch, target branch, and pull request state.
3. Inspect review comments, required checks, and mergeability.
4. Identify unrelated user work so it stays untouched.
5. Decide whether the remaining work is blockers, nitpicks, or post-merge cleanup.

## Workflow

Follow this sequence:

1. Confirm the branch and PR are the ones you intend to land.
2. Check mergeability and identify blocking review comments.
3. Resolve conflicts in a safe branch or worktree if needed.
4. Re-run the repo's required verification until the branch is green.
5. Apply only low-risk nitpicks and simplifications after the branch is already green.
6. Run a security review for secrets, unsafe diffs, or accidental exposure.
7. Merge only when all gates pass.
8. Verify the merge landed on the target branch.

If a simplifier or cleanup agent is available, use it only after the branch is green and only on recently changed code.

## Required Gates

Before merge, confirm:

- `git status` is clean except for the work you own.
- The PR exists, or you have created it.
- Required checks are passing.
- No unresolved blocking comments remain.
- No merge conflicts remain.
- No secrets are present in the diff, logs, or generated output.
- A rollback path is clear.

## Verification

Run the repository's documented checks first.

If the repository does not document checks clearly, default to the common build and lint pair for the stack you are working in. For JavaScript and TypeScript repos, that usually means:

```powershell
npm run lint
npm run build
```

If the change affects browser or runtime behavior, add a smoke check before merge. Verify the real user-facing path, not just the build.

## Closeout Loop

Treat merge readiness as an iterative loop:

1. Find the blocker.
2. Fix the blocker.
3. Re-run the relevant check.
4. Repeat until the branch is clean.

Do not stop at "mostly green" or "should be fine." A closeout workflow should end with evidence, not confidence.

## Negative Prompts

Do not:

- merge with red checks,
- merge with unresolved blocking comments,
- merge with known conflicts,
- merge if secrets are exposed,
- merge while ignoring easy low-risk nitpicks,
- rewrite unrelated files,
- use destructive git commands,
- assume the branch or PR number is correct without checking,
- simplify prompts, docs, or config unless the fix truly requires it.

## Circuit Breakers

Stop and report if:

- the same failure repeats three times,
- CI keeps failing after a fix loop,
- mergeability never becomes clean,
- the diff contains unrelated user changes,
- a security issue appears,
- the task would cross an unsafe or unauthorized boundary.

When a circuit breaker trips, pause the closeout and report the blocker plainly instead of forcing the merge.

## Output

When finished, report:

```text
Landed: <PR URL>
Merged to: <target branch>
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

## Shareable Copy

This file is the repo-agnostic version of the skill. The installed skill can point here as the canonical markdown artifact for teammates and other agents.
