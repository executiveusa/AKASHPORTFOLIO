# AKASHPORTFOLIO / Synthia 3.0 Project Setup

## Overview

This is a monorepo containing:
- **apps/web** - Portfolio website (Next.js/HTML/CSS/JS)
- **apps/control-room** - Synthia 3.0 Control Room dashboard (Next.js/React/TypeScript)

## Prerequisites

- **Node.js** 18+
- **npm** (not yarn - see Package Manager section below)
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd AKASHPORTFOLIO
```

### 2. Install Dependencies
```bash
# Use npm only (yarn.lock is removed and not supported)
npm install
```

### 3. Set Up Environment Variables
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# Required keys:
#   - ORGO_TOKEN (for Orgo Cloud integration)
#   - GITHUB_TOKEN (for git operations)
#   - PERPLEXITY_API_KEY (for LLM reasoning)
```

### 4. Run Development Server
```bash
# Run portfolio website
npm run dev:web

# Website will be available at http://localhost:5173 (or Vite default)
```

### 5. Build for Production
```bash
npm run build:web
```

## Package Manager: NPM Only

**Important**: This project uses **NPM only**. The `yarn.lock` file has been removed.

- Use `npm install` to add dependencies
- Use `npm run` to execute scripts
- All lock files use `package-lock.json`
- CI/CD pipelines should use `npm ci`

## Project Structure

```text
AKASHPORTFOLIO/
├── apps/
│   ├── web/                    # Portfolio website
│   │   ├── index.html
│   │   ├── contact.html
│   │   ├── css/               # Stylesheets (globals, home, contact, about)
│   │   ├── js/                # JavaScript modules
│   │   │   ├── i18n.js       # Bilingual localization (EN/ES)
│   │   │   └── featured-work.js
│   │   └── public/images/     # Image assets
│   │
│   └── control-room/          # Synthia 3.0 Dashboard
│       ├── src/
│       │   ├── app/           # Next.js app
│       │   │   └── api/      # API routes
│       │   ├── components/    # React components
│       │   │   ├── SynthiaTerminal
│       │   │   ├── SkillMarket
│       │   │   ├── TelemetryLog
│       │   │   ├── ViewingRoom
│       │   │   └── OrgoConsole
│       │   └── lib/           # Utilities and managers
│       │       ├── swarm.ts
│       │       ├── observability.ts
│       │       ├── git-manager.ts
│       │       ├── orgo.ts
│       │       ├── perplexity-logic.ts
│       │       └── sanitized-skills.json
│       └── package.json
│
├── CLEANUP_PLAN.md            # Technical debt fixes
├── agents.md                  # Agent systems documentation
├── skills.md                  # Reusable skills and patterns
├── synthia_core.md            # Core system architecture
├── PROJECT_SETUP.md           # This file
├── .env.example               # Environment variables template
├── .gitignore                 # Git exclusions
├── package.json               # Root workspace config
└── package-lock.json          # Dependency lock file (NPM only)
```

## Bilingual Support (English/Spanish)

The portfolio website supports both English and Spanish through the i18n system:

- **Location**: `apps/web/js/i18n.js`
- **Language Toggle**: User can switch between EN/ES
- **Coverage**: All UI text, button labels, and descriptions
- **Testing**: Always test both languages on all screen sizes

### Adding New Translatable Content

1. **Never hardcode text** in HTML or CSS
2. **Add text to i18n.js**:
   ```javascript
   i18n.messages = {
       en: {
           section_key: "English text here"
       },
       es: {
           section_key: "Texto en español aquí"
       }
   };
   ```
3. **Reference in HTML**:
   ```html
   <p data-i18n="section_key">English text here</p>
   ```

## Synthia 3.0 Control Room

The Control Room provides:
- **Autonomous Kernel** - LLM-powered decision making
- **Skill Market** - Browsable marketplace of agent capabilities
- **Terminal Interface** - Direct system command execution
- **Telemetry Dashboard** - Real-time system monitoring
- **Cloud Integration** - Orgo Cloud and Perplexity orchestration

### Architecture Components

- **Swarm Manager** (`lib/swarm.ts`) - Multi-agent coordination
- **Observability** (`lib/observability.ts`) - System monitoring
- **Git Manager** (`lib/git-manager.ts`) - Repository operations
- **OS Tools** (`lib/os-tools.ts`) - System-level commands
- **Perplexity Logic** (`lib/perplexity-logic.ts`) - LLM reasoning
- **Orgo Integration** (`lib/orgo.ts`) - Cloud backend connection

## Security Guidelines

### Environment Variables
- **Always use `.env.local`** for local development
- **Never commit** `.env` files with real values
- **Verify `.env` in `.gitignore`**
- **Rotate credentials** if accidentally exposed
- **Use `.env.example`** as template only

### API Keys & Tokens
- Store all API keys in environment variables
- Use strong, unique tokens per service
- Verify no hardcoded keys in source code
- Review `sanitized-skills.json` for any exposed endpoints
- Use pre-commit hooks to catch secret commits

### Code Security
- No hardcoded API keys or passwords
- No internal IP addresses in external calls
- All external APIs use HTTPS
- Implement proper error handling (no credential exposure in errors)
- Log API calls without including sensitive data

## Image Optimization

All portfolio images should be optimized:

**Target Specifications:**
- Maximum file size: 500 KB per image
- Format: JPEG or WebP
- Responsive dimensions
- Lazy-loaded where applicable

**Current Status:**
- work-item-4.jpg: 2.66 MB (exceeds target)
- work-item-5.jpg: 2.72 MB (exceeds target)

See `CLEANUP_PLAN.md` for optimization roadmap.

## Testing

### Mobile Responsiveness
- Test all pages on devices ≤ 480px width
- Verify both EN and ES variants
- Check touch interactions

### Localization Testing
- Switch between EN/ES
- Verify all text renders correctly
- Check for text overflow issues
- Test special characters and accents

### Performance
- Page load time target: < 3 seconds
- Lighthouse score target: > 90
- No 404 errors for images/assets

## Git Workflow

### Development Branch
- **Current Feature Branch**: `claude/review-changes-mma092p8jzyjwkor-cHlb7`
- **Merge Target**: `main`

### Commit Guidelines
- Use clear, descriptive commit messages
- One logical change per commit
- Reference related issues/PRs
- Follow conventional commits:
  - `feat: add new feature`
  - `fix: correct a bug`
  - `docs: documentation changes`
  - `style: formatting, missing semicolons`
  - `refactor: code restructuring`
  - `perf: performance improvements`

### Push/Pull Strategy
```bash
# Fetch specific branch
git fetch origin <branch-name>

# Create local branch tracking remote
git checkout -b <branch-name> origin/<branch-name>

# Push with tracking
git push -u origin <branch-name>

# Pull latest
git pull origin <branch-name>
```

## Troubleshooting

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Remove lock file and reinstall
rm package-lock.json
npm install
```

### Build Failures
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear build artifacts
rm -rf dist/

# Rebuild
npm run build:web
```

### Port Already in Use
```bash
# Change default port (Vite/Next.js specific)
npm run dev:web -- --port 3001
```

## Additional Resources

- **Cleanup Plan**: `CLEANUP_PLAN.md` - Technical debt and fixes
- **Agent Documentation**: `agents.md` - Synthia systems and LLM integrations
- **Skills Training**: `skills.md` - Reusable patterns and automation
- **Core Architecture**: `synthia_core.md` - System design documentation

## Support & Issues

If you encounter issues:
1. Check this setup guide
2. Review relevant documentation file
3. Check `.env.example` for required variables
4. Verify Node.js and npm versions
5. Clear cache and reinstall if needed

## Last Updated

2026-03-03 - Initial project setup documentation

---

**Note**: This is a monorepo using npm workspaces. Each app can be independently developed but shares root configuration. Always run commands from the root directory unless otherwise specified.
