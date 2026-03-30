# HERALD Integration: Antigravity Skills → Sphere OS

> **Tablet III**: Every resource is a node. Every relationship is an edge.
> Map 1,340 antigravity skills to 6 Sphere roles + 9 core agents.

---

## Curated Skill Set (Core 47 Skills)

Based on AKASHPORTFOLIO's tech stack (TypeScript, React, Rust, Sphere OS, HERALD):

### Investigation Sphere (Scout, Lens, Trace)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `error-detective` | ✅ | 0.95 | Error correlation, root cause | Scout |
| `analyze-project` | ✅ | 0.92 | Session forensics, pattern analysis | Trace |
| `code-quality-metrics` | ✅ | 0.88 | Codebase health scanning | Lens |
| `dependency-analyzer` | ✅ | 0.85 | Dependency graph analysis | Lens |
| `context-degradation` | ✅ | 0.78 | Token context issues diagnosis | Scout |
| `code-refactoring` | ✅ | 0.87 | Clean code patterns | Lens |
| `production-code-audit` | ✅ | 0.93 | Line-by-line codebase audit | Scout |

**HERALD Registration:**
```yaml
sphere: investigation
agents: [scout, lens, trace]
skills:
  - error-detective:
      confidence: 0.95
      triggers: ["error", "debug", "root cause", "diagnosis"]
      tools: [error_correlation, stack_trace_analysis]
  - analyze-project:
      confidence: 0.92
      triggers: ["project health", "rework pattern", "session review"]
  - production-code-audit:
      confidence: 0.93
      triggers: ["code scan", "audit", "quality check"]
```

---

### Orchestration Sphere (Nexus, Titan, Rally)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `multi-agent-patterns` | ✅ | 0.91 | Agent coordination | Nexus |
| `workflow-orchestration-patterns` | ✅ | 0.93 | Temporal + task routing | Nexus |
| `parallel-agents` | ✅ | 0.89 | Concurrent execution | Rally |
| `agent-orchestrator` | ✅ | 0.87 | Multi-step task routing | Nexus |
| `domain-driven-design` | ✅ | 0.85 | Strategic + tactical design | Titan |
| `brainstorming` | ✅ | 0.82 | Planning + ideation | Titan |
| `architecture` | ✅ | 0.88 | ADR + decision framework | Nexus |
| `sprint-planning` | ✅ | 0.80 | Team coordination | Titan |

**HERALD Registration:**
```yaml
sphere: orchestration
agents: [nexus, titan, rally]
skills:
  - workflow-orchestration-patterns:
      confidence: 0.93
      triggers: ["orchestrate", "workflow", "schedule", "task routing"]
      tools: [temporal_integration, task_scheduler]
  - multi-agent-patterns:
      confidence: 0.91
      triggers: ["coordinate agents", "parallel work", "multi-domain"]
  - domain-driven-design:
      confidence: 0.85
      triggers: ["strategic design", "bounded context", "ubiquitous language"]
```

---

### Implementation Sphere (Builder, Architect, Schema)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `architecture-decision-records` | ✅ | 0.94 | ADR documentation | Architect |
| `cqrs-implementation` | ✅ | 0.89 | Read/write separation | Builder |
| `event-sourcing-architect` | ✅ | 0.91 | Event patterns + projection | Architect |
| `ddd-strategic-design` | ✅ | 0.87 | Subdomains + bounded context | Architect |
| `ddd-tactical-patterns` | ✅ | 0.86 | Entities, aggregates, events | Builder |
| `monorepo-architect` | ✅ | 0.85 | Nx + Turborepo patterns | Architect |
| `nx-workspace-patterns` | ✅ | 0.88 | Nx workspace optimization | Builder |
| `shadcn` | ✅ | 0.82 | Component library | Builder |
| `electron-development` | ✅ | 0.80 | Desktop app patterns | Builder |
| `prompt-engineering` | ✅ | 0.84 | LLM prompt optimization | Builder |
| `c4-architecture-*` (4 skills) | ✅ | 0.89 | C4 documentation | Architect |
| `docs-architect` | ✅ | 0.86 | Technical docs generation | Architect |

**HERALD Registration:**
```yaml
sphere: implementation
agents: [builder, architect, schema]
skills:
  - architecture-decision-records:
      confidence: 0.94
      triggers: ["design decision", "adr", "rationale", "tradeoff"]
      tools: [adr_template, decision_log]
  - cqrs-implementation:
      confidence: 0.89
      triggers: ["read model", "write model", "separation"]
      tools: [cqrs_event_store]
  - event-sourcing-architect:
      confidence: 0.91
      triggers: ["event sourcing", "projection", "replay"]
```

---

### Security Sphere (Sentinel, Canon, Guardian)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `wcag-audit-patterns` | ✅ | 0.93 | WCAG 2.2 compliance | Canon |
| `production-code-audit` | ✅ | 0.92 | Codebase security scan | Sentinel |
| `active-directory-attacks` | ⚠️ | 0.70 | Pen-test reference (educational) | Sentinel |
| `memory-safety-patterns` | ✅ | 0.89 | Memory-safe programming | Sentinel |
| `error-handling-patterns` | ✅ | 0.87 | Resilient error handling | Sentinel |
| `security-vulnerability-scanner` | ✅ | 0.91 | Vuln detection | Sentinel |

**HERALD Registration:**
```yaml
sphere: security
agents: [sentinel, canon, guardian]
skills:
  - wcag-audit-patterns:
      confidence: 0.93
      triggers: ["wcag", "accessibility audit", "compliance"]
      tools: [wcag_checker, contrast_analyzer]
  - production-code-audit:
      confidence: 0.92
      triggers: ["security scan", "vulnerability", "threat"]
  - memory-safety-patterns:
      confidence: 0.89
      triggers: ["memory safety", "ownership", "raii"]
```

---

### Design Sphere (Palette, Canvas, Vision)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `tailwind-design-system` | ✅ | 0.90 | Design tokens + components | Palette |
| `radix-ui-design-system` | ✅ | 0.88 | Headless UI patterns | Canvas |
| `shadcn` | ✅ | 0.85 | Component library | Canvas |
| `tailwind-patterns` | ✅ | 0.87 | Tailwind CSS v4 patterns | Palette |
| `hig-patterns` | ✅ | 0.82 | Apple HIG guidelines | Vision |
| `kpi-dashboard-design` | ✅ | 0.80 | Dashboard patterns | Canvas |
| `i18n-localization` | ✅ | 0.81 | i18n + RTL support | Palette |

**HERALD Registration:**
```yaml
sphere: design
agents: [palette, canvas, vision]
skills:
  - tailwind-design-system:
      confidence: 0.90
      triggers: ["design token", "theme", "responsive"]
      tools: [tailwind_generator, token_system]
  - radix-ui-design-system:
      confidence: 0.88
      triggers: ["headless ui", "accessibility", "primitive"]
```

---

### Testing Sphere (Judge, Triage)

| Skill | Antigravity | Confidence | Purpose | Sphere Role |
|-------|---|---|---|---|
| `e2e-testing-patterns` | ✅ | 0.92 | E2E test reliability | Judge |
| `testing-patterns` | ✅ | 0.89 | Jest + TDD workflow | Judge |
| `web3-testing` | ✅ | 0.85 | Smart contract testing | Judge |
| `github-actions-templates` | ✅ | 0.86 | CI/CD workflows | Judge |
| `production-code-audit` | ✅ | 0.84 | Test coverage analysis | Triage |

**HERALD Registration:**
```yaml
sphere: testing
agents: [judge, triage]
skills:
  - e2e-testing-patterns:
      confidence: 0.92
      triggers: ["e2e test", "browser", "user journey"]
      tools: [playwright_helper, test_factory]
  - testing-patterns:
      confidence: 0.89
      triggers: ["unit test", "jest", "tdd", "mock"]
```

---

## Not Recommended (Scope Mismatch)

These 1,293 skills are excellent but **not suited** to this project:

- **Blockchain/Web3**: `web3-testing`, `solidity-patterns` (no crypto in scope)
- **Mobile-specific**: `swift-ui-patterns`, `kotlin-coroutines-expert` (web-focused)
- **Game dev**: `game-development/*`, `godot-gdscript-patterns`
- **Legacy stacks**: `wordpress-theme-development`, `sharepoint-patterns`
- **Niche domains**: `active-directory-attacks` (pen-test only), `odoo-module-developer`
- **AWS-specific**: Kiro, Lambda patterns (you have Cloudflare focus)
- **Marketing/Sales**: `growth-loops`, `sales-playbook`, `ad-creative` (engineering focus)

---

## HERALD Configuration (ZTE Protocol)

### 1. Register Skills in HERALD Registry

```typescript
// apps/control-room/src/lib/herald/skills-registry.ts

const ANTIGRAVITY_SKILL_REGISTRY = {
  investigation: {
    scout: [
      { id: 'error-detective', confidence: 0.95, triggers: ['error', 'debug'] },
      { id: 'production-code-audit', confidence: 0.93, triggers: ['scan', 'audit'] },
    ],
    lens: [
      { id: 'code-quality-metrics', confidence: 0.88, triggers: ['health', 'quality'] },
      { id: 'dependency-analyzer', confidence: 0.85, triggers: ['dependencies'] },
    ],
  },
  orchestration: {
    nexus: [
      { id: 'workflow-orchestration-patterns', confidence: 0.93, triggers: ['orchestrate'] },
      { id: 'multi-agent-patterns', confidence: 0.91, triggers: ['coordinate'] },
    ],
    titan: [
      { id: 'domain-driven-design', confidence: 0.85, triggers: ['strategic design'] },
      { id: 'brainstorming', confidence: 0.82, triggers: ['planning', 'ideation'] },
    ],
  },
  // ... other spheres
};
```

### 2. Emit vibe_node Events (Tablet III)

```typescript
// When a sphere uses a skill, emit confidence score

const emitSkillUse = (agent: string, skill: string, confidence: number) => {
  herald.emit('vibe_node.create', {
    kind: 'skill',
    id: skill,
    agent: agent,
    timestamp: Date.now(),
    confidence: confidence,
    parent: 'sphere:' + agent.split('.')[0], // Sphere parent
  });
};
```

### 3. Implement decay_vibe_confidence() Cron

```typescript
// Runs weekly - decay stale skill edges
const decayVibeConfidence = () => {
  const skills = herald.queryEdges({ kind: 'skill' });
  skills.forEach((skill) => {
    const age_days = (Date.now() - skill.timestamp) / (1000 * 60 * 60 * 24);
    skill.confidence *= Math.pow(0.95, age_days); // 5%/day decay

    if (skill.confidence < 0.60) {
      herald.removeEdge(skill.id); // Prune stale edges
    }
  });
};

// Schedule: Cron.weekly('0 0 * * 0', decayVibeConfidence);
```

---

## Sphere→Skill Mapping Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    SPHERE OS COUNCIL                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ⚡ Investigation          🎯 Orchestration                   │
│    Scout (7 skills)        Nexus (6 skills)                 │
│    Lens (7 skills)         Titan (4 skills)                 │
│    Trace (3 skills)        Rally (2 skills)                 │
│                                                              │
│ 🏗️  Implementation         🔒 Security                       │
│    Builder (8 skills)      Sentinel (5 skills)              │
│    Architect (6 skills)    Canon (3 skills)                 │
│    Schema (2 skills)       Guardian (0 skills - via Canon)  │
│                                                              │
│ 🎨 Design                  🧪 Testing                        │
│    Palette (5 skills)      Judge (4 skills)                 │
│    Canvas (4 skills)       Triage (2 skills)                │
│    Vision (2 skills)                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Total Skills Registered: 47
Unused Antigravity Skills: 1,293 (available if needed)
Average Confidence: 0.88
Decay Schedule: Weekly (Tablet VIII)
```

---

## Next Steps

1. **Register in HERALD**: Update `skills-registry.ts` with YAML above
2. **Emit vibe_nodes**: Add skill use tracking to sphere lifecycle
3. **Schedule decay cron**: Weekly confidence decay in background
4. **Test semantic search**: Verify `/semantic-search` finds skills correctly
5. **Document for Spheres**: Add skill reference to Sphere.md

---

*HERALD Integration document*
*ZTE-20260319-0001 sprint*
*Tablet III + Tablet VIII*
