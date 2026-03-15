# Agents & Automation Tracking

**Last Updated**: 2026-03-03
**Status**: Initialization Phase

## Overview
This document tracks all agent-based automation, LLM integrations, and workflow patterns used throughout the AKASHPORTFOLIO project.

---

## Active Agents & Systems

### Synthia 3.0 Agentic OS
**Location**: `apps/control-room/`
**Status**: Integrated, Security Review Pending
**Description**: Autonomous kernel with LLM Council support, Orgo Cloud bridging, and Perplexity Machine orchestration

#### Components
- **SynthiaTerminal** (`src/components/SynthiaTerminal.tsx`)
  - Provides interactive terminal interface for system commands
  - Real-time output streaming

- **SkillMarket** (`src/components/SkillMarket.tsx`)
  - Marketplace for agent skills and capabilities
  - Tracks available skills and their parameters

- **TelemetryLog** (`src/components/TelemetryLog.tsx`)
  - Real-time system monitoring
  - Performance metrics and health checks

- **ViewingRoom** (`src/components/ViewingRoom.tsx`)
  - 3D visualization of system state
  - Agent activity monitoring

#### Libraries & Tools
- **Swarm Management** (`lib/swarm.ts`)
  - Multi-agent coordination
  - Parallel task execution

- **Observability** (`lib/observability.ts`)
  - System monitoring and logging
  - Performance telemetry

- **Git Manager** (`lib/git-manager.ts`)
  - Automated git operations
  - Repository state management
  - **SECURITY NOTE**: Requires auth context verification

- **OS Tools** (`lib/os-tools.ts`)
  - System-level command execution
  - Process management

- **Perplexity Logic** (`lib/perplexity-logic.ts`)
  - LLM reasoning patterns
  - Query orchestration
  - **SECURITY NOTE**: API key exposure audit required

- **Orgo Cloud Integration** (`lib/orgo.ts`)
  - Cloud backend connectivity
  - Remote state management
  - **SECURITY NOTE**: Sanitized version; audit for credential hardcoding

- **MiniMax Algorithm** (`lib/minimax.ts`)
  - Decision-making framework
  - Optimization logic

- **OpenFang Agent OS** (`lib/openfang.ts`)
  - Autonomous agent daemon client (http://localhost:4200)
  - 7 pre-built Hands: Clip, Lead, Collector, Predictor, Researcher, Twitter, Browser
  - 40 channel adapters: WhatsApp, Telegram, Discord, Slack, Email, and 35+ more
  - Ivette approval loop: agents send WhatsApp/Telegram to Ivette for human-in-the-loop decisions
  - Route: `/api/openfang` — modes: `deploy_hand | trigger | send_channel | query_memory`
  - Skill doc: `agents/_openfang.md`

- **Remotion** (`lib/remotion.ts`)
  - Video generation automation
  - Asset creation pipelines

#### API Routes
- **Dashboard API** (`app/api/dashboard/route.ts`)
  - System status endpoint
  - Dashboard data aggregation

- **Synthia API** (`app/api/synthia/route.ts`)
  - Agent command processing
  - LLM Council integration

#### Configuration
- **Skills Configuration** (`lib/sanitized-skills.json`)
  - Available skills and their metadata
  - **STATUS**: Marked as "sanitized" but requires audit
  - Skills tracked:
    - Code generation
    - Data analysis
    - File operations
    - LLM interactions

---

## Localization & i18n Agent

**Location**: `apps/web/js/i18n.js`
**Status**: Active
**Description**: Bilingual localization system (English/Spanish)

### Features
- Language toggle mechanism
- Dynamic content switching
- Localized copy for all user-facing text

### Tracked Content Areas
- Hero section
- About section (recently updated: `e596c2c`)
- Services section
- Contact page
- Footer
- Navigation

### Known Issues
- **Hardcoded Copy**: Some text still in `index.html` instead of i18n system
- **CSS Content**: Potential hardcoded strings in CSS `:before`/`:after`

---

## Orgo Console Agent

**Location**: `apps/control-room/src/components/OrgoConsole.tsx`
**Status**: Recently Added (Feb 27, 2026)
**Description**: Interface for Orgo Cloud orchestration

### Features
- Command dispatch
- Result visualization
- Real-time feedback

### External Dependencies
- Orgo Cloud API
- Perplexity Machine
- **SECURITY STATUS**: PENDING REVIEW

---

## Workflow Patterns

### Data Flow: User Input → Agent → LLM → Output
1. User submits command/query
2. System routes to appropriate agent
3. Agent processes via LLM (Council or Perplexity)
4. Results aggregated and returned
5. UI updates with response

### Integration Points
- Dashboard displays agent status
- Terminal provides direct access
- Skill Market enables capability discovery
- Telemetry tracks all operations

---

## Security Audit Checklist

### Critical Items
- [ ] Verify no API keys in `sanitized-skills.json`
- [ ] Verify no API keys in `perplexity-logic.ts`
- [ ] Verify no API keys in `orgo.ts`
- [ ] Check git-manager authentication context
- [ ] Verify Orgo Cloud endpoints don't expose internal IPs
- [ ] Confirm Perplexity API key is environment-injected, not hardcoded
- [ ] Audit all `.env` usage across control-room

### Configuration Review
- [ ] Document all required environment variables
- [ ] Create `.env.example` for control-room
- [ ] Verify no secrets in git history

---

## Future Integrations

### Planned
- [ ] Claude API integration for enhanced reasoning
- [ ] Multi-LLM support (GPT, Claude, Perplexity)
- [ ] Advanced persistence layer
- [ ] Real-time collaboration features

### Experimental
- Deepseek integration
- Minimax optimization improvements
- 3D visualization enhancements

---

## Related Documentation
- `synthia_core.md` - Core system documentation
- `CLEANUP_PLAN.md` - Ongoing cleanup initiatives
- `skills.md` - Skill definitions and training data

---

---

## CLI-Anything Integration

**Source**: https://github.com/HKUDS/CLI-Anything
**Added**: 2026-03-11
**Status**: Hardwired skill — available to ALL Synthia 3.0 agents

### What It Is

CLI-Anything transforms professional desktop software into agent-controllable CLIs with structured JSON output. Every Synthia agent can now produce real professional files — not just text responses.

### Available Tools

| Tool | CLI Command | Primary Agents |
|------|-------------|----------------|
| GIMP | `cli-anything-gimp` | Merlina, Lapina Instagram |
| Blender | `cli-anything-blender` | Merlina, Indigo |
| Inkscape | `cli-anything-inkscape` | Merlina, Lapina LinkedIn |
| Kdenlive | `cli-anything-kdenlive` | Lapina TikTok, Lapina Instagram, Indigo |
| Audacity | `cli-anything-audacity` | Lapina TikTok, Ivette Voice |
| LibreOffice | `cli-anything-libreoffice` | Synthia, Morpho, Clandestino, Ralphy |
| OBS Studio | `cli-anything-obs-studio` | Indigo, Synthia |
| Draw.io | `cli-anything-drawio` | Morpho, Ralphy |
| AnyGen | `cli-anything-anygen` | Synthia, Indigo, Lapina |

### Implementation Files

- **Lib wrapper**: `apps/control-room/src/lib/cli-anything.ts`
- **API route**: `apps/control-room/src/app/api/cli/route.ts`
- **Agent skill**: `apps/control-room/agents/_cli-anything.md`

### API Endpoints

```
GET  /api/cli               → discover installed tools
GET  /api/cli?tool=gimp     → get tool capabilities
POST /api/cli               → execute command or workflow
```

### Install

```bash
pip install cli-anything-gimp cli-anything-blender cli-anything-inkscape \
            cli-anything-kdenlive cli-anything-audacity cli-anything-libreoffice \
            cli-anything-obs-studio cli-anything-drawio cli-anything-anygen
```

---

## Synthia 3.0 Agent Roster

**Location**: `apps/control-room/agents/`
**Added**: 2026-03-08 → 2026-03-11

| Agent | File | Role |
|-------|------|------|
| Synthia Prime | `synthia-prime.md` | CEO Digital, orchestrator |
| Ralphy | `ralphy.md` | Quality coach (Lightning Protocol) |
| Indigo | `indigo.md` | Growth hacker, A/B testing |
| Lapina | `lapina.md` | Content creator coordinator |
| Lapina TikTok | `lapina-tiktok.md` | TikTok specialist |
| Lapina Instagram | `lapina-instagram.md` | Instagram specialist |
| Lapina LinkedIn | `lapina-linkedin.md` | LinkedIn/B2B specialist |
| Clandestino | `clandestino.md` | Sales & BD |
| Merlina | `merlina.md` | Creative director |
| Morpho | `morpho.md` | Analytics |
| Ivette Voice | `ivette-voice.md` | Brand guardian |
| NEXUS | `_nexus.md` | Orchestration framework |
| CLI-Anything | `_cli-anything.md` | Universal creative execution skill |

### Supporting Systems

| System | File | Purpose |
|--------|------|---------|
| Agent Mail | `src/lib/agent-mail.ts` | Inter-agent messaging |
| LLM Council | `src/lib/council.ts` | 5-member deliberation system |
| Meeting Room | `src/lib/meeting-room.ts` | 3x daily cron meetings |
| Social Media | `src/lib/social-media.ts` | A/B campaign automation |
| CLI-Anything | `src/lib/cli-anything.ts` | Creative software control |
| Swarm | `src/lib/swarm.ts` | 8-agent roster + goal tracking |

---

## Change Log

### 2026-03-11
- Added CLI-Anything universal skill to all agents
- Created `cli-anything.ts` lib + `/api/cli` route
- Added Lapina platform sub-agents (TikTok, Instagram, LinkedIn)
- Added campaign disk persistence to `social-media.ts`

### 2026-03-08
- Full Synthia 3.0 agent roster (8 agents + NEXUS framework)
- LLM Council, Meeting Room, Agent Mail, Social Media A/B systems
- Vercel cron jobs for 3x daily meetings
- Security fix: MiniMax API key moved to env vars

### 2026-03-03
- Created agents.md
- Documented Synthia 3.0 components
- Added security audit checklist
- Flagged critical review items
