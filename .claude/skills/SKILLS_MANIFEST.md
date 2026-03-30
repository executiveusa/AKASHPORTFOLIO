# .claude/skills/SKILLS_MANIFEST.md

> **Skill Registry for AKASHPORTFOLIO**
> Integrated from: simota/agent-skills (105) + garrytan/gstack (29) + antigravity-awesome-skills (38 curated)
> Total Active Skills: **172**

---

## Quick Navigation

- [Sphere Role Assignments](#sphere-roles--skill-mapping)
- [Semantic Search](#semantic-search-finding-skills)
- [Installation](#how-to-use)
- [HERALD Integration](#herald-integration)

---

## Sphere Roles & Skill Mapping

### 🔍 Investigation Sphere
**Purpose**: Find bugs, understand systems, analyze patterns.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Scout** | error-detective, production-code-audit, context-degradation | "bug", "error", "debug", "diagnose" |
| **Lens** | code-quality-metrics, dependency-analyzer, code-refactoring, docs-architect | "how does", "show me", "explain", "explore" |
| **Trace** | analyze-project, memory-safety-patterns, error-handling-patterns | "trace", "session", "pattern", "behavior" |

**When to invoke:**
```
/Scout → Something's broken. Find the root cause.
/Lens  → I need to understand this codebase section.
/Trace → What's the behavioral pattern here?
```

---

### 🎯 Orchestration Sphere
**Purpose**: Plan work, coordinate agents, route tasks.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Nexus** | workflow-orchestration-patterns, multi-agent-patterns, agent-orchestrator, architecture, architecture-decision-records | "orchestrate", "coordinate", "execute workflow" |
| **Titan** | domain-driven-design, brainstorming, ddd-strategic-design | "what should I build", "prioritize", "plan" |
| **Rally** | parallel-agents, multi-agent-patterns | "do these in parallel", "concurrent" |

**When to invoke:**
```
/Nexus → Coordinate this multi-step workflow.
/Titan → What's the strategic priority here?
/Rally → Run these 5 tasks concurrently.
```

---

### 🏗️ Implementation Sphere
**Purpose**: Design systems, write code, build infrastructure.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Builder** | cqrs-implementation, ddd-tactical-patterns, nx-workspace-patterns, shadcn, prompt-engineering, testing-patterns | "build", "implement", "code", "write" |
| **Architect** | event-sourcing-architect, monorepo-architect, c4-context, c4-code, c4-component, c4-container | "design", "architecture", "structure", "how should" |
| **Schema** | event-sourcing-architect, ddd-tactical-patterns | "database", "schema", "entities", "relationships" |

**When to invoke:**
```
/Builder → Implement this feature.
/Architect → Design the system for these requirements.
/Schema → Design the data model.
```

---

### 🔒 Security Sphere
**Purpose**: Audit, harden, validate compliance.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Sentinel** | wcag-audit-patterns, memory-safety-patterns, error-handling-patterns | "secure", "vulnerability", "audit", "threat" |
| **Canon** | wcag-audit-patterns, github-actions-templates | "compliance", "wcag", "owasp", "standard" |
| **Guardian** | (via Canon) | Enforces compliance gate |

**When to invoke:**
```
/Sentinel → Scan for vulnerabilities.
/Canon → Check WCAG 2.2 compliance.
/Guardian → (auto-runs after /Sentinel)
```

---

### 🎨 Design Sphere
**Purpose**: Accessibility, UX, design systems.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Palette** | tailwind-design-system, i18n-localization, error-handling-patterns | "accessible", "design token", "theme" |
| **Canvas** | radix-ui-design-system, shadcn, kpi-dashboard-design | "component", "ui library", "headless" |
| **Vision** | hig-patterns, tailwind-patterns | "color", "contrast", "interaction", "responsive" |

**When to invoke:**
```
/Palette → Update design tokens.
/Canvas → Build the component library.
/Vision → Fix accessibility contrast.
```

---

### 🧪 Testing Sphere
**Purpose**: Quality assurance, test generation, QA automation.

| Agent | Skills | Triggers |
|-------|--------|----------|
| **Judge** | e2e-testing-patterns, testing-patterns, web3-testing, github-actions-templates | "test", "verify", "qa", "coverage" |
| **Triage** | production-code-audit, testing-patterns | "quality", "bug severity", "flaky test" |

**When to invoke:**
```
/Judge → Generate E2E tests.
/Triage → Classify bug severity.
```

---

## Semantic Search: Finding Skills

When you don't know the exact skill name, use `/semantic-search`:

```
User: "I need to validate our API types at compile time"

/semantic-search
intent: prevent runtime type errors
domain: API + TypeScript
goal: compile-time validation

→ Returns ranked matches:
  ✅ [0.94] architecture-decision-records
  ✅ [0.88] prompt-engineering
  ✅ [0.82] testing-patterns
```

**How it works** (Tablet VIII):
- Encodes your intent as a semantic query
- Searches Vibe Graph (HERALD) for matching skills
- Ranks by: semantic_similarity (0.6) + category_match (0.25) + recency (0.15)
- Decays confidence 5%/day for stale skills
- Returns top matches with confidence scores

---

## Skill Categories (Antigravity + simota + gstack)

### Investigation (7 skills)
```
error-detective
  → Find error patterns + root causes

analyze-project
  → Session forensics, rework patterns

production-code-audit
  → Line-by-line codebase scan

code-quality-metrics
  → Health checks, coverage

dependency-analyzer
  → Dependency graph + vulnerabilities

context-degradation
  → Token context issues diagnosis

code-refactoring
  → Clean code patterns
```

### Orchestration (6 skills)
```
workflow-orchestration-patterns
  → Temporal + task routing

multi-agent-patterns
  → Coordinate multiple agents

parallel-agents
  → Concurrent execution

domain-driven-design
  → Strategic + tactical DDD

brainstorming
  → Planning + ideation

architecture
  → ADR framework + decisions
```

### Implementation (13 skills)
```
architecture-decision-records
  → Document design rationale

cqrs-implementation
  → Read/write model separation

event-sourcing-architect
  → Event patterns + projection

ddd-strategic-design
  → Subdomains + bounded contexts

ddd-tactical-patterns
  → Entities, aggregates, events

monorepo-architect
  → Nx + Turborepo patterns

nx-workspace-patterns
  → Nx workspace optimization

shadcn
  → Component library patterns

c4-architecture (4 levels)
  → Context, container, component, code

docs-architect
  → Technical documentation from code

prompt-engineering
  → LLM prompt optimization
```

### Security (5 skills)
```
wcag-audit-patterns
  → WCAG 2.2 compliance checks

memory-safety-patterns
  → Memory-safe programming

error-handling-patterns
  → Resilient error handling

security-auditor (via sentinel from simota)
  → Vulnerability scanning

production-code-audit
  → Security codebase scan
```

### Design (7 skills)
```
tailwind-design-system
  → Design tokens + components

radix-ui-design-system
  → Headless UI primitives

tailwind-patterns
  → Tailwind CSS v4 patterns

hig-patterns
  → Apple HIG guidelines

kpi-dashboard-design
  → Dashboard patterns

i18n-localization
  → i18n + RTL support

shadcn
  → Reusable components
```

### Testing (5 skills)
```
e2e-testing-patterns
  → E2E test reliability

testing-patterns
  → Jest + TDD workflow

web3-testing
  → Smart contract patterns

github-actions-templates
  → CI/CD workflows

production-code-audit
  → Test coverage analysis
```

---

## How to Use

### 1. **Sphere Invocation** (Recommended)
When you need work done in a specific domain:

```bash
/Scout              # Find bugs
/Lens               # Explore codebase
/Nexus              # Orchestrate workflow
/Builder            # Implement feature
/Sentinel           # Security audit
/Palette            # Accessibility fix
/Judge              # Write tests
```

### 2. **Semantic Search** (When unsure)
```bash
/semantic-search
intent: [what you're trying to achieve]
context: [technical context]
goal: [desired outcome]
```

### 3. **Direct Skill Invocation** (Advanced)
```bash
/error-detective                        # Find errors
/workflow-orchestration-patterns        # Plan workflow
/e2e-testing-patterns                   # Write E2E tests
```

---

## HERALD Integration

**Location**: `apps/control-room/src/lib/herald/`

### Registration
Each skill is registered in HERALD as a **vibe_node**:

```yaml
skill:
  name: error-detective
  sphere: investigation
  agent: scout
  confidence: 0.95
  triggers: ["error", "debug", "root cause"]
  edges:
    - target: analyze-project
      relationship: complements
      confidence: 0.82
    - target: production-code-audit
      relationship: similar
      confidence: 0.88
```

### Decay Schedule
Skills are confidence-decayed weekly (Tablet VIII):

```
confidence(t) = confidence(0) × 0.95^(age_in_days)
```

Run weekly:
```bash
herald decay_vibe_confidence --threshold=0.60
```

Removes edges where confidence < 0.60.

---

## Not Included (Scope Out)

These are available in antigravity-awesome-skills but **not loaded**:

- **Blockchain**: 50+ Web3/Solidity skills (no crypto in scope)
- **Mobile**: Swift, Kotlin, React Native (web-focused)
- **Game Dev**: Godot, Unreal, game networking
- **Legacy**: WordPress, Sharepoint, Odoo
- **Marketing**: Growth loops, sales playbooks, ad creative
- **Niche AWS**: Lambda, SageMaker, QuickSight patterns

Access if needed by cloning directly from `/tmp/antigravity-skills/skills/[name]`

---

## Manifest Summary

```
┌──────────────────────────────────────┐
│    AKASHPORTFOLIO SKILL REGISTRY     │
├──────────────────────────────────────┤
│ Investigation:      7 skills         │
│ Orchestration:      6 skills         │
│ Implementation:    13 skills         │
│ Security:          5 skills          │
│ Design:            7 skills          │
│ Testing:           5 skills          │
├──────────────────────────────────────┤
│ Subtotal (Antigravity):    38 skills │
│ simota/agent-skills:      105 skills │
│ garrytan/gstack:           29 skills │
├──────────────────────────────────────┤
│ TOTAL ACTIVE SKILLS:      172 skills │
│ Average Confidence:           0.88   │
│ Decay Interval:            Weekly    │
│ Next Decay:             [scheduled]  │
└──────────────────────────────────────┘
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              SPHERE OS AGENT COUNCIL                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Investigation     │  Orchestration      │  Implement  │
│  ┌──────────────┐  │  ┌──────────────┐   │  ┌────────┐ │
│  │ Scout        │  │  │ Nexus        │   │  │ Builder│ │
│  │ ├─→ 7 skills │  │  │ ├─→ 6 skills │   │  │├─→ ... │ │
│  │ └─ error-det │  │  │ └─ workflow  │   │  │└─ code │ │
│  │              │  │  │              │   │  │        │ │
│  │ Lens         │  │  │ Titan        │   │  │ Archit │ │
│  │ ├─→ code-qa │  │  │ ├─→ planning │   │  │├─→ ADR │ │
│  │ └─ analysis  │  │  │ └─ ddd       │   │  │└─ c4   │ │
│  └──────────────┘  │  └──────────────┘   │  └────────┘ │
│                    │                      │             │
│  Security          │  Design              │  Testing    │
│  ┌──────────────┐  │  ┌──────────────┐   │  ┌────────┐ │
│  │ Sentinel     │  │  │ Palette      │   │  │ Judge  │ │
│  │ ├─→ wcag     │  │  │ ├─→ tailwind │   │  │├─→ e2e │ │
│  │ └─ audit     │  │  │ └─ tokens    │   │  │└─ jest │ │
│  │              │  │  │              │   │  │        │ │
│  │ Canon        │  │  │ Canvas       │   │  │ Triage │ │
│  │ ├─→ compliance  │  │ ├─→ radix    │   │  │├─→ qa  │ │
│  │ └─ standard   │  │  │ └─ component │  │  │└─ bugs │ │
│  └──────────────┘  │  └──────────────┘   │  └────────┘ │
│                    │                      │             │
│        ↓           │        ↓              │      ↓      │
│  HERALD Registry   │  Semantic Search     │  Vibe Graph │
│  (skill nodes)     │  (by intent)         │  (edges)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Register skills in HERALD (`skills-registry.ts`)
2. ✅ Implement semantic search (done: `/semantic-search`)
3. ⏳ Deploy vibe_node emission in sphere lifecycle
4. ⏳ Schedule weekly decay cron
5. ⏳ Update Sphere.md with skill reference

---

*Skills Manifest for AKASHPORTFOLIO*
*ZTE-20260319-0001*
*Based on EMERALD TABLETS Tablet III + Tablet VIII*
