# CLAUDE.md — Kupuri Media™ / SYNTHIA™ Workspace

> Read this FIRST before any other file.

## Agent Operating Rules

Follow the global Antigravity agent rules. Work under a strict token budget. Inspect existing repo patterns before editing. Make the smallest correct change. Validate with build/lint/test where available. Update `/docs/agent-context.md` after meaningful changes. Do not make unrelated changes. Do not expose secrets. Do not deploy, delete data, or run destructive commands without explicit approval. Final output must include summary, files changed, validation results, risks, and next step.

---

## Repo Context

See [`/docs/agent-context.md`](./docs/agent-context.md) for current stack, conventions, known issues, and last task state.
See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the 3-app ecosystem map.

---

## Key Entry Points

| What | Where |
|------|-------|
| Landing page | `apps/web/index.html` |
| Synthia platform | `apps/control-room/src/` |
| Sphere OS | `apps/control-room/src/shared/sphere-state.ts` |
| Agent framework | `apps/control-room/src/agents/` |
| DB schema | `apps/control-room/src/lib/herald-schema.sql` |
| Cockpit UI | `apps/control-room/src/app/cockpit/` |
| Backend (Rust) | `backend/src/` |
| Directory app | `C:\kupuri-media-cdmx\cult-directory-template\` |
| Skills | `.claude/skills/` |

---

## Quick Commands

```bash
# Landing page dev
cd apps/web && npm run dev

# Synthia platform dev
cd apps/control-room && npm run dev

# Type check
cd apps/control-room && npx tsc --noEmit

# Build
cd apps/control-room && npm run build

# Directory app
cd C:\kupuri-media-cdmx\cult-directory-template && pnpm dev
```

---

## Skills Available

| Skill | File | Use When |
|-------|------|----------|
| Ponytail | `.claude/skills/ponytail.md` | Before adding any new file |
| Adam's Review | `.claude/skills/adamsreview.md` | Before any PR / merge |
| Understand-Anything | `.claude/skills/understand-anything.md` | Before touching agent systems |
| Beads | `.claude/skills/beads/` | For long multi-session builds |

---

## What's Gitignored (by design)

`memory/`, `beads/`, `.beads/`, `.emerald-tablets-tm/`, `backend/target/`, one-time deploy scripts.
