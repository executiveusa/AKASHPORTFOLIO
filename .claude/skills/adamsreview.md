# Skill: Adam's Review — Full Code Review Pipeline

> **Source**: https://github.com/adamjgmiller/adamsreview
> **Philosophy**: Structured, disciplined code review with explicit finding IDs, severity levels, and automated patch generation.

## Review Phases

### Phase 1: Security Scan
- Hardcoded secrets, API keys, PATs in source
- Env vars referenced in code but not in `.env.example`
- Git remote URLs containing credentials (e.g. `ghp_xxx@github.com`)
- `.env` files accidentally committed

### Phase 2: Broken Links & Dead Code
- `alert('Coming Soon')` placeholder links in HTML
- `href="#"` links with no real destination
- Commented-out nav items that should be real pages
- Unused imports, dead components, orphaned files

### Phase 3: Build Health
- TypeScript errors (`tsc --noEmit`)
- ESLint warnings/errors
- Dependency version mismatches
- Missing `peerDependencies`

### Phase 4: Architecture Issues
- Nested duplicate directories
- Circular imports
- Missing environment variable documentation
- Cross-app dependencies that break standalone deploys

### Phase 5: UX / Design Review
- Missing `alt` attributes on images
- Missing `<title>` and meta description tags
- Broken i18n keys (data-i18n referencing missing keys)
- Footer links pointing to `alert()` instead of real pages

## Finding Format
Each finding gets a unique ID:
```
[AR-001] SEVERITY: CRITICAL | Type: Security | File: cult-directory-template/.git/config
Hardcoded GitHub PAT in git remote URL — token redacted from docs
Fix: git remote set-url origin https://github.com/executiveusa/cult-directory-template.git
Status: FIXED ✅
```
Footer link uses alert('Coming Soon') for Design Archive
Fix: Link to real URL or remove link entirely

[AR-003] SEVERITY: HIGH | Type: Architecture | File: apps/control-room/
Nested apps/control-room/apps/ subdirectory suggests duplicate structure
Fix: Audit and remove nested duplicate
```

## Application to This Project

Run before every merge to main:
```bash
# Phase 1: Security
git log --all --full-history -- "*.env" # check if env files ever committed
grep -r "ghp_\|sk-\|AKIA" .git/config  # check remote URLs for secrets

# Phase 2: Broken links
grep -rn "alert\|Coming Soon\|href=\"#\"" apps/web --include="*.html"

# Phase 3: Build
cd apps/control-room && npx tsc --noEmit

# Phase 4: Architecture  
Get-ChildItem -Recurse -Depth 3 | Where-Object Name -eq "apps" | Select FullName
```
