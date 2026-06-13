# land-the-plane

Invoke the closeout skill when a branch or PR is ready to finish.

Load these sources first:

- `.claude/skills/land-the-plane/SKILL.md`
- `DOCS/architecture/land-the-plane.md`

Then run the merge-closeout loop:

1. Check branch, PR state, and mergeability.
2. Resolve blocking review comments and merge conflicts.
3. Run verification until green.
4. Apply only low-risk nitpicks after the branch is green.
5. Run a security review.
6. Merge only when all gates pass.
7. Verify the merge landed on the target branch.
