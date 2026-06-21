# KUPURI Media — Architecture

## Ecosystem Overview

Three separate apps. Each independently deployed. Each its own GitHub repo.

```
kupurimedia.com (landing)     app.kupurimedia.com (Synthia)     directory.kupurimedia.com
      │                               │                                    │
 AKASHPORTFOLIO             AKASHPORTFOLIO (control-room)       cult-directory-template
  apps/web                   apps/control-room                  (Directorio Kupuri)
  Vanilla HTML/CSS/JS         Next.js 14 + TS                   Next.js + Supabase
  Bilingual ES/EN             Synthia AI dashboard               Creator directory
  No backend                  Sphere UI + agents                 Railway / Coolify
  Vercel static               Vercel + Supabase                  independent deploy
```

---

## Repos

| Repo | GitHub | Purpose | Deploy |
|------|--------|---------|--------|
| `executiveusa/AKASHPORTFOLIO` | [link](https://github.com/executiveusa/AKASHPORTFOLIO) | Monorepo: landing + Synthia platform | Vercel |
| `executiveusa/cult-directory-template` | [link](https://github.com/executiveusa/cult-directory-template) | Directorio Kupuri — creator directory | Railway / Coolify |
| `executiveusa/Synthia-avatar` | [link](https://github.com/executiveusa/Synthia-avatar) | Synthia 3D avatar (profilepalette fork) | Vercel |

---

## Apps in AKASHPORTFOLIO Monorepo

### `apps/web` — Kupuri Media Landing Page
- **Tech**: Vanilla HTML, CSS, JS (no framework)
- **Language**: Bilingual ES/EN via `js/i18n.js`
- **Pages**: Home (`index.html`), Contact (`contact.html`)
- **Animations**: Lenis smooth scroll, GSAP-style CSS transitions
- **Deploy**: Vercel static — fastest possible

### `apps/control-room` — Synthia Platform
- **Tech**: Next.js 14 + TypeScript + Tailwind
- **Auth**: (Supabase auth)
- **AI Agents**: OpenRouter / LiteLLM inference
- **Sphere UI**: 3D sphere visualization for agent council
- **Backend**: Rust (in `/backend`) + Supabase
- **Deploy**: Vercel (Next.js)

### `apps/onboarding-flipbook`
- **Tech**: TBD — needs audit
- **Purpose**: Interactive onboarding shown to new users on first visit

---

## Directorio Kupuri (`cult-directory-template`)
- **Tech**: Next.js + Supabase + Tailwind + pnpm
- **Purpose**: Kupuri creator/talent/vendor directory
- **Rebrand**: Applied in `ZTE-20260323-0006` — branded as "Directorio Kupuri"
- **DB**: Supabase (migrations in `supabase/`)
- **Deploy**: Railway (has `railway.toml`) or Coolify

---

## Agent Systems (what actually runs)
Located in `apps/control-room/src/agents/`:

| Agent | Role |
|-------|------|
| La Vigilante | Observability / cockpit |
| Mercury2 | Environment management |
| STK | Spend tracking (Supabase) |
| FLW | Per-agent cost tracking |
| DOC | Supabase ops reports |

---

## Skills (`.claude/skills/`)

| Skill | Purpose |
|-------|---------|
| `ponytail.md` | Lazy senior dev review — delete before adding |
| `adamsreview.md` | Full code review pipeline with finding IDs |
| `understand-anything.md` | Knowledge graph generation |
| `beads/` | Checkpoint protocol for long builds |
| `jcodemunch/` | Code indexing |
| `orchestration/` | Agent orchestration patterns |

---

## Local Development

### Landing Page
```bash
cd apps/web
npm run dev  # serves on localhost:5173
```

### Synthia Platform
```bash
cd apps/control-room
cp .env.example .env.local   # fill in Supabase + OpenRouter keys
npm install
npm run dev  # serves on localhost:3000
```

### Directorio Kupuri
```bash
cd C:\kupuri-media-cdmx\cult-directory-template
pnpm install
pnpm dev  # serves on localhost:3000
```

---

## Git Worktree Setup (FYI)
The AKASHPORTFOLIO repo uses git worktrees:
- `main` branch → `C:\kupuri-media-cdmx\AKASHPORTFOLIO-remote`
- `codex/*` branches → `C:\kupuri-media-cdmx\workspace\AKASHPORTFOLIO-current`

---

## What's Gitignored (by design)
- `memory/` — agent runtime memory
- `beads/` — bead checkpoint state
- `.emerald-tablets-tm/` — Emerald Tablets agent system
- `backend/target/` — Rust build artifacts
- `backend/Cargo.lock` — Rust lock file
- All one-time deploy scripts and AI session dumps
