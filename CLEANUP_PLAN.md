# AKASHPORTFOLIO Cleanup & Fix Plan

**Status**: In Progress
**Created**: 2026-03-03
**Target Branch**: `claude/review-changes-mma092p8jzyjwkor-cHlb7` → merge to `main`

---

## Overview

This plan addresses critical technical debt and project organization issues identified in the recent git history. The goal is to prepare the project for production-ready state without changing UI/copy unless absolutely necessary.

---

## Issues & Fixes

### 1. **Dual Lock Files (CRITICAL)**
- **Issue**: Both `package-lock.json` and `yarn.lock` exist, causing package manager conflicts
- **Fix**:
  - [ ] Determine primary package manager (npm or yarn)
  - [ ] Remove the unused lock file
  - [ ] Document in README which package manager to use
- **Files Affected**:
  - `package-lock.json` (285KB)
  - `yarn.lock` (120KB)
- **Priority**: CRITICAL
- **Impact**: Prevents clean dependency installation

### 2. **Hardcoded Copy Outside i18n**
- **Issue**: Latest commit (`3327390`) fixed hardcoded text in `index.html`, indicating bypass of i18n system
- **Fix**:
  - [ ] Audit all `.html` files for hardcoded copy
  - [ ] Move any hardcoded strings to `i18n.js`
  - [ ] Verify all user-facing text goes through localization system
- **Files to Audit**:
  - `apps/web/index.html`
  - `apps/web/contact.html`
- **Priority**: HIGH
- **Impact**: Inconsistent localization, maintenance burden

### 3. **Orphaned Work-Item Images**
- **Issue**: `work-item-6` through `work-item-10` and `work-metamofosis-hero.webp` deleted without verification
- **Fix**:
  - [ ] Check `featured-work.js` for references to deleted images
  - [ ] Verify no broken image links in UI
  - [ ] Document which work items are currently displayed
- **Files to Check**:
  - `apps/web/js/featured-work.js`
  - `apps/web/index.html`
- **Priority**: MEDIUM
- **Impact**: Potential 404s on portfolio items

### 4. **Large Image Assets**
- **Issue**: `work-item-4.jpg` (2.66MB) and `work-item-5.jpg` (2.72MB) impact page load
- **Fix**:
  - [ ] Run image optimization (consider WebP conversion, compression)
  - [ ] Keep images under 500KB target
  - [ ] Document image optimization process in README
- **Files Affected**:
  - `apps/web/public/images/work-items/work-item-4.jpg`
  - `apps/web/public/images/work-items/work-item-5.jpg`
- **Priority**: MEDIUM
- **Impact**: Page load performance, mobile UX

### 5. **Test Scripts at Repo Root (CLEANUP)**
- **Issue**: Dev scripts committed to root directory
- **Fix**:
  - [ ] Move `test_synthia_api.py` and `test_synthia_api_urllib.py` to proper location (e.g., `tests/` or `scripts/`)
  - [ ] OR remove if no longer needed
  - [ ] Update `.gitignore` if these are generated/temporary files
- **Files Affected**:
  - `test_synthia_api.py`
  - `test_synthia_api_urllib.py`
- **Priority**: LOW
- **Impact**: Repository cleanliness

### 6. **Synthia Control Room - Code Review**
- **Issue**: Large surface area added with control-room app (agents, LLM orchestration, git management)
- **Fix**:
  - [ ] Verify `sanitized-skills.json` contains no credentials or internal endpoints
  - [ ] Review `perplexity-logic.ts` and `orgo.ts` for API key exposure
  - [ ] Ensure git-manager has proper authentication context
  - [ ] Document all new APIs and external integrations in `agents.md`
- **Files to Review**:
  - `apps/control-room/src/lib/sanitized-skills.json`
  - `apps/control-room/src/lib/perplexity-logic.ts`
  - `apps/control-room/src/lib/orgo.ts`
  - `apps/control-room/src/lib/git-manager.ts`
- **Priority**: HIGH
- **Impact**: Security, API stability

### 7. **Styling - Spanish Localization**
- **Issue**: Large CSS changes for Spanish contact page suggest potential responsive design issues
- **Fix**:
  - [ ] Test contact page on mobile for both EN and ES
  - [ ] Verify no hardcoded text in CSS (`:before`/`:after` content)
  - [ ] Document any language-specific CSS patterns in README
- **Files to Review**:
  - `apps/web/css/contact.css`
- **Priority**: MEDIUM
- **Impact**: Mobile UX consistency

---

## Documentation Files to Create

### agents.md
Tracks all agent/automation work, workflow integrations, and AI-powered features.

### skills.md
Documents custom skills, Claude Code extensions, and skill training data for future automation.

---

## Execution Plan (in order)

1. **Setup & Documentation** (This phase)
   - Create CLEANUP_PLAN.md ✓
   - Create agents.md (tracks AI/automation features)
   - Create skills.md (training data for skill creation)
   - Use TodoWrite to track all beads

2. **Phase 1: Critical Fixes**
   - Resolve dual lock file issue
   - Review Synthia security (sanitized-skills.json, API keys)
   - Audit hardcoded copy in HTML

3. **Phase 2: Code Quality**
   - Check featured-work.js for orphaned image references
   - Move/remove test scripts
   - Verify image optimization

4. **Phase 3: Merge & Deploy**
   - Test all changes locally
   - Commit fixes with clear messages
   - Push to feature branch
   - Create PR and merge to main

---

## Git Strategy

- **Current Branch**: `claude/review-changes-mma092p8jzyjwkor-cHlb7`
- **Target**: Merge all fixes to `main`
- **Commits**: One focused commit per fix area
- **Cleanup**: Ensure working tree is clean before merge

---

## Notes

- Do NOT change UI/copy unless fixing specific issues
- All changes must be documented in agents.md and skills.md
- Use breadcrumb/bead tracking for every action
- Final state: Clean working tree, all changes pushed, ready for next phase
