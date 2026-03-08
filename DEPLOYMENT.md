# Synthia 3.0 Deployment Guide

**Status:** ZTE-20260307-0001 - STAGE 2/7 (IMPLEMENT)

## Infrastructure

### Supabase (Open Brain)
- **VPS IP:** 31.220.58.212
- **Supabase API:** http://31.220.58.212:8001
- **PostgreSQL:** postgresql://postgres:072090156d28a9df6502d94083e47990@31.220.58.212:5434/second_brain
- **Status:** Verified March 6, 2026 ✅

### Coolify Deployment
- **Panel:** http://31.220.58.212:8000
- **Status:** Running ✅
- **Services:** Docker Compose based

## Pre-Deployment Checklist

### 1. Apply Supabase Schema
```bash
# SSH into VPS
ssh root@31.220.58.212

# Connect to Supabase DB
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain

# Run schema (copy from src/lib/supabase-schema.sql)
\i supabase-schema.sql

# Verify tables
\dt
```

### 2. Environment Variables (Already Set)
```
.env.local contains:
✅ ANTHROPIC_API_KEY
✅ SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY
✅ DATABASE_URL
✅ VERCEL_TOKEN
✅ COOLIFY_API_TOKEN
✅ GITHUB_TOKEN
```

### 3. Install Dependencies
```bash
cd apps/control-room
npm install
```

### 4. Build Control Room
```bash
npm run build
```

### 5. Test Locally
```bash
npm run dev
# Test POST /api/synthia with body: {"message": "Hello Synthia"}
```

## Deployment Steps

### Option A: Deploy to Coolify (Recommended)
```bash
# From root directory
cd apps/control-room

# Build Docker image
docker build -t synthia-control-room .

# Tag for registry
docker tag synthia-control-room 31.220.58.212:5000/synthia-control-room:latest

# Push to local registry (Coolify)
docker push 31.220.58.212:5000/synthia-control-room:latest

# Deploy via Coolify API
curl -X POST http://31.220.58.212:8000/api/v1/deploy \
  -H "Authorization: Bearer 1439|JNBGNRm9lON2g8DpkpKIa5TnRdGc8LaILhTgPTuR8d6b1c26" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "31.220.58.212:5000/synthia-control-room:latest",
    "service": "synthia-control-room",
    "port": 3001
  }'
```

### Option B: Deploy to Vercel
```bash
# Ensure .env.local values are in Vercel project settings
vercel env pull

# Deploy
vercel deploy --prod
```

## Post-Deployment Verification

### 1. Health Check
```bash
curl http://31.220.58.212:3001/healthz
# Expected: 200 OK
```

### 2. Test Synthia Route
```bash
curl -X POST http://31.220.58.212:3001/api/synthia \
  -H "Content-Type: application/json" \
  -d '{"message": "Generate a marketing video about AI.", "agentId": "synthia-0"}'
```

### 3. Check Agent State
```bash
curl http://31.220.58.212:3001/api/dashboard
# Should return agent status, recent events, memory stats
```

### 4. Monitor Logs
```bash
# SSH into VPS
ssh root@31.220.58.212

# View container logs
docker compose -f /opt/supabase/docker-compose.yml logs -f control-room
```

## Remotion Integration (Next Phase)

When Remotion API key is available:
1. Update `.env.local`: `REMOTION_API_KEY=<your-key>`
2. Update `src/lib/remotion-skill.ts` to call actual API
3. Replace stubs with production endpoints
4. E2E test: Video generation task
5. Deploy update to Coolify

## Troubleshooting

### Issue: Supabase Connection Timeout
```bash
# Test connection
psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain -c "SELECT 1"

# If timeout, check firewall on VPS
sudo ufw status
sudo ufw allow 5434
```

### Issue: Claude API Error
```
Check:
1. ANTHROPIC_API_KEY in .env.local is valid
2. Cost guard not exceeded (max $10/task)
3. Model name is 'claude-opus-4-6'
```

### Issue: Remotion Render Failed
- Check `observat​ions` table for error logs
- Verify Remotion API key is configured
- Check job ID in `telemetry.logEvent`

## Rollback Plan

If deployment fails:
1. Revert to previous Docker image: `docker run -d synthia-control-room:previous`
2. Or redeploy from git: `git revert HEAD && npm run build && npm start`
3. Database changes are reversible (migrations kept in version control)

## Cost Monitoring

Track API costs:
- Claude: ~$0.01-0.05 per task (Opus 4.6)
- Supabase: Included in VPS instance
- Vercel: Included in pro plan
- Coolify: Self-hosted (no additional cost)

**Monthly budget estimate:** $200-500
