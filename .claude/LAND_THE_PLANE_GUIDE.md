# LAND THE PLANE™ — User Guide

**Status**: Production Ready  
**Version**: 1.0  
**Last Updated**: 2026-05-09

---

## Quick Start

```bash
# Trigger the autonomous workflow
land the plane

# That's it. The agent will:
# 1. Validate your code state (pre-flight)
# 2. Run comprehensive code review (TypeScript, linting, tests)
# 3. Create a pull request automatically
# 4. Monitor CI/CD checks in real-time
# 5. Auto-fix any failures (up to 5 attempts)
# 6. Squash merge to main when everything passes
```

---

## What Happens During a "Land the Plane" Workflow

### Phase 1: PRE-FLIGHT CHECK (30 seconds)
- ✅ Verifies no unstaged changes in git
- ✅ Confirms you're on a feature branch (not main)
- ✅ Tests for merge conflicts with target branch
- ✅ Displays any blocking issues before proceeding

**Success Criteria**: All checks pass, code is clean

### Phase 2: CODE REVIEW (1-2 minutes)
- ✅ TypeScript compilation check (`tsc --noEmit`)
- ✅ ESLint validation
- ✅ Test suite execution with coverage
- ✅ Instruction compliance verification (CLAUDE.md, commit format)

**Success Criteria**: No critical errors (warnings allowed), all tests pass

### Phase 3: CREATE PR (30 seconds)
- ✅ Pushes your feature branch to origin
- ✅ Creates pull request via GitHub CLI
- ✅ Sets auto-generated title and description
- ✅ Reports PR number for tracking

**Success Criteria**: PR successfully created and visible on GitHub

### Phase 4: MONITOR CI/CD & AUTO-FIX (3-5 minutes)
- ✅ Polls CI check status every 30 seconds
- ✅ Detects failures and attempts auto-fixes:
  - TypeScript errors → runs `npm run fix:types`
  - Linting issues → runs `npm run lint -- --fix`
  - Code formatting → runs `npm run format`
- ✅ Re-pushes fixes automatically
- ✅ Waits for CI to re-run and verify
- ✅ Handles review comments (if any)

**Success Criteria**: All CI checks pass, no blocking errors

### Phase 5: MERGE (30 seconds)
- ✅ Squash commits into single logical commit
- ✅ Merges to main branch via GitHub
- ✅ Deletes source branch on GitHub
- ✅ Checks out main and pulls latest

**Success Criteria**: PR merged, feature branch cleaned up, main updated

---

## Configuration Options

When invoking "land the plane", the following options can be customized:

```typescript
{
  targetBranch: "main",           // Branch to merge into
  autoFixAttempts: 5,             // Max auto-fix iterations
  squashOnMerge: true,            // Squash commits (vs merge commits)
  deleteSourceBranch: true,       // Delete feature branch after merge
  requireStatusChecks: true,      // Require all CI to pass
}
```

Default configuration is production-ready for most cases.

---

## Failure Scenarios & Troubleshooting

### Pre-Flight Failures

**Issue**: "Unstaged changes detected"
- **Cause**: You have modified files not yet committed
- **Fix**: Stage and commit all changes: `git add . && git commit -m "..."`
- **Prevention**: Ensure all work is committed before invoking

**Issue**: "Already on main. Create a feature branch first."
- **Cause**: You're on the main branch, not a feature branch
- **Fix**: Create feature branch: `git checkout -b feature/your-feature`
- **Prevention**: Always develop on feature branches

**Issue**: "Merge conflicts detected with target branch"
- **Cause**: Your branch diverged from main
- **Fix**: Manually resolve: `git merge main` → resolve conflicts → commit
- **Prevention**: Keep feature branch up-to-date with `git pull origin main`

### Code Review Failures

**Issue**: "TypeScript compilation errors found"
- **Cause**: Type mismatches or syntax errors
- **Fix**: Review compiler output and fix type issues manually
- **Auto-Fix**: Sometimes `npm run fix:types` can resolve common issues

**Issue**: "ESLint errors detected"
- **Cause**: Code style violations (unused vars, improper formatting, etc.)
- **Fix**: Run `npm run lint -- --fix` locally to see auto-fixable issues
- **Auto-Fix**: Workflow automatically attempts this during CI monitoring phase

**Issue**: "Tests failed or coverage below threshold"
- **Cause**: New code breaks existing tests or lacks coverage
- **Fix**: Write/update tests to cover new code
- **Note**: Warnings are non-blocking; only failures block landing

### CI/CD Monitoring Failures

**Issue**: "Exceeded max retries without passing all checks"
- **Cause**: CI checks failed 5+ times and auto-fix couldn't resolve
- **Fix**: Investigate the specific CI failure, fix manually, then retry
- **Escalation**: Check `.github/workflows/` to understand CI pipeline
- **Recovery**: You can manually fix code and re-trigger: `land the plane`

**Issue**: "Could not auto-fix issues"
- **Cause**: Problem requires manual intervention (logic error, not style)
- **Fix**: Examine CI logs and fix the root cause
- **Example**: Logic error in new feature that tests expose

### Merge Failures

**Issue**: "Merge failed"
- **Cause**: Branch protection rules, required approvals, or stale branch
- **Fix**: 
  - Wait for required approvals (if configured)
  - Update branch: `git pull origin main`
  - Retry: `land the plane`

---

## Integration with Superpowers & jcodemunch

### Automatic Activation

When "land the plane" runs:
- 🦸 **Superpowers** automatically enhances code quality
  - Advanced prompt patterns
  - Optimal tool use
  - Parallel execution strategies
- 📊 **jcodemunch** provides intelligent code analysis
  - Token budget optimization
  - Cross-reference verification
  - Anti-pattern detection

### No Additional Configuration Required

Both tools are pre-configured and activate automatically during Phase 2 (Code Review). No user action needed.

---

## Best Practices

### Do's ✅

- **Commit early and often** — Each logical change should be a separate commit
- **Run locally first** — Test `npm run dev`, `npm run test`, `npm run lint` before landing
- **Write clear commit messages** — Follow conventional commit format (feat:, fix:, etc.)
- **Update docs** — If adding new features, update README or CLAUDE.md
- **Test edge cases** — Ensure tests cover happy path AND error scenarios
- **Small PRs** — Land multiple small changes faster than one massive PR

### Don'ts ❌

- **Don't land with unstaged changes** — Pre-flight will catch and block you
- **Don't merge directly to main** — Always use feature branches + land the plane
- **Don't ignore warnings** — Even "non-blocking" warnings suggest improvements
- **Don't add large dependencies** — Discuss with team first
- **Don't touch shared code without tests** — Changes to core modules need coverage
- **Don't commit secrets** — Pre-commit hooks should catch these, but verify

---

## Naming Conventions

### Branch Names

Feature branches should follow this pattern:

```
feature/short-description      # New feature
fix/bug-description            # Bug fix
refactor/improvement-name      # Code quality improvements
docs/update-name               # Documentation updates
```

Examples:
```
feature/dark-mode-toggle
fix/header-navigation-bug
refactor/reduce-bundle-size
docs/api-authentication
```

### Commit Messages

Follow [conventional commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `perf`, `ci`, `chore`

Examples:
```
feat(auth): add OAuth integration
fix(cart): prevent duplicate items on rapid clicks
refactor(api): consolidate error handling
docs(setup): add installation guide
```

---

## Performance Metrics

### Typical Execution Times

| Phase | Duration | Notes |
|-------|----------|-------|
| Pre-flight | 10-30s | Fast validation |
| Code Review | 30-90s | Depends on codebase size |
| Create PR | 10-30s | Network dependent |
| Monitor CI (no failures) | 1-3 min | Single pass through CI |
| Monitor CI (with 1 auto-fix) | 2-4 min | 1 failure + recovery |
| Monitor CI (with 2+ fixes) | 4-6 min | Multiple failure cycles |
| Merge | 10-20s | Final clean-up |
| **TOTAL (happy path)** | **3-7 minutes** | Fully automated |

### Manual Workflow Comparison

Traditional approach (without automation):
- Local code review: 5-10 min
- Push and create PR: 2-3 min
- Wait for CI: 3-5 min (plus time to notice failure)
- Manual fixes: 5-10 min per issue
- Re-push and verify: 3-5 min per iteration
- **TOTAL (typical)**: 25-50+ minutes with waits

**Land the Plane saves**: 15-40 minutes per PR through automation and parallel checking.

---

## Detailed Examples

### Example 1: Simple Feature (Happy Path)

```bash
# Create feature branch
$ git checkout -b feature/dark-mode

# Write code
$ echo "// Dark mode implementation" > src/theme.ts

# Commit
$ git add src/theme.ts
$ git commit -m "feat(theme): add dark mode support"

# Land the plane
$ land the plane

🛫 LANDING THE PLANE™ - Full CI/CD Workflow

📋 PHASE 1: PRE-FLIGHT CHECK
✅ Pre-flight check passed

📋 PHASE 2: CODE REVIEW
🔍 Analyzing codebase with jcodemunch...
✅ Verifying instruction compliance...
Findings:
✅ Code review passed

📋 PHASE 3: CREATE PR
📝 Creating pull request...
✅ PR #42 created

📋 PHASE 4: MONITOR CI/CD & AUTO-FIX

🔄 Check cycle 1/5...
PR State: ready
Checks: {"tests":"pending","lint":"pending","types":"pending"}
⏳ Waiting 30 seconds for CI...

🔄 Check cycle 2/5...
PR State: ready
Checks: {"tests":"success","lint":"success","types":"success"}
✅ All checks passed!

📋 PHASE 5: MERGE TO MAIN
🚀 Merging PR...
✅ PR #42 merged successfully!

🛬 PLANE LANDED SUCCESSFULLY! ✨

✅ SUCCESS: PR #42 merged to main
# Total time: 4 minutes 23 seconds
```

### Example 2: Feature with Auto-Fix (Linting)

```bash
$ git checkout -b feature/new-endpoint
$ # Write API code with style issues...
$ git add src/api.ts
$ git commit -m "feat(api): add user export endpoint"

$ land the plane

🛫 LANDING THE PLANE™ - Full CI/CD Workflow

📋 PHASE 1: PRE-FLIGHT CHECK
✅ Pre-flight check passed

📋 PHASE 2: CODE REVIEW
Findings:
⚠️ ESLint errors detected
✅ Code review passed with warnings

📋 PHASE 3: CREATE PR
✅ PR #43 created

📋 PHASE 4: MONITOR CI/CD & AUTO-FIX

🔄 Check cycle 1/5...
PR State: ready
Checks: {"tests":"success","lint":"failure","types":"success"}
⚠️ CI failed, attempting auto-fix...
🔧 Attempting auto-fixes...
✅ Auto-fixes applied
📤 Pushed fixes to PR
⏳ Waiting 30 seconds for CI...

🔄 Check cycle 2/5...
PR State: ready
Checks: {"tests":"success","lint":"success","types":"success"}
✅ All checks passed!

📋 PHASE 5: MERGE TO MAIN
✅ PR #43 merged successfully!

🛬 PLANE LANDED SUCCESSFULLY! ✨

✅ SUCCESS: PR #43 merged to main
# Total time: 5 minutes 47 seconds
# (Auto-fix added ~2 min vs happy path)
```

### Example 3: Pre-Flight Failure (Branch Not Updated)

```bash
$ land the plane

🛫 LANDING THE PLANE™ - Full CI/CD Workflow

📋 PHASE 1: PRE-FLIGHT CHECK
Issues found:
❌ Merge conflicts detected with target branch

❌ FAILED: Pre-flight check failed

# Resolution steps:
$ git fetch origin main
$ git merge origin/main
# Resolve any conflicts in editor
$ git add .
$ git commit -m "merge: resolve conflicts with main"
$ land the plane  # Try again
```

---

## Support & Escalation

### Common Issues

**"Command not found: land the plane"**
- Ensure you're in the AKASHPORTFOLIO repository
- Verify `.claude/skills/land-the-plane.ts` exists
- Check that the skill is properly registered in SKILLS.md

**"gh: command not found"**
- Install GitHub CLI: `brew install gh` (macOS) or `choco install gh` (Windows)
- Authenticate: `gh auth login`

**"Cannot push to origin"**
- Verify git credentials: `git config user.email`
- Check remote: `git remote -v`
- Retry authentication if needed

### Debugging

To understand what went wrong:

1. **Check git status**: `git status`
2. **Review recent commits**: `git log --oneline -5`
3. **Inspect CI logs**: Visit the PR on GitHub → Checks tab
4. **Manual code review**: Run the phases locally:
   ```bash
   npm run lint
   npm run test
   npx tsc --noEmit
   ```

### Escalation Path

If "land the plane" fails repeatedly:

1. Review the specific error message
2. Fix the issue manually (don't retry landing)
3. Commit the fix: `git add . && git commit -m "fix: ..."`
4. Try "land the plane" again
5. If still failing, investigate the CI pipeline in `.github/workflows/`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-09 | Initial release with 5-phase workflow |
| — | — | Planned: Support for custom CI providers |
| — | — | Planned: Per-team configuration profiles |

---

## Related Documentation

- **SKILLS.md** — Complete skill manifest and agent dispatch
- **CLAUDE.md** — Project instructions and entry points
- **DEPLOYMENT_GUIDE.md** — Post-merge deployment verification
- **TESTING_CHECKLIST.md** — QA procedures
- **API_MIGRATION_GUIDE.md** — Backend integration details

---

**Questions?** Check CLAUDE.md or review the implementation in `.claude/skills/land-the-plane.ts`

*Ready to land? Just say "land the plane"! 🛫*
