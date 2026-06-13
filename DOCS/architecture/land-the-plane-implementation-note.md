# Land The Plane Implementation Note

Implemented on 2026-06-12.

## Added

- `.claude/skills/land-the-plane/SKILL.md`
- `.claude/skills/land-the-plane/agents/openai.yaml`
- `.claude/commands/land-the-plane.md`
- `DOCS/architecture/land-the-plane.md`
- `skills.md` inventory entry

## Summary

The new skill formalizes the merge-and-close workflow for any agent:

- load docs context first,
- check PR state and mergeability,
- fix conflicts and review comments,
- verify before merge,
- run a security review,
- stop on repeated failures,
- merge only when green.

## Intent

This is meant to be reusable by any agent that can read `SKILL.md` files and GitHub PR state, while still keeping the merge gates explicit.

The canonical shareable markdown copy now lives at `DOCS/architecture/land-the-plane.md`, and the local command wrapper lives at `.claude/commands/land-the-plane.md`.
