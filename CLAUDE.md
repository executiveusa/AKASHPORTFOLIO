# CLAUDE.md — Kupuri Media™ / SYNTHIA™ Workspace Root

> This file is the entry point for all AI agents working in this repository.
> Read this FIRST before any other file.

## Prime Directive

All agents operating in this workspace are governed by the **EMERALD TABLETS™**:

```
.emerald-tablets-tm/PRIME_DIRECTIVE.md
```

Read and internalize all 9 tablets before beginning work.

---

## Key Entry Points

| What | Where |
|------|-------|
| Agent framework | `agents.md` |
| Sphere OS | `apps/control-room/src/shared/sphere-state.ts` |
| HERALD tool topology | `apps/control-room/src/lib/herald/` |
| DB schema (run once) | `apps/control-room/src/lib/herald-schema.sql` |
| Cockpit UI | `apps/control-room/src/app/cockpit/` |
| Backend (Rust) | `backend/src/` |
| Task tracker | `.beads/issues.jsonl` (via `bd` CLI) |
| Memory | `memory/memory.md` |

---

## Quick Commands

```bash
# Dev server
cd apps/control-room && npm run dev

# Type check
cd apps/control-room && npx tsc --noEmit

# Task list
bd list

# Build
cd apps/control-room && npm run build
```

---

## Active Sprint

**ZTE-20260319-0001** — HERALD Tool Topology + Full Phase Completion

Sprint board: `.beads/issues.jsonl`

---

*Root truth: `.emerald-tablets-tm/PRIME_DIRECTIVE.md`*
