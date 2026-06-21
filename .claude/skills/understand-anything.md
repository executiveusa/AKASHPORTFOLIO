# Skill: Understand-Anything — Interactive Knowledge Graph

> **Source**: https://github.com/Lum1104/Understand-Anything (now Egonex-AI/Understand-Anything)
> **Philosophy**: "Graphs that teach > graphs that impress. Turn any code into an interactive knowledge graph you can explore, search, and ask questions about."

## What It Does
Generates an interactive knowledge graph from a codebase that maps:
- File-to-file relationships
- Function call graphs
- Data flow between components
- API endpoint → handler → DB mappings
- Component → state → side-effect chains

## Application to This Project

### Map 1: Full Ecosystem Overview
```
KUPURI Media Ecosystem
├── apps/web (Kupuri Landing Page)
│   ├── index.html → CSS → JS modules
│   ├── contact.html → (form POST to?)
│   └── footer → [links to other apps]
│
├── apps/control-room (Synthia Platform)
│   ├── src/app/ → Next.js routes
│   ├── src/agents/ → AI agent logic
│   ├── src/components/ → Sphere UI, Synthia avatar
│   └── src/lib/ → Supabase, API clients
│
└── cult-directory-template (Directorio Kupuri)
    ├── app/ → Next.js routes
    ├── components/ → Directory UI
    ├── db/ → Supabase schema
    └── supabase/ → Migrations
```

### Map 2: Synthia Data Flow
```
User → Synthia UI → Control Room API → Supabase
                  → AI Agents (OpenRouter/Litellm)
                  → WebSocket updates → Sphere visualization
```

### Map 3: Agent Ecosystem (what actually exists)
```
agents/
├── La Vigilante (observability)
├── Mercury2 (?)
├── STK agent (spend tracking)
├── FLW agent (per-agent cost)
└── DOC agent (Supabase ops)
```

## Usage in Code Reviews
Before touching any file in `apps/control-room/src/agents/`, run:
```
"Use the Understand-Anything skill to map which agents are actually invoked 
 vs. which are just documented in .md files"
```

Before refactoring `apps/web`:
```
"Use the Understand-Anything skill to verify the landing page has 
 no runtime dependencies on the control-room"
```

## Quick Dependency Check Commands
```bash
# Check if apps/web imports anything from control-room
grep -r "control-room\|localhost:3000" apps/web --include="*.js" --include="*.html"

# Check if any .md files reference actual code files that no longer exist
grep -ohE "src/[a-zA-Z/]+\.(ts|tsx|js)" *.md | xargs -I{} test -f {} || echo "BROKEN REFERENCE"

# Map all API calls in control-room
grep -rn "fetch\|axios\|api\." apps/control-room/src --include="*.ts" --include="*.tsx"
```
