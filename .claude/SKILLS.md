# KUPURI MEDIA™ Sphere OS — Complete Skills Manifest

**Version**: 3.0 (Enhanced with Land the Plane™ + Superpowers + jcodemunch)  
**Last Updated**: 2026-05-09  
**Status**: 🟢 PRODUCTION ACTIVE

---

## 🎯 Quick Reference

### By Agent Role

| Agent | Primary Skills | Secondary Skills |
|-------|---|---|
| **SYNTHIA™** (Orchestrator) | land-the-plane, dispatching-parallel-agents, verification-before-completion | orchestration-workflows, architecture |
| **ALEX™** (Strategist) | brainstorming, writing-plans, using-superpowers | competitive-analysis, market-research |
| **CAZADORA™** (Hunter) | subagent-driven-development, systematic-debugging, search-ast | lead-enrichment, prospecting |
| **FORJADORA™** (Builder) | executing-plans, test-driven-development, using-git-worktrees | code-generation, refactoring |
| **SEDUCTORA™** (Closer) | requesting-code-review, receiving-code-review, writing-skills | sales-automation, crm-integration |
| **CONSEJO™** (Facilitator) | dispatching-parallel-agents, verification-before-completion | conflict-resolution, knowledge-sharing |
| **DR. ECONOMÍA** (Finance) | analyzing-perf, get-revenue-data, arbitrage-detection | financial-modeling, budget-optimization |
| **DRA. CULTURA** (Content) | writing-skills, brainstorming, using-superpowers | content-creation, brand-strategy |
| **ING. TEKNOS** (Infrastructure) | test-driven-development, systematic-debugging, ci-cd-pipeline | architecture-patterns, security-hardening |

---

## 📋 TIER 1: CORE LANDING SKILLS

### 🛬 Land the Plane™
**Invocation**: `land the plane`  
**Agent**: SYNTHIA™ (Orchestrator)  
**Type**: Autonomous Workflow  
**Purpose**: Full CI/CD delivery pipeline - code review → PR creation → CI monitoring → auto-fix → merge

**Capabilities**:
- ✅ Pre-flight validation (unstaged changes, merge conflicts)
- ✅ Comprehensive code review (TypeScript, linting, tests, instruction compliance)
- ✅ Automated PR creation with gh CLI
- ✅ CI/CD status monitoring & auto-fix iteration
- ✅ Squash merge to main branch
- ✅ Smart retry logic (up to 5 attempts)

**Integration**:
- Powered by: Optio orchestration engine
- Uses: jcodemunch for code analysis
- Applies: Paul's Superpowers for code quality
- Fallback: Manual review available

**Example**:
```
User: "land the plane"
SYNTHIA: [Executes 5-phase workflow]
  Phase 1: Pre-flight check ✓
  Phase 2: Code review ✓
  Phase 3: Create PR #42 ✓
  Phase 4: Monitor CI ✓ (auto-fixed 2 linting issues)
  Phase 5: Merge to main ✓
Result: "Plane landed! PR #42 merged as commit abc123d"
```

---

## 📦 TIER 2: SUPERPOWERS SUITE

### Using Superpowers
**Agent**: DRA. CULTURA, ALEX  
**Type**: Skill Framework  
**Purpose**: Leverage advanced development techniques  
**Key Skills**:
- Advanced prompting patterns
- Tool use optimization
- Parallel execution strategies

### Subagent-Driven Development
**Agent**: CAZADORA, FORJADORA  
**Type**: Multi-Agent Pattern  
**Purpose**: Structured code review & implementation workflow
- Spec reviewer agent
- Implementer agent
- Code quality reviewer agent

### Brainstorming
**Agent**: DRA. CULTURA, ALEX  
**Type**: Creative Process  
**Purpose**: Idea generation with structured output
- Visual companion generation
- Spec document review
- Cross-domain ideation

### Writing Plans
**Agent**: SYNTHIA, ALEX  
**Type**: Documentation  
**Purpose**: Strategic planning with verification
- Plan document structure
- Plan document reviewer
- Execution readiness check

### Executing Plans
**Agent**: FORJADORA, ING. TEKNOS  
**Type**: Implementation  
**Purpose**: Turn plans into code
- Phased execution
- Checkpoints & verification
- Progress tracking

### Requesting Code Review
**Agent**: FORJADORA  
**Type**: Quality Gate  
**Purpose**: Structured code review request
- Code reviewer assignment
- Review criteria specification
- Feedback aggregation

### Receiving Code Review
**Agent**: SEDUCTORA, FORJADORA  
**Type**: Response & Iteration  
**Purpose**: Address review feedback
- Comment analysis
- Fix prioritization
- Reviewer negotiation

### Writing Skills
**Agent**: DRA. CULTURA  
**Type**: Meta-Framework  
**Purpose**: Create custom skills
- Skill testing with subagents
- Persuasion principles
- Anthropic best practices
- Examples: CLAUDE_MD_TESTING

### Dispatching Parallel Agents
**Agent**: SYNTHIA, CONSEJO  
**Type**: Orchestration  
**Purpose**: Coordinate multi-agent tasks
- Parallel execution
- Dependency management
- Result aggregation

### Verification Before Completion
**Agent**: SYNTHIA, ING. TEKNOS  
**Type**: Quality Assurance  
**Purpose**: Final validation step
- Comprehensive testing
- Requirement verification
- Sign-off criteria

### Using Git Worktrees
**Agent**: FORJADORA  
**Type**: Development Workflow  
**Purpose**: Isolated branch management
- Worktree creation
- Multi-task parallelization
- Clean cleanup

### Finishing a Development Branch
**Agent**: SYNTHIA, FORJADORA  
**Type**: Workflow Completion  
**Purpose**: Safe branch cleanup & merge
- Merge strategy selection
- Conflict resolution
- Remote cleanup

### Test-Driven Development
**Agent**: ING. TEKNOS, FORJADORA  
**Type**: Development Pattern  
**Purpose**: Test-first coding methodology
- Test structure
- Anti-patterns to avoid
- Coverage validation

### Systematic Debugging
**Agent**: ING. TEKNOS, CAZADORA  
**Type**: Problem-Solving  
**Purpose**: Root cause analysis & resolution
- Condition-based waiting
- Defense-in-depth
- Root cause tracing
- Test pressure scenarios

---

## 🛠️ TIER 3: MATTPOCOCK SKILLS

### Productivity Skills
- `caveman` - Simplification for maximum clarity
- `git-guardrails-claude-code` - Safety constraints for git operations
- `setup-pre-commit` - Pre-commit hook configuration

### Engineering Skills
- Architecture decision records
- Design patterns
- Performance optimization
- Security hardening

### In-Progress Skills
- `writing-fragments` - Content decomposition
- `writing-shape` - Content structuring
- `writing-beats` - Narrative pacing
- `handoff` - Project handover protocol

### Miscellaneous Skills
- `scaffold-exercises` - Generate practice exercises
- Multiple utility skills for common tasks

---

## 🧠 TIER 4: JCODEMUNCH INTEGRATION

### Bundled Capabilities

**Code Indexing**:
- Multi-language AST parsing (19+ languages)
- Incremental indexing with SQLite storage
- Symbol resolution & cross-references
- Import graph building

**Code Retrieval**:
- Semantic + lexical + structural search fusion
- BM25 ranking with PageRank
- Token budget-aware context bundling
- Confidence scoring

**Code Analysis**:
- Complexity scoring (cyclomatic, nesting, parameters)
- Call hierarchy traversal (callers/callees)
- Impact analysis (transitive blast radius)
- Churn rate calculation (git commit history)
- Hotspot identification (risk x complexity)

**Code Intelligence**:
- Git provenance per symbol (authorship lineage)
- Semantic commit classification
- PR risk profiling (composite scoring)
- Tectonic mapping (logical module topology)
- Signal chain discovery (event flow tracing)
- Cross-repo package registry
- Untested symbol detection
- Anti-pattern detection via AST

**Code Visualization**:
- Universal Mermaid renderer
- Auto-diagram type selection (flowchart/sequence)
- Visual signal encoding
- Optional mmd-viewer integration

**Code Health**:
- Repo health snapshot
- Performance telemetry (per-tool latency p50/p95/max)
- Agent config auditing
- Token waste detection

**CLI Entrypoint**: `gcm` for codebase Q&A

---

## 🔌 TIER 5: NATIVE CLAUDE CODE SKILLS

### session-start-hook
**Purpose**: Initialize repositories for Claude Code on web  
**Use When**: Setting up projects for automated testing/linting  
**Features**: Auto-detection, hook setup, test configuration

### gstack
**Purpose**: Headless browser for QA testing  
**Use When**: Testing deployments, verifying user flows  
**Features**: Element interaction, responsive testing, screenshot capture

### update-config
**Purpose**: Configure Claude Code harness via settings.json  
**Use When**: Setting permissions, env vars, hooks  
**Features**: Automated behaviors, permission management

### keybindings-help
**Purpose**: Customize keyboard shortcuts  
**Use When**: Rebinding keys, adding chords  
**Features**: ~/.claude/keybindings.json management

### simplify
**Purpose**: Code review for reuse & efficiency  
**Use When**: Post-implementation cleanup  
**Features**: Duplicate detection, refactoring suggestions

### fewer-permission-prompts
**Purpose**: Reduce permission prompts via allowlist  
**Use When**: Streamlining workflows  
**Features**: Transcript analysis, smart allowlist generation

### loop
**Purpose**: Recurring task execution  
**Use When**: Polling for status, continuous monitoring  
**Features**: Interval-based execution (default 10m)

### claude-api
**Purpose**: Build & debug Claude API / Anthropic SDK apps  
**Use When**: Using Anthropic SDK in code  
**Features**: Model migration, prompt caching, managed agents

### theater-e2e
**Purpose**: Theater E2E testing  
**Use When**: End-to-end test coverage  
**Features**: Automated test generation & execution

### init
**Purpose**: Initialize CLAUDE.md documentation  
**Use When**: Setting up new projects  
**Features**: Auto-generated project structure docs

### review
**Purpose**: Comprehensive pull request review  
**Use When**: Before PR merge  
**Features**: Code quality analysis, suggestion generation

### security-review
**Purpose**: Security vulnerability analysis  
**Use When**: Before deployment  
**Features**: OWASP scanning, CVE detection

---

## 🎮 SYNTHIA AGENT SKILL DISPATCH

### Skill Selection Logic

```
REQUEST → INTENT EXTRACTION
  ↓
COMPLEXITY ASSESSMENT (jcodemunch)
  ├─ LOW: Single agent (FORJADORA for code)
  ├─ MEDIUM: Multi-agent (dispatching-parallel-agents)
  └─ HIGH: Orchestration (land-the-plane + superpowers)
  ↓
AGENT ASSIGNMENT
  ├─ Code delivery → SYNTHIA (land-the-plane)
  ├─ Strategic planning → ALEX (writing-plans)
  ├─ Lead generation → CAZADORA (subagent-driven-dev)
  ├─ Implementation → FORJADORA (executing-plans)
  ├─ Sales/Close → SEDUCTORA (requesting-code-review)
  ├─ Coordination → CONSEJO (dispatching-parallel-agents)
  ├─ Finance → DR. ECONOMÍA (analyzing-perf)
  ├─ Content → DRA. CULTURA (writing-skills)
  └─ Infrastructure → ING. TEKNOS (test-driven-dev)
  ↓
SKILL APPLICATION
  ├─ Apply superpowers for code quality
  ├─ Use jcodemunch for analysis
  ├─ Verify with verification-before-completion
  └─ Land with land-the-plane
  ↓
RESULT DELIVERY
```

---

## 📊 Skill Statistics

| Category | Count | Status |
|----------|-------|--------|
| Core Landing | 1 | 🟢 Active |
| Superpowers | 11 | 🟢 Active |
| Mattpocock | 15+ | 🟢 Active |
| jcodemunch | 40+ | 🟢 Active |
| Native Claude | 11 | 🟢 Active |
| **TOTAL** | **80+** | **🟢 ACTIVE** |

---

## 🚀 Usage Examples

### Example 1: Full Feature Delivery
```
User: "Implement user authentication"

SYNTHIA executes:
1. ALEX: Writing Plans → Design specification
2. FORJADORA: Executing Plans → Implementation
3. ING. TEKNOS: Test-Driven Dev → Test coverage
4. FORJADORA: Requesting Code Review → Review round
5. SEDUCTORA: Receiving Code Review → Address feedback
6. SYNTHIA: Land the Plane → Merge to main

Result: ✅ Feature merged, all checks green
```

### Example 2: Code Quality Focus
```
User: "land the plane"

SYNTHIA executes (automated):
1. Code review with jcodemunch analysis
2. TypeScript/linting validation
3. Auto-fix common issues
4. Create PR (#123)
5. Monitor CI/CD checks
6. Squash merge to main

Result: ✅ PR #123 merged with auto-fixes applied
```

### Example 3: Parallel Development
```
User: "We need 3 features in parallel"

SYNTHIA executes:
1. Dispatching Parallel Agents
   ├─ FORJADORA on Feature A
   ├─ CAZADORA investigating Feature B requirements
   └─ DRA. CULTURA planning Feature C content

2. Verification Before Completion (all tasks)
3. Land the Plane (consolidated PR)

Result: ✅ All 3 features merged simultaneously
```

---

## 🔐 Skill Governance

### Permission Model
- ✅ Code reading (no permission needed)
- ✅ Local file operations (git, npm, bash)
- ⚠️ External API calls (require explicit auth)
- 🔐 Destructive operations (prompt required)

### Rate Limiting
- Default: 10 requests/minute per agent
- Burst: Up to 50 for orchestration skills
- jcodemunch: Unlimited (local indexing)

### Fallback Behavior
- land-the-plane: Manual merge if auto-merge fails
- Superpowers: Graceful degradation to simpler approach
- jcodemunch: Local analysis if API unavailable

---

## 📚 Documentation References

| Resource | Location | Purpose |
|----------|----------|---------|
| API Migration | `API_MIGRATION_GUIDE.md` | Backend integration |
| Testing Guide | `TESTING_CHECKLIST.md` | QA procedures |
| Deployment | `DEPLOYMENT_GUIDE.md` | Production readiness |
| Build Summary | `BUILD_SUMMARY.md` | Project overview |
| This File | `SKILLS.md` | Skill registry |

---

## 🔄 Continuous Improvement

### Skill Feedback Loop
```
Skill Execution
  ↓
Confidence Scoring (jcodemunch)
  ↓
Performance Telemetry
  ↓
Tuning Weights (if needed)
  ↓
Reindex Codebase
  ↓
Next Execution (improved)
```

### Weekly Review
- jcodemunch index health check
- Skill success rate tracking
- Agent specialization validation
- Token efficiency metrics

---

## 🎓 Training & Onboarding

### For New Developers
1. Read this SKILLS.md file
2. Try `/office-hours` (gstack) for feature planning
3. Practice with smaller tasks before `land-the-plane`
4. Review code with `review` skill

### For KUPURI Agents
1. SYNTHIA: Master `land-the-plane` workflow
2. FORJADORA: Focus on TDD + execution
3. CAZADORA: Specialize in analysis + debugging
4. SEDUCTORA: Own code review + negotiation
5. All: Use superpowers for quality multiplier

---

## 📞 Support

**Issues & Escalation**:
- Skill failures: Check `.claude/` logs
- jcodemunch issues: Run `gcm --health-check`
- Permission prompts: Use `fewer-permission-prompts`
- Configuration: Use `update-config` skill

**Contact**: SYNTHIA™ (Agent) or engineering@kupuri.media

---

**Last Status**: ✅ All 80+ skills active and tested  
**Next Maintenance**: Weekly skill tuning via jcodemunch feedback  
**Version History**: v1.0 (initial) → v2.0 (superpowers) → v3.0 (land-the-plane)
