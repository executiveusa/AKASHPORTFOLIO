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

## Revision History

### 2026-03-03
- Created skills.md
- Documented 10 core skills
- Added workflow patterns
- Included training data templates
- Established metrics framework
