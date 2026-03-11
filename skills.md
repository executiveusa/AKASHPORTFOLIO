# Skills & Automation Training Data

**Last Updated**: 2026-03-03
**Status**: Foundation Phase
**Purpose**: Document reusable skills and patterns for system training and automation

---

## Overview

This file serves as a training dataset for:
1. Creating new Claude Code skills and automations
2. Defining agent capabilities and workflows
3. Documenting system patterns and best practices
4. Training future AI systems on project-specific patterns

---

## Core Skills Inventory

### 1. Localization & i18n Management

**Skill Name**: `localize-content`
**Type**: Content Processing
**Status**: Active
**Location**: `apps/web/js/i18n.js`

#### Pattern
```javascript
// Input: English text
const text = "Welcome to our portfolio";

// Process: Map through i18n dictionary
const localized = i18n.translate('welcome_key', currentLanguage);

// Output: Localized text in current language
```

#### Use Cases
- Translate marketing copy
- Update feature descriptions
- Localize error messages
- Adapt date/time formats

#### Training Points
- Always map UI strings to i18n keys
- Avoid hardcoding text in HTML/CSS
- Test both EN and ES variants
- Use language fallback chains

#### Related Files
- `apps/web/js/i18n.js` (205 lines)
- `apps/web/index.html`
- `apps/web/contact.html`

---

### 2. Portfolio Asset Management

**Skill Name**: `manage-assets`
**Type**: File Operations
**Status**: Active (with warnings)
**Location**: `apps/web/public/images/`

#### Pattern
1. Source new work item (photo, screenshot, video)
2. Optimize for web (resize, compress, convert format)
3. Place in `work-items/` subdirectory
4. Register in `featured-work.js`
5. Test for 404s and load performance

#### Optimization Targets
- Target: < 500KB per image
- Format: JPEG or WebP
- Dimensions: Responsive-optimized
- Current Status: 2 files exceed target (work-item-4: 2.66MB, work-item-5: 2.72MB)

#### Known Issues
- Deleted items: work-item-6 through work-item-10 (Feb 28, 2026)
- Broken references may exist in featured-work.js
- Need audit of current work items displayed

#### Training Points
- Always optimize before committing
- Document which items are "active"
- Use WebP for new assets
- Implement lazy loading for images

---

### 3. Component-Based Responsive Design

**Skill Name**: `responsive-design`
**Type**: UI/CSS
**Status**: Active (Spanish variant needs review)
**Location**: `apps/web/css/`

#### Pattern
- Mobile-first CSS approach
- Language-aware media queries
- Breakpoint consistency across EN/ES

#### Files
- `globals.css` - Global typography, spacing, colors
- `contact.css` - Contact page layout (recently overhauled: 115 lines)
- `home.css` - Hero and home page
- `about.css` - About/services section

#### Language-Specific Patterns
- Spanish text tends to be longer (consider text expansion)
- RTL considerations if future Arabic support added
- Font rendering differences by language

#### Recent Changes
- Contact page CSS significantly refactored for Spanish (c6337fa)
- Hero footer overlap fixed (8c2d267)

#### Training Points
- Test language variants on all screen sizes
- Avoid hardcoding widths/heights
- Use CSS variables for theme colors
- Document breakpoints and rationale

---

### 4. Package Management & Dependency Resolution

**Skill Name**: `manage-dependencies`
**Type**: DevOps
**Status**: Critical - Needs Fix
**Location**: Root directory

#### Current State
- **ISSUE**: Both `package-lock.json` and `yarn.lock` present
- **Impact**: Conflicting lock strategies
- **Solution**: Choose primary manager (npm or yarn), remove other lock file

#### Pattern (POST-FIX)
```bash
# Recommended: Use npm (package-lock.json)
npm install                    # Uses package-lock.json
npm run dev:web              # Defined in root package.json

# OR alternate: Use yarn (yarn.lock)
yarn install
yarn dev:web
```

#### Monorepo Structure
- Root `package.json` defines workspaces
- Workspaces: `apps/*` (web, control-room)
- Each app can have independent package.json

#### Training Points
- Never commit both npm and yarn locks
- Document chosen package manager in README
- Use consistent lockfile format
- Verify CI/CD uses same manager

---

### 5. Security & Secrets Management

**Skill Name**: `audit-secrets`
**Type**: Security
**Status**: Critical Review Needed
**Location**: `apps/control-room/`

#### Pattern
1. Identify all external API integrations
2. Verify credentials are environment-injected
3. Confirm no hardcoded keys in code
4. Audit git history for accidental commits
5. Use `.env` for local development

#### Critical Files to Audit
- `lib/sanitized-skills.json` - Claims "sanitized" but needs verification
- `lib/perplexity-logic.ts` - LLM API integration
- `lib/orgo.ts` - Cloud platform integration
- `lib/git-manager.ts` - Git authentication

#### Training Points
- Never commit `.env` or `secrets.json`
- Use `[SANITIZED]` markers in documentation
- Rotate credentials if accidentally exposed
- Implement pre-commit hooks to catch secrets
- Log all API calls without sensitive data

---

### 6. Multi-Agent Coordination (Swarm)

**Skill Name**: `coordinate-agents`
**Type**: Agent Orchestration
**Status**: New (Feb 27, 2026)
**Location**: `apps/control-room/src/lib/swarm.ts`

#### Pattern
1. Define agent roles and capabilities
2. Create task queue with priorities
3. Distribute tasks across available agents
4. Collect and aggregate results
5. Handle failures with fallback strategies

#### Components
- Agent pool management
- Task scheduling
- Result aggregation
- Error handling

#### Training Points
- Agents should be stateless where possible
- Implement timeouts for hung tasks
- Log all agent activities for debugging
- Use circuit breakers for external APIs

---

### 7. Git Automation

**Skill Name**: `automate-git`
**Type**: CI/CD
**Status**: New (Feb 27, 2026)
**Location**: `apps/control-room/src/lib/git-manager.ts`

#### Pattern
- Clone/pull repositories
- Commit and push changes
- Branch management
- Merge conflict resolution (manual oversight required)

#### Security Considerations
- Store git credentials in environment
- Use SSH keys or personal access tokens
- Never log authentication details
- Implement access control for git operations

#### Training Points
- Always verify changes before committing
- Use clear, descriptive commit messages
- Implement branch protection rules
- Test git operations in isolated repos first

---

### 8. Real-Time Monitoring & Observability

**Skill Name**: `monitor-system`
**Type**: Telemetry
**Status**: New (Feb 27, 2026)
**Location**: `apps/control-room/src/lib/observability.ts`

#### Pattern
1. Capture system metrics (CPU, memory, uptime)
2. Track agent performance (task count, duration)
3. Log all significant events
4. Aggregate data for dashboard
5. Alert on anomalies

#### Metrics Tracked
- Agent status and utilization
- API response times
- Task success/failure rates
- System resource usage

#### Training Points
- Avoid over-logging (performance impact)
- Use structured logging format
- Implement sampling for high-volume events
- Secure telemetry data (no PII)

---

### 9. Perplexity Integration

**Skill Name**: `query-llm`
**Type**: LLM Integration
**Status**: New (Feb 27, 2026)
**Location**: `apps/control-room/src/lib/perplexity-logic.ts`

#### Pattern
1. Format user query
2. Call Perplexity API with context
3. Stream or batch response
4. Parse and validate output
5. Return structured data

#### Key Considerations
- API rate limits
- Token budget management
- Context preservation across calls
- Error handling for API failures

#### Training Points
- Document expected input/output formats
- Implement retry logic with exponential backoff
- Cache responses where appropriate
- Monitor API quota usage

---

### 10. Orgo Cloud Integration

**Skill Name**: `cloud-sync`
**Type**: Cloud Operations
**Status**: New (Feb 27, 2026)
**Location**: `apps/control-room/src/lib/orgo.ts`

#### Pattern
1. Establish secure connection to Orgo Cloud
2. Authenticate with provided credentials
3. Sync local state to cloud
4. Pull cloud updates
5. Handle sync conflicts

#### Marked as "Sanitized"
- May have credentials removed for security
- Verify actual implementation matches claims
- Document all external endpoints

#### Training Points
- Implement conflict resolution strategy
- Handle offline scenarios gracefully
- Encrypt sensitive data in transit
- Verify endpoint URLs are not internal IPs

---

## Workflow Patterns

### Deploy-and-Test Pattern
**Use Case**: Ship new feature with confidence

1. **Local Testing**
   - Run `npm run dev:web`
   - Verify in both EN and ES
   - Test on mobile devices

2. **Git Operations**
   - Create feature branch
   - Commit with clear message
   - Push to feature branch
   - Create PR for review

3. **Final Merge**
   - Address PR feedback
   - Test merged code
   - Deploy to production

### Content Update Pattern
**Use Case**: Update copy, features, or assets

1. **Prepare Content**
   - Extract text to i18n.js
   - Optimize new images (< 500KB)
   - Test all languages

2. **Audit**
   - Search for hardcoded strings
   - Verify CSS doesn't have text
   - Test responsive design

3. **Commit**
   - Single-purpose commit
   - Include before/after screenshots if UI changed
   - Reference related issue if applicable

---

## Training Data for Future Skills

### Skill: Auto-Localize Content
**Input**: English text block
**Process**: Parse text, extract to i18n.js, replace with key reference
**Output**: Updated HTML and i18n file
**Test**: Verify both EN and ES render correctly

### Skill: Optimize Images
**Input**: High-res image file
**Process**: Resize, compress, convert to WebP, validate < 500KB
**Output**: Optimized image file in correct directory
**Test**: Verify no visual quality loss, fast load time

### Skill: Audit Secrets
**Input**: Code directory
**Process**: Scan for API keys, passwords, URLs, credentials
**Output**: Security report with found items and recommendations
**Test**: Verify no false negatives, minimal false positives

### Skill: Fix Responsive Design
**Input**: Broken layout screenshot
**Process**: Identify breakpoint issue, adjust CSS, test all sizes
**Output**: Updated CSS file
**Test**: Verify responsive on mobile, tablet, desktop

---

## Metrics & Success Criteria

### Code Quality
- [ ] All user-facing text in i18n.js
- [ ] No hardcoded copy in HTML/CSS
- [ ] All images optimized < 500KB
- [ ] No broken image references

### Security
- [ ] No credentials in code or git history
- [ ] All APIs use environment variables
- [ ] Secrets audit completed
- [ ] Pre-commit hooks configured

### Performance
- [ ] Page load time < 3 seconds
- [ ] Image load optimized
- [ ] No 404s for images/assets
- [ ] Both EN and ES perform equally

---

## Related Documentation
- `agents.md` - Agent system documentation
- `CLEANUP_PLAN.md` - Current cleanup initiatives
- `synthia_core.md` - Core system architecture

---

---

## Skill 11: CLI-Anything — Creative Software Control

**Skill Name**: `cli-anything`
**Type**: Creative Execution / Tool Integration
**Status**: Active — Hardwired to all Synthia 3.0 agents (2026-03-11)
**Source**: https://github.com/HKUDS/CLI-Anything
**Lib**: `apps/control-room/src/lib/cli-anything.ts`
**API**: `apps/control-room/src/app/api/cli/route.ts`
**Agent Skill**: `apps/control-room/agents/_cli-anything.md`

### What It Does

CLI-Anything gives agents direct control over professional desktop software through structured CLI interfaces. Instead of generating text descriptions of deliverables, agents produce the actual files:

- **Before CLI-Anything**: "Here's how you should design the Instagram carousel..."
- **After CLI-Anything**: `cli-anything-inkscape export render carousel.pdf --format pdf` → actual PDF file delivered

### Pattern

```
Agent decision → POST /api/cli → child_process.execFile() → CLI tool → real software → real output file
```

### Tools Available

```typescript
type CLITool = 'gimp' | 'blender' | 'audacity' | 'inkscape' |
               'kdenlive' | 'shotcut' | 'libreoffice' | 'obs-studio' |
               'drawio' | 'anygen';
```

### API Interface

```typescript
// Simple command
POST /api/cli
{ tool: "gimp", command: ["canvas", "scale", "--width", "1080", "--height", "1920"] }

// High-level social asset helper
POST /api/cli
{ mode: "social_asset", sourcePath: "/tmp/photo.jpg", outputPath: "/out/ig.jpg", platform: "instagram" }

// Add captions to video
POST /api/cli
{ mode: "captions", inputVideo: "raw.mp4", outputVideo: "final.mp4",
  captions: [{ text: "Hook aquí", startSec: 0, endSec: 3 }] }

// Generate report (XLSX + PDF)
POST /api/cli
{ mode: "report", title: "Reporte Mensual", data: [...], outputDir: "/reports/2026-03" }

// Multi-step workflow
POST /api/cli
{ mode: "workflow", steps: [
  { tool: "kdenlive", command: ["project", "open", "video.mp4"] },
  { tool: "kdenlive", command: ["export", "render", "final.mp4", "--format", "mp4"] }
]}

// Discovery
GET /api/cli  →  { tools: [{tool, installed, description}], summary: {total, installed} }
```

### Training Rules

1. **Always check installation first**: `GET /api/cli?tool=<tool>` before using
2. **Use JSON output**: All commands return structured JSON — parse it, don't scrape text
3. **Prefer high-level helpers**: `social_asset`, `captions`, `report` before raw commands
4. **Batch into workflows**: One `mode: "workflow"` call > multiple sequential POST calls
5. **Real output, real dependencies**: CLI-Anything calls real software. Blender must be installed for Blender CLI to work.
6. **Error handling**: `CLIResult.success === false` → check `CLIResult.error`, don't retry blindly

### Agent-to-Tool Mapping (Training Matrix)

| Agent | Preferred Tools | Output Type |
|-------|----------------|-------------|
| Synthia Prime | libreoffice, anygen, drawio | Proposals, decks, org charts |
| Merlina | gimp, blender, inkscape | Images, renders, vectors |
| Lapina | kdenlive, inkscape | Videos, carousels |
| Lapina TikTok | kdenlive, audacity | 9:16 videos, audio |
| Lapina Instagram | gimp, inkscape | 1:1 images, carousels |
| Lapina LinkedIn | inkscape, libreoffice | PDFs, infographics |
| Indigo | obs-studio, kdenlive | Demo recordings, viral videos |
| Morpho | libreoffice, drawio | Reports, diagrams |
| Clandestino | libreoffice, anygen | Proposals, pitch decks |
| Ralphy | drawio, libreoffice | Coaching flows, audit reports |
| Ivette Voice | audacity | Audio polish |

### Install Commands

```bash
# Python packages (the CLI interfaces)
pip install cli-anything-gimp cli-anything-blender cli-anything-inkscape \
            cli-anything-kdenlive cli-anything-audacity cli-anything-libreoffice \
            cli-anything-obs-studio cli-anything-drawio cli-anything-anygen

# System dependencies (the actual software)
sudo apt install gimp blender inkscape kdenlive audacity libreoffice obs-studio
# or: brew install gimp blender inkscape kdenlive audacity libreoffice obs
```

---

## Skill 12: A/B Content Campaign Automation

**Skill Name**: `ab-content-campaign`
**Type**: Marketing Automation
**Status**: Active (2026-03-11)
**Lib**: `apps/control-room/src/lib/social-media.ts`
**API**: `apps/control-room/src/app/api/social/route.ts`

### Pattern

```
Brief → generateVariants() [MiniMax] → 3 variants (A/B/C) per platform → recordMetrics() → auto-winner
```

### Variants Structure

- **A**: Educational hook ("¿Sabías que...")
- **B**: Provocative hook ("La mayoría de X comete este error...")
- **C**: Story/results hook ("En 30 días logramos...")

### Winner Determination

```typescript
score = (leads × 10) + (engagementRate × 5) + clicks
// Highest score = winner → scale across all active channels
```

### Persistence

Campaigns stored to `.campaigns-store/campaigns.json` — survive server restarts.

---

## Skill 13: LLM Council Deliberation

**Skill Name**: `council-deliberation`
**Type**: Decision Making
**Status**: Active (2026-03-08)
**Lib**: `apps/control-room/src/lib/council.ts`
**API**: `apps/control-room/src/app/api/council/route.ts`

### Pattern (3 Phases)

```
Phase 1: perplexity + minimax + gemini → independent votes
Phase 2: synthia + devil-advocate → informed votes (see Phase 1)
Phase 3: synthesizeVotes() → final decision + action items
```

### Use Cases

- Strategic decisions (pricing, hiring, pivots)
- Campaign approvals for >$1k spend
- Technical architecture choices
- Client negotiation strategy

---

## Revision History

### 2026-03-11
- Added Skill 11: CLI-Anything (hardwired to all agents)
- Added Skill 12: A/B Content Campaign Automation
- Added Skill 13: LLM Council Deliberation
- Updated agent training matrix

### 2026-03-03
- Created skills.md
- Documented 10 core skills
- Added workflow patterns
- Included training data templates
- Established metrics framework
