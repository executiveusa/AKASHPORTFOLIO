# Pauli Effect Workflow Manifest
## Source of truth for how we build
## Updated: 2026-03-30

---

## Session Start Checklist (60 seconds)

- [ ] `cat CLAUDE.md | head -80`
- [ ] `git fetch && git log --oneline -3`
- [ ] `git branch -a | grep "claude/"`
- [ ] `find apps/control-room/src -name "*.tsx" | xargs wc -l | sort -rn | head -10`
- [ ] Cherry-pick needed work from unmerged branches BEFORE building new
- [ ] Write screen spec before first file

---

## Quality Gates (before any commit)

- [ ] `npx tsc --noEmit` = 0 new errors (vs baseline)
- [ ] Screen renders at 375px mobile viewport
- [ ] Data comes from a real API, not hardcoded mock
- [ ] Spanish labels, 3 words max
- [ ] Uses `var(--color-*)` from globals.css, NOT `text-gray-500` or `bg-white`

---

## Context Budget Law

- **Target**: 45k tokens per session
- **Achieve by**: jcodemunch on >500-line files, `head -50` before full reads, lazy skill loading
- **Never**: `cat` a file >200 lines without reading index first
- **Never**: load all 203 skills at once

---

## Screen Spec Format (write before first file)

```
Screen: [name]
Route: /path
Krug law: user knows [X] in [N] seconds
Data sources: [existing API routes]
New APIs needed: [list or "none"]
Design tokens: [from .impeccable.md]
Mobile first: yes
```

---

## The Anti-Hype Test

Before merging any PR, ask:
> "What does Ivette do differently tomorrow because of this feature?"

If the answer is "nothing visible externally" → don't merge.

---

## 9-Screen Target State (all built 2026-03-30)

| # | Screen | Route | Key Feature |
|---|--------|-------|-------------|
| 1 | Dashboard | `/dashboard` | 4 metrics + 9 agent chips + bottom nav |
| 2 | El Panorama | `/panorama` | PMBOK 4-phase kanban + teacher choice cards |
| 3 | Gastos | `/panorama/gastos` | MX/US dual jurisdiction + receipt OCR via Claude |
| 4 | Tareas | `/cockpit/tasks` | Filter tabs + sphere assignment (pre-existing) |
| 5 | Chat Hermes | `/chat` | Single Synthia agent, streaming, SSE-ready |
| 6 | Cockpit | `/cockpit` | Extended: repo graph (371) + cost guard + health |
| 7 | Integraciones | `/integraciones` | 15 one-click connections, env var status |
| 8 | Casos | `/casos` | Manus-style gallery, filter pills, CTA banner |
| 9 | Nuevo Proyecto | `/panorama/proyecto/nuevo` | 6-step PMBOK wizard with teacher boxes |

---

## API Routes Built (2026-03-30)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/spheres/status` | GET | Live agent status (9 spheres) |
| `/api/integrations/status` | GET | Check 15 env vars |
| `/api/panorama/expenses` | GET, POST | Expense list + create |
| `/api/panorama/expenses/ocr` | POST | Claude vision receipt OCR |
| `/api/panorama/projects` | GET, POST | Project list + create |
| `/api/synthia/agent` | POST | Hermes single agent, sphere routing |

---

## Branch Key (371 repositories)

| Prefix | Organization |
|--------|-------------|
| K | Kupuri Media |
| P | Pauli Effect |
| T | Tool/Template |
| A | Akash |
| M | Mac's Digital |
| C | Cheggie |
| PT | Postatees |
| Af | Afromations |
| U | Unknown/Other |

---

## Commit Format

```
[ZTE][ZTE-YYYYMMDD-NNN] type: what | Meadows LP | why
```

Types: `feat` `fix` `docs` `chore` `refactor`

---

*Kupuri Media™ / Synthia 3.0 | ZTE Protocol v2.0*
