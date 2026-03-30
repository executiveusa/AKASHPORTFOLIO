# /semantic-search — Vibe-Based Skill Discovery

> **ZTE Protocol**: Semantic skill search by meaning, not keywords.
> Agents find tools by intent, not text matching.

## Prime Function

When an agent needs a skill but doesn't know the exact name, use semantic search to find it by **intent**, **capability**, or **vibe**.

Instead of:
```
"I need a skill for ... something with testing?"
```

Use:
```
/semantic-search
intent: validate code quality before shipping
context: automated test generation + fixture patterns
scope: unit + integration tests
```

Returns ranked matches with confidence scores per **Tablet VIII**.

---

## Skill Domains (Vibe Graph Taxonomy)

Mapped to **Sphere OS** roles and **HERALD** tool topology:

### 1. **Investigation Sphere** (Scout, Lens, Trace)
**Intent**: Find anomalies, trace causality, understand systems.
- Error detection + correlation
- Codebase exploration + pattern recognition
- Root cause analysis + session forensics
- Log analysis + behavioral tracking
- Architecture forensics + design analysis

**Relevant Antigravity Skills:**
- `error-detective` — error correlation, root causes
- `analyze-project` — forensic session analysis
- `code-quality-metrics` — codebase health
- `dependency-analyzer` — dependency graph
- `security-vulnerability-scanner` — vuln detection

### 2. **Orchestration Sphere** (Nexus, Titan, Rally)
**Intent**: Plan work, route tasks, coordinate parallel execution.
- Task sequencing + dependency resolution
- Product-level prioritization
- Multi-agent coordination
- Workflow design + checkpoints
- Agent capability matching

**Relevant Antigravity Skills:**
- `multi-agent-patterns` — agent coordination
- `workflow-orchestration-patterns` — task flow
- `parallel-agents` — concurrent execution
- `agent-orchestrator` — multi-step routing
- `sprint-planning` — team coordination

### 3. **Implementation Sphere** (Builder, Architect, Schema)
**Intent**: Design systems, write code, build infrastructure.
- Code generation + refactoring
- Architecture decision records
- Database schema + migrations
- Component design + patterns
- Infrastructure as Code

**Relevant Antigravity Skills:**
- `architecture` — ADR framework
- `domain-driven-design` — strategic + tactical
- `cqrs-implementation` — read/write separation
- `event-sourcing-architect` — event patterns
- `monorepo-architect` — workspace patterns
- `code-refactoring` — clean code
- `software-architecture` — quality-focused design

### 4. **Security Sphere** (Sentinel, Canon, Guardian)
**Intent**: Audit, harden, validate compliance.
- Vulnerability scanning + remediation
- Security architecture review
- Compliance checking (OWASP, WCAG, OpenAPI)
- Access control + secrets validation
- Threat modeling

**Relevant Antigravity Skills:**
- `sentinel` (simota) — vuln detection
- `canon` (simota) — compliance checking
- `wcag-audit-patterns` — accessibility audit
- `production-code-audit` — codebase scanning
- `security-auditor` — security review

### 5. **Design Sphere** (Palette, Canvas, Vision)
**Intent**: Accessibility, UX, design systems.
- Component library + design tokens
- Color contrast + accessibility
- Responsive design + variants
- Animation + interaction patterns
- Design system governance

**Relevant Antigravity Skills:**
- `palette` (simota) — accessibility fixes
- `tailwind-design-system` — token architecture
- `radix-ui-design-system` — headless patterns
- `wcag-audit-patterns` — WCAG compliance
- `hig-patterns` — Apple HIG patterns

### 6. **Testing Sphere** (Judge, Triage)
**Intent**: Quality assurance, test generation, QA automation.
- Unit + integration + E2E test generation
- Test factory patterns
- Test data + fixture generation
- Flaky test detection
- Coverage auditing

**Relevant Antigravity Skills:**
- `e2e-testing-patterns` — E2E reliability
- `testing-patterns` — Jest + TDD patterns
- `web3-testing` — smart contract testing
- `production-code-audit` — code scanning

---

## How Semantic Search Works (Zero-Touch)

### 1. **Encode Intent**
Agent states their need as a **vibe**, not a search term.

```
I need to: ensure API responses are type-safe across client/server
Context: TypeScript + REST API
Pain: runtime errors slip through tests
Goal: prevent type mismatches at compile time
```

### 2. **Query Sphere Graph**
System checks **Tablet III** (Vibe Graph):
- Find skills where `confidence(query, skill_description) > 0.7`
- Rank by semantic relevance + recency
- Apply `decay_vibe_confidence()` — stale edges weighted lower

### 3. **Return Ranked Matches**
```
[✅ HIGH CONFIDENCE (0.94)]
  architecture-decision-records
  — "Capture rationale for significant decisions"
  — Matches: intent(design decisions), context(REST API), goal(type safety)

[✅ HIGH CONFIDENCE (0.89)]
  schema (simota)
  — "Database schema design + migrations"
  — Matches: intent(data design), context(API), goal(correctness)

[⚠️ MEDIUM CONFIDENCE (0.72)]
  testing-patterns
  — "Jest testing patterns, TDD workflow"
  — Matches: goal(prevent errors), context(TypeScript)
```

### 4. **Agent Invokes Top Match**
```
/architecture-decision-records
Decision: API type safety via OpenAPI + Zod
Rationale: contract-first prevents runtime errors
```

---

## Integration with HERALD

Skills registered in HERALD with **semantic embeddings**:

```yaml
skill:
  name: semantic-search
  domain: orchestration
  capability: skill_discovery
  triggers:
    - "find me a skill for ..."
    - "what agent handles ..."
    - "which tool does ..."
  confidence_decay: 0.05  # 5%/day per Tablet VIII
  vibe_edges:
    - skill: architecture
      confidence: 0.92
      reason: "design_intent_match"
    - skill: multi-agent-patterns
      confidence: 0.85
      reason: "orchestration_overlap"
```

---

## Usage Examples

### Example 1: Testing Workflow
```
User: I need to generate E2E tests for a checkout flow

/semantic-search
intent: validate critical user journey (checkout)
scope: end-to-end + real browser
goal: catch regressions before deploy

→ Returns: [e2e-testing-patterns, qa (gstack), qa-eval (gstack)]
```

### Example 2: Architecture Decision
```
User: Help me design event sourcing for this order system

/semantic-search
intent: handle distributed transactions + audit trail
domain: order_management
goal: eventual consistency + replay capability

→ Returns: [event-sourcing-architect, saga-orchestration, cqrs-implementation]
```

### Example 3: Multi-Sphere Problem
```
User: Build a secure, accessible design system component library

/semantic-search  # Triggers MULTIPLE sphere searches in parallel
intent: component_library
security: access_control
accessibility: wcag_compliant
design: token_architecture

→ Returns:
  [Sentinel] security-auditor
  [Palette] radix-ui-design-system
  [Canon] wcag-audit-patterns
  [Titan] design-system-governance (custom skill)
```

---

## Vibe Confidence Scoring (Tablet VIII)

Each match gets a confidence score [0..1]:

```
confidence = (
  semantic_similarity(query_embedding, skill_embedding) * 0.6 +
  category_match(query_domain, skill_domain) * 0.25 +
  recency_weight(days_since_last_use) * 0.15
) * decay_factor(age_in_days)
```

**Decay function** (5%/day per Tablet VIII):
```
decay_factor = 0.95 ^ (age_days)
```

Stale skills confidence drops. Run weekly:
```bash
herald decay_vibe_confidence --threshold=0.60  # Remove edges <0.60
```

---

## Sphere Role Assignments (ZTE Protocol)

| Sphere | Primary Intent | Triggers | Confidence |
|--------|---|---|---|
| **Scout** | Find bugs, errors, anomalies | "diagnose", "debug", "what went wrong" | Tablet I + III |
| **Lens** | Explore codebase, understand flow | "how does", "where is", "show me" | Graph position |
| **Nexus** | Orchestrate multi-agent tasks | "execute workflow", "coordinate", "run steps" | Task dependency |
| **Titan** | Product-level prioritization | "what should I build", "prioritize" | User intent + impact |
| **Builder** | Implement features, write code | "build", "implement", "code" | Capability match |
| **Sentinel** | Security + vulnerability detection | "secure", "audit", "vulnerability" | Domain + recency |
| **Canon** | Compliance checking | "compliance", "wcag", "owasp" | Explicit tag match |
| **Palette** | Accessibility + design | "accessible", "design", "component" | A11y intent |

---

## Next: Integrate Antigravity Skills

See `/herald-integration-antigravity.md` for curated list + Herald registration.

---

*Semantic search skill for Sphere OS*
*Part of ZTE-20260319-0001 sprint*
*Root: Tablet III (The Graph Is The Memory) + Tablet VIII (Vibe Graph Promise)*
