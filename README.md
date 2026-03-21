# Kupuri Media - Full-Stack AI Platform

A complete monorepo containing the **Kupuri Media** brand portfolio website and **Synthia 3.0** — the autonomous backend for Latin American women's empowerment initiatives.

## 🏗️ Architecture

This is a **strict monorepo** with clear separation:

```
AKASHPORTFOLIO/
├── apps/                      # Frontend Applications (Vercel-deployed)
│   ├── web/                   # Main portfolio site (Vite)
│   │   ├── src/              # HTML, CSS, JS
│   │   ├── dist/             # Built output (deployed to Vercel)
│   │   ├── package.json
│   │   └── vercel.json       # Vercel configuration
│   │
│   └── control-room/          # Dashboard application
│       ├── src/
│       ├── dist/
│       └── package.json
│
│   └── onboarding-flipbook/   # 3D Interactive Onboarding (Rust/WASM)
│       ├── src/              # Bevy 3D source code
│       ├── e2e/              # Playwright E2E tests
│       ├── Cargo.toml
│       └── index.html        # Immersive UI wrapper
│
├── backend/                   # Synthia 3.0 Backend (Hostinger VPS)
│   ├── src/                   # Rust source
│   ├── Cargo.toml            # Rust dependencies
│   ├── Dockerfile            # Container build
│   ├── docker-compose.yml    # Local development
│   ├── deploy-hostinger.sh   # VPS deployment
│   ├── .env.example          # Configuration template
│   └── README.md             # Backend documentation
│
├── agent-zero/                # Agent Zero (Pre-stubbed, ready for integration)
│
└── synthia_core.md           # Synthia 3.0 architecture & system prompt
```

## 🚀 Quick Start

### Frontend (Portfolio on Vercel)

```bash
# Install dependencies
npm install

# Development
npm run dev:web

# Build for Vercel
npm run build:web

# The portfolio is automatically deployed on every push to main
```

**Live Frontend**: https://akashportfolio.vercel.app

### Backend (Synthia 3.0 on Hostinger)

```bash
cd backend

# Local development
cp .env.example .env
cargo run

# Or with Docker
docker-compose up --build

# Deploy to Hostinger
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh

# Test the API
curl http://localhost:42617/health
```

**Live Backend**: `http://<your-vps-ip>:42617` (Hostinger)

## 📋 What's Included

### Frontend (apps/)

- **Vite-powered portfolio** with smooth animations
- **Sphere OS™ Control Room** Next.js 15 dashboard
- **3D Interactive Onboarding Flipbook** (Rust/Bevy WebAssembly Sidecar)
  - Gaming-style immersive UX with vibrant colors (No pixel trash)
  - Inline video explainers & full 3D plane mechanics
- Responsive design for all devices
- Integrated with Anthropic Claude SDK
- GSAP animations and Lenis scroll effects

### Backend (backend/)

- **Rust Axum HTTP server** (~8 MB binary)
- **LLM Provider Switching**: Liquid LEAP Elite, Gemma-2-2B, Gemma-2-9B
- **Memory System**: mem0 integration for persistent context
- **Web Scraping**: Firecrawl for research automation
- **Tool Orchestration**: Composio MCP (850+ tools)
- **Task Delegation**: Agent Zero integration for complex tasks
- **Hostinger VPS Ready**: One-command deployment with systemd auto-restart

### Features

| Feature | Status | Location |
|---------|--------|----------|
| Portfolio Website | ✅ Live | https://akashportfolio.vercel.app |
| 3D Onboarding Sidecar | ✅ Ready | apps/onboarding-flipbook/ |
| Synthia Backend API | ✅ Ready | backend/ |
| mem0 Memory Integration | ✅ Configured | backend/src/providers/mem0.rs |
| Hostinger Deployment | ✅ Automated | backend/deploy-hostinger.sh |
| Agent Zero Stub | ✅ Ready | backend/src/providers/agent_zero.rs |
| Composio Tools (850+) | ✅ Integrated | backend/src/providers/composio.rs |
| Firecrawl Web Scraping | ✅ Integrated | backend/src/providers/firecrawl.rs |
| Spanish-First Prompts | ✅ Configured | backend/.env.example |

## 📦 Environment Setup

### Root Directory

```bash
# Install all workspace dependencies
npm install

# Environment for backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### Required API Keys

For the backend to function fully, set these in `backend/.env`:

```env
# LLM Providers
LIQUID_API_KEY=your_liquid_key
GEMMA_2B_MODEL_PATH=./workspace/models/gemma-2-2b-it-Q5_K_M.gguf
GEMMA_9B_MODEL_PATH=./workspace/models/gemma-2-9b-it-Q4_K_M.gguf

# Memory System
MEM0_API_KEY=m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg

# Web Tools
FIRECRAWL_API_KEY=fc-xxx
COMPOSIO_API_KEY=comp-xxx
RETRIEVER_API_KEY=rtrvr-xxx
ORCA_API_KEY=orca-xxx

# Hostinger Deployment
HOSTINGER_API_TOKEN=your_token
HOSTINGER_SSH_HOST=your.vps.ip
HOSTINGER_SSH_USER=root
```

## 🌐 Deployment

### Frontend → Vercel

The portfolio website automatically deploys when you push to the `main` branch:

```bash
# Push to main (triggers Vercel build)
git push origin main
```

**Vercel Configuration**: `apps/web/vercel.json`

Vercel will:
1. Detect the build command: `npm run build`
2. Set output directory: `dist/`
3. Rewrite routes: `/home`, `/contact` → `index.html`
4. Automatically build and deploy

View your deployment: https://akashportfolio.vercel.app

### Backend → Hostinger

One-command deployment:

```bash
cd backend

# Set environment variables
export HOSTINGER_API_TOKEN="your_api_token"
export HOSTINGER_VPS_ID="your_vps_id"
export HOSTINGER_SSH_HOST="your.vps.ip"

# Deploy
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

The deployment script will:
- ✅ Build optimized Rust release binary
- ✅ Upload to your VPS
- ✅ Create systemd service
- ✅ Enable auto-restart on failure
- ✅ Verify health
- ✅ Set up logging

## 🧪 Testing

### Test Frontend Build

```bash
npm run build:web
# Check apps/web/dist/ for static files
```

### Test Backend API

```bash
cd backend
cargo run

# In another terminal
curl http://localhost:42617/health
curl -X POST http://localhost:42617/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola"}]}'
```

### Run Python Integration Tests

```bash
python test_synthia_api.py
python test_synthia_api_urllib.py
```

## 📚 Documentation

- **Frontend**: See individual READMEs in `apps/`
- **Backend**: See `backend/README.md` for detailed API docs
- **System Prompt**: See `synthia_core.md` for Synthia's core instructions
- **Architecture**: See `backend/README.md` for Rust implementation details

## 🔐 Security & Best Practices

### DO NOT

- ❌ Commit `.env` files (use `.env.example`)
- ❌ Expose API keys in code
- ❌ Modify `apps/` folder structure without approval
- ❌ Disable security features for convenience

### DO

- ✅ Use environment variables for all secrets
- ✅ Keep backend and frontend separate
- ✅ Test locally before pushing
- ✅ Use HTTPS on production (configure Nginx)
- ✅ Monitor logs regularly

## 🤖 Backend Provider Switching

Synthia supports instant provider switching:

```bash
# Switch to Gemma 2B
curl -X POST http://localhost:42617/switch_llm \
  -H "Content-Type: application/json" \
  -d '{"provider":"gemma2b"}'

# Switch back to Liquid
curl -X POST http://localhost:42617/switch_llm \
  -d '{"provider":"liquid"}'
```

## 🧠 Memory System (mem0)

Synthia learns and remembers:

```bash
# Add a memory
curl -X POST http://localhost:42617/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"synthia",
    "content":"Kupuri Media empowers women entrepreneurs in LatAm",
    "metadata":{"region":"LatAm","focus":"women"}
  }'

# Search memories
curl -X POST http://localhost:42617/memory/search \
  -H "Content-Type: application/json" \
  -d '{"user_id":"synthia","query":"women entrepreneurs"}'
```

## 🎯 Kupuri Media Integration

Synthia is pre-configured for Kupuri Media operations:

- **Spanish-first system prompts** (neutral Latin American Spanish)
- **Women's empowerment research** workflows
- **Blog content generation** with Gemma/Liquid
- **Directory management** via Composio tools
- **Autonomous heartbeat scheduler** for background tasks

Example:

```bash
curl -X POST http://localhost:42617/kupuri/research \
  -H "Content-Type: application/json" \
  -d '{
    "topic":"women entrepreneurs",
    "language":"es"
  }'
```

## 🔗 API Endpoints Reference

### Core
- `GET /health` - Health check
- `GET /status` - Service status

### LLM
- `POST /switch_llm` - Switch provider
- `POST /chat` - Send message

### Memory
- `POST /memory/add` - Store memory
- `POST /memory/retrieve` - Get memories
- `POST /memory/search` - Search memories

### Tools
- `GET /composio/tools` - List 850+ tools
- `POST /composio/execute` - Execute tool
- `POST /firecrawl/scrape` - Scrape URL

### Kupuri
- `POST /kupuri/research` - Research women's topics

### Tasks
- `POST /task/delegate` - Delegate to Agent Zero
- `GET /task/status/:id` - Check status

See `backend/src/api/routes.rs` for full implementation.

## 📊 Tech Stack

### Frontend
- **Framework**: Vite + Vanilla JS
- **Hosting**: Vercel
- **Libraries**: GSAP, Lenis, Anthropic SDK

### Backend
- **Language**: Rust
- **Framework**: Axum (async HTTP)
- **Runtime**: Tokio
- **Hosting**: Hostinger VPS
- **Memory**: mem0.ai integration
- **Tools**: Composio MCP, Firecrawl, Agent Zero

## 🚦 Status

| Component | Status | Link |
|-----------|--------|------|
| Frontend Portfolio | ✅ Live | https://akashportfolio.vercel.app |
| Backend API | ✅ Ready | backend/ |
| Hostinger Setup | ✅ Automated | deploy-hostinger.sh |
| mem0 Integration | ✅ Configured | backend/src/providers/mem0.rs |
| Agent Zero Stub | ✅ Ready | backend/src/providers/agent_zero.rs |
| Documentation | ✅ Complete | README.md + backend/README.md |

## 🆘 Troubleshooting

### Frontend not building on Vercel

1. Check `apps/web/package.json` exists
2. Verify `vercel.json` configuration
3. Check build command: `npm run build`

### Backend won't start

```bash
cd backend
cargo clean
cargo build
cargo run
```

### Hostinger deployment fails

```bash
# Check prerequisites
ssh root@your.vps.ip "echo 'Connected'"

# Verify credentials
echo $HOSTINGER_API_TOKEN
echo $HOSTINGER_VPS_ID
```

## 📝 Git Workflow

```bash
# Create feature branch (off main)
git checkout main
git pull origin main
git checkout -b feature/your-feature

# For backend development
git checkout claude/deploy-vercel-backend-update-H6MlJ

# Commit and push
git add .
git commit -m "feat: Your feature description"
git push origin feature/your-feature  # or claude/deploy-vercel-backend-update-H6MlJ
```

## 📄 License

MIT - Kupuri Media 2026

---

**Synthia 3.0** — The autonomous backend powering Kupuri Media's mission to empower women entrepreneurs across Latin America. 🦋

Built with ❤️ by Kupuri Media | March 2026
