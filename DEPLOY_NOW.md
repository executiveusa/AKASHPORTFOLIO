# 🚀 DEPLOY SYNTHIA 3.0 NOW

## Quick Start (5 minutes)

### On VPS (31.220.58.212)

```bash
# 1. SSH into VPS
ssh root@31.220.58.212

# 2. Apply Supabase Schema
PGPASSWORD="072090156d28a9df6502d94083e47990" psql \
  -h 31.220.58.212 \
  -p 5434 \
  -U postgres \
  -d second_brain << 'EOF'

-- Copy full contents from:
-- https://raw.githubusercontent.com/executiveusa/AKASHPORTFOLIO/main/apps/control-room/src/lib/supabase-schema.sql

EOF

# 3. Clone/update repo
cd /opt/synthia
git clone https://github.com/executiveusa/AKASHPORTFOLIO.git control-room
cd control-room/apps/control-room

# 4. Build Docker image
docker build -t synthia-control-room:latest .

# 5. Start container
docker run -d \
  --name synthia-control-room \
  --restart always \
  -p 3001:3000 \
  --env-file .env.local \
  synthia-control-room:latest

# 6. Verify
docker logs synthia-control-room
curl http://localhost:3001/api/health

# 7. Check Supabase
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain -c "SELECT * FROM agent_state;"
```

## One-Liner Deployment

```bash
ssh root@31.220.58.212 << 'SCRIPT'
cd /opt/synthia/control-room/apps/control-room && \
docker build -t synthia-control-room:latest . && \
docker run -d --name synthia-control-room --restart always -p 3001:3000 --env-file .env.local synthia-control-room:latest && \
sleep 3 && \
curl http://localhost:3001/api/health
SCRIPT
```

## Status Check

```bash
# Container status
docker ps | grep synthia

# View logs
docker logs -f synthia-control-room

# Health check
curl http://31.220.58.212:3001/api/health | jq .

# Test Synthia API
curl -X POST http://31.220.58.212:3001/api/synthia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Synthia","agentId":"synthia-0"}'

# Check Supabase connection
curl http://31.220.58.212:3001/api/dashboard | jq .
```

## Rollback

```bash
docker stop synthia-control-room
docker rm synthia-control-room
docker rmi synthia-control-room:latest
```

## Monitoring

```bash
# Real-time logs
docker logs -f synthia-control-room --tail 100

# Check agent state
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain -c \
  "SELECT * FROM agent_state ORDER BY last_seen DESC;"

# Check observations (telemetry)
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain -c \
  "SELECT * FROM observations ORDER BY created_at DESC LIMIT 20;"

# Monitor memory usage
watch -n 5 'docker stats --no-stream synthia-control-room'
```

---

**Expected Result:**
- ✅ Container running on port 3001
- ✅ GET /api/health returns `{"status": "healthy"}`
- ✅ POST /api/synthia responds with Claude output
- ✅ Agent state persisted in Supabase
- ✅ Telemetry logged to observations table

**Estimated Time:** 10-15 minutes (schema + build + startup + verification)
