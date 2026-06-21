# Skill: Ponytail — The Lazy Senior Dev Code Review

> **Source**: https://github.com/DietrichGebert/ponytail
> **Philosophy**: "Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote."

## Core Principle
Before writing ANY new code or file, ask: **Can this be deleted instead?**

## Ponytail Rules (apply in order)

### Rule 1: Delete First
Before creating a new util, helper, abstraction, or file — search if one already exists.
Before keeping a file — ask: "What breaks if I delete this?"
Before refactoring — ask: "What if we just removed this feature?"

### Rule 2: Copy Don't Abstract (Until Third Use)
Do not extract shared logic until you have **3+ identical usages**. Two is a coincidence, not a pattern.

### Rule 3: Files Should Explain Their Own Deletion
Every file in the repo should have a clear reason to exist. If you can't answer "why is this file here?" in one sentence, it should be deleted or merged.

### Rule 4: No Stale Docs
Any `.md` file that hasn't been updated in the same commit cycle as the code it documents is considered stale and should be deleted. One canonical `README.md` per project.

### Rule 5: Git Hygiene
- Agent working files (`memory/`, `beads/`, `.emerald-tablets-tm/`) are NEVER committed to source
- Build artifacts are NEVER committed
- One-time scripts (sync_session.bat, DEPLOY_NOW.md) are NEVER committed

## Application to This Project

Run Ponytail review before any PR by asking:
1. How many `.md` files are in the root? (Target: ≤3: README, CLAUDE, ARCHITECTURE)
2. Are any agent working dirs in git status? (Should always be zero)
3. Are there duplicate files across workspace copies? (Consolidate to one)
4. Are there any `alert('Coming Soon')` placeholders? (Replace with real links or delete)
5. Are there any nested duplicate directories? (e.g. control-room inside control-room)

## Quick Cleanup Commands
```bash
# Find all .md files larger than 5KB in project root (likely stale docs)
find . -maxdepth 2 -name "*.md" -size +5k | grep -v node_modules | grep -v .claude

# Find files that should be gitignored but aren't
git ls-files | grep -E "(memory|beads|target|\.emerald)" 

# Check for TODO/COMING SOON placeholders in HTML
grep -r "Coming Soon\|alert('Coming" apps/web --include="*.html"
```
