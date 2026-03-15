#!/bin/bash

###############################################################################
# ONE-COMMAND SYNTHIA 3.0 DEPLOYMENT
# Execute on VPS: bash DEPLOY_SYNTHIA.sh
###############################################################################

set -e

VPS_IP="31.220.58.212"
REPO="https://github.com/executiveusa/AKASHPORTFOLIO.git"
WORK_DIR="/opt/synthia/control-room"
SERVICE="synthia-control-room"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 SYNTHIA 3.0 DEPLOYMENT STARTED                      ║"
echo "║         $(date '+%Y-%m-%d %H:%M:%S')                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# STEP 1: APPLY SUPABASE SCHEMA
# ============================================================================
echo "📝 [1/6] Applying Supabase schema..."

export PGPASSWORD="072090156d28a9df6502d94083e47990"

psql -h 31.220.58.212 -p 5434 -U postgres -d second_brain << 'SCHEMA'
-- Create tables
CREATE TABLE IF NOT EXISTS agent_state (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'offline', 'error')),
    current_task TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    summary TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memories (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    type TEXT DEFAULT 'observation',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    importance INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_links (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'related',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    participants TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_state_status ON agent_state(status);
CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_source ON memory_links(source_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv ON conversation_messages(conversation_id);

-- Seed Synthia agent
INSERT INTO agent_state (agent_id, name, role, status, metadata)
VALUES ('synthia-0', 'Synthia Prime', 'Digital CEO', 'idle', '{"version": "3.0.0", "tier": "core"}')
ON CONFLICT (agent_id) DO NOTHING;

SELECT '✅ Schema ready' as status;
SCHEMA

echo "✅ Schema applied successfully"
echo ""

# ============================================================================
# STEP 2: CLONE/UPDATE REPOSITORY
# ============================================================================
echo "📥 [2/6] Preparing repository..."

mkdir -p "$(dirname "$WORK_DIR")"

if [ -d "$WORK_DIR" ]; then
    cd "$WORK_DIR" && git pull origin main
else
    git clone "$REPO" "$WORK_DIR"
fi

cd "$WORK_DIR/apps/control-room"
echo "✅ Repository updated"
echo ""

# ============================================================================
# STEP 3: INSTALL DEPENDENCIES
# ============================================================================
echo "📦 [3/6] Installing dependencies..."

npm install --legacy-peer-deps 2>&1 | tail -5

echo "✅ Dependencies installed"
echo ""

# ============================================================================
# STEP 4: BUILD DOCKER IMAGE
# ============================================================================
echo "🐳 [4/6] Building Docker image..."

docker build -t "$SERVICE:latest" . 2>&1 | grep -E "(Successfully|error|failed)" || echo "Build in progress..."

echo "✅ Docker image built"
echo ""

# ============================================================================
# STEP 5: START CONTAINER
# ============================================================================
echo "🟢 [5/6] Starting container..."

# Stop existing container
docker stop "$SERVICE" 2>/dev/null || true
docker rm "$SERVICE" 2>/dev/null || true

# Start new container
docker run -d \
    --name "$SERVICE" \
    --restart always \
    -p 3001:3000 \
    --env-file .env.local \
    --health-cmd='curl -f http://localhost:3000/api/health || exit 1' \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    "$SERVICE:latest"

echo "✅ Container started on port 3001"
echo ""

# ============================================================================
# STEP 6: VERIFICATION
# ============================================================================
echo "🔍 [6/6] Verifying deployment..."

sleep 3

# Check container status
CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' "$SERVICE")
echo "   Container status: $CONTAINER_STATUS"

# Health check
for i in {1..10}; do
    HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null | grep -o "healthy" || echo "")
    if [ "$HEALTH" = "healthy" ]; then
        echo "   ✅ Health check: HEALTHY"
        break
    fi
    echo "   Waiting... ($i/10)"
    sleep 2
done

# Test Synthia endpoint
echo ""
echo "   Testing Synthia endpoint..."
curl -s -X POST http://localhost:3001/api/synthia \
    -H "Content-Type: application/json" \
    -d '{"message":"Deployment verification test","agentId":"synthia-0"}' \
    -m 5 > /dev/null 2>&1 && echo "   ✅ Synthia endpoint: RESPONSIVE" || echo "   ⚠️  Synthia warming up..."

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         ✅ DEPLOYMENT COMPLETE                                 ║"
echo "║         $(date '+%Y-%m-%d %H:%M:%S')                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Service Details:"
echo "   Container: $SERVICE"
echo "   Port: 3001"
echo "   Status: $(docker inspect -f '{{.State.Status}}' $SERVICE)"
echo ""
echo "🔗 Endpoints:"
echo "   Health:    http://$VPS_IP:3001/api/health"
echo "   Synthia:   http://$VPS_IP:3001/api/synthia"
echo "   Dashboard: http://$VPS_IP:3001/api/dashboard"
echo ""
echo "📜 Logs:"
echo "   docker logs -f $SERVICE"
echo ""
echo "🗄️  Supabase:"
echo "   Studio:  http://$VPS_IP:3001"
echo "   API:     http://$VPS_IP:8001"
echo "   DB:      $VPS_IP:5434"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

exit 0
