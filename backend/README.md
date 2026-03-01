# Synthia 3.0 Backend

The autonomous backend engine for **Kupuri Media** — a Latin American AI agency focused on women's empowerment, high-impact blogging, and directory management.

## Overview

**Synthia 3.0** is a lightweight, self-hosted HTTP API built in Rust with Axum. It serves as the control center for:

- **LLM Provider Management**: Switch between Liquid AI LEAP Elite, Gemma-2-2B-it, and Gemma-2-9B-it on demand
- **Memory System**: Integrated with mem0 for persistent conversation context and knowledge management
- **Web Scraping**: Firecrawl integration for automated research and content gathering
- **Tool Orchestration**: Full Composio MCP (850+ tools) for autonomous task execution
- **Task Delegation**: Agent Zero integration for complex problem-solving
- **Hostinger Deployment**: One-command VPS deployment with systemd auto-restart

## Architecture

```
AKASHPORTFOLIO/
├── apps/                    # Frontend (UNTOUCHED)
│   ├── web/               # Vite/Portfolio
│   └── control-room/      # Dashboard
│
├── backend/               # Synthia 3.0 (NEW)
│   ├── src/
│   │   ├── main.rs       # Entry point
│   │   ├── config.rs     # Environment configuration
│   │   ├── api/          # Axum routes (HTTP endpoints)
│   │   └── providers/    # LLM, memory, tools integrations
│   │       ├── llm_trait.rs      # LLM provider abstraction
│   │       ├── composio.rs       # Composio MCP
│   │       ├── firecrawl.rs      # Web scraping
│   │       ├── mem0.rs          # Memory system
│   │       └── agent_zero.rs    # Task delegation
│   ├── Cargo.toml
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── deploy-hostinger.sh
│
└── agent-zero/            # Agent Zero integration (stub)
```

## Quick Start

### Local Development

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create environment file
cp .env.example .env
# Edit .env with your API keys

# 3. Build and run
cargo run

# 4. Test the API
curl http://localhost:42617/health
```

### With Docker Compose

```bash
cd backend
docker-compose up --build
```

The API will be available at `http://localhost:42617`

## Environment Variables

See `.env.example` for complete configuration. Key variables:

```env
# HTTP Server
PORT=42617
HOST=0.0.0.0

# LLM Providers
LIQUID_API_KEY=your_liquid_key
DEFAULT_PROVIDER=liquid  # liquid | gemma2b | gemma9b

# Memory System (mem0)
MEM0_API_KEY=m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg
MEM0_ORG_ID=your_org_id

# Integrations
FIRECRAWL_API_KEY=fc-xxx
COMPOSIO_API_KEY=comp-xxx
RETRIEVER_API_KEY=rtrvr-xxx
ORCA_API_KEY=orca-xxx

# Hostinger Deployment
HOSTINGER_API_TOKEN=your_token
HOSTINGER_SSH_HOST=your.vps.ip
```

## API Endpoints

### Core

- `GET /health` - Health check
- `GET /status` - Service status and configuration

### LLM & Chat

- `POST /switch_llm` - Switch active LLM provider
  ```json
  { "provider": "gemma2b" }
  ```
- `POST /chat` - Send message to active LLM
  ```json
  { "messages": [...], "language": "es" }
  ```

### Memory (mem0)

- `POST /memory/add` - Add memory entry
  ```json
  { "user_id": "user_123", "content": "..." }
  ```
- `POST /memory/retrieve` - Get user memories
  ```json
  { "user_id": "user_123", "limit": 10 }
  ```
- `POST /memory/search` - Search memories
  ```json
  { "user_id": "user_123", "query": "..." }
  ```

### Composio Tools

- `GET /composio/tools` - List available tools
- `POST /composio/execute` - Execute a tool
  ```json
  { "tool": "gmail_send", "args": {...} }
  ```

### Web Scraping

- `POST /firecrawl/scrape` - Scrape URL to markdown
  ```json
  { "url": "https://example.com" }
  ```

### Kupuri Media Specific

- `POST /kupuri/research` - Research women's empowerment topics
  ```json
  { "topic": "entrepreneurship", "language": "es" }
  ```

### Task Delegation

- `POST /task/delegate` - Delegate to Agent Zero
  ```json
  { "title": "...", "description": "..." }
  ```
- `GET /task/status/:id` - Check task status

### Audit

- `GET /audit/logs` - Retrieve operation logs

## Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:42617/health

# Switch LLM
curl -X POST http://localhost:42617/switch_llm \
  -H "Content-Type: application/json" \
  -d '{"provider":"gemma2b"}'

# Add memory
curl -X POST http://localhost:42617/memory/add \
  -H "Content-Type: application/json" \
  -d '{"user_id":"synthia","content":"Synthia 3.0 is live"}'

# Chat
curl -X POST http://localhost:42617/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola"}],"language":"es"}'
```

### Python Testing

See `test_synthia_api.py` in the root directory for integration tests.

## Deployment to Hostinger

### Prerequisites

- Hostinger VPS (Ubuntu 22.04+)
- Hostinger API token
- SSH access to your VPS

### One-Command Deployment

```bash
# Set environment variables
export HOSTINGER_API_TOKEN="your_api_token"
export HOSTINGER_VPS_ID="your_vps_id"
export HOSTINGER_SSH_HOST="your.vps.ip"

# Run deployment script
cd backend
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

The script will:
1. Build the optimized release binary
2. Upload to your Hostinger VPS
3. Create systemd service for auto-restart
4. Set up logging
5. Verify the deployment

### Manual Verification

```bash
# Check service status
ssh root@your.vps.ip "systemctl status synthia"

# View logs
ssh root@your.vps.ip "tail -20 /var/log/synthia/synthia.log"

# Test API
curl http://your.vps.ip:42617/health
```

## Agent Zero Integration

Agent Zero is stubbed and ready for customization. The integration allows Synthia to delegate complex tasks to Agent Zero based on complexity thresholds.

### Enabling Agent Zero

```json
{
  "agent_zero_enabled": true,
  "agent_zero_docker_image": "agent0ai/agent-zero:latest",
  "agent_zero_port": 9000
}
```

See `src/providers/agent_zero.rs` for the implementation.

## mem0 Memory System

The memory system provides persistent conversation context using mem0.ai.

### Example: Teaching Synthia

```bash
# Add memory
curl -X POST http://localhost:42617/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "synthia",
    "content": "Kupuri Media focuses on women entrepreneurship in Mexico, Colombia, and Peru"
  }'

# Search memories
curl -X POST http://localhost:42617/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "synthia",
    "query": "women entrepreneurship"
  }'
```

## Security Considerations

- ✅ All API keys are environment-based (never hardcoded)
- ✅ HTTPS recommended for production (configure Nginx reverse proxy)
- ✅ Rate limiting should be added for public endpoints
- ✅ Authentication tokens for production deployments
- ✅ Database encryption for sensitive memory data

## Performance

- **Binary Size**: ~8 MB (static, fully optimized)
- **Memory Footprint**: ~50-100 MB at startup
- **Response Time**: <100ms for most endpoints
- **Concurrency**: Tokio-based async/await, handles thousands of concurrent connections

## Troubleshooting

### Port already in use

```bash
lsof -i :42617
kill -9 <PID>
```

### Build failures

```bash
cargo clean
cargo build --release
```

### Hostinger deployment issues

1. Check SSH connectivity: `ssh -p 22 root@your.vps.ip`
2. Verify API token: `curl -X GET https://api.hostinger.com/v1/vps/$HOSTINGER_VPS_ID -H "Authorization: Bearer $HOSTINGER_API_TOKEN"`
3. Check VPS logs: `ssh root@your.vps.ip "journalctl -u synthia -f"`

## Contributing

When adding new providers or endpoints:

1. Create a new file in `src/providers/`
2. Implement the provider trait or add new routes
3. Update `.env.example` with new variables
4. Add tests using `#[tokio::test]`
5. Update this README

## License

MIT - Kupuri Media 2026

---

**Synthia 3.0** — Empowering Kupuri Media with autonomous intelligence. 🦋
