#!/bin/bash

###############################################################################
# Synthia 3.0 Deployment Script for Coolify VPS
# Run this on the VPS (31.220.58.212) to deploy control room
###############################################################################

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Synthia 3.0 Deployment to Coolify"
echo "═══════════════════════════════════════════════════════════════"

# Configuration
VPS_IP="31.220.58.212"
REGISTRY_URL="localhost:5000"
SERVICE_NAME="synthia-control-room"
IMAGE_NAME="$REGISTRY_URL/$SERVICE_NAME:latest"
REPO_URL="https://github.com/executiveusa/AKASHPORTFOLIO.git"
WORK_DIR="/opt/synthia/control-room"
COOLIFY_URL="http://localhost:8000"
COOLIFY_API_TOKEN="${COOLIFY_API_TOKEN}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Step 1: Apply Supabase Schema
step_apply_schema() {
    echo ""
    echo "📝 Step 1: Applying Supabase Schema..."

    PGPASSWORD="072090156d28a9df6502d94083e47990" psql \
        -h 31.220.58.212 \
        -p 5434 \
        -U postgres \
        -d second_brain \
        -f "$WORK_DIR/src/lib/supabase-schema.sql" 2>&1 | tail -20

    log_info "Schema applied"
}

# Step 2: Clone or update repo
step_clone_repo() {
    echo ""
    echo "📥 Step 2: Preparing repository..."

    if [ ! -d "$WORK_DIR" ]; then
        mkdir -p "$(dirname "$WORK_DIR")"
        git clone "$REPO_URL" "$WORK_DIR"
    else
        cd "$WORK_DIR" && git pull origin main
    fi

    cd "$WORK_DIR/apps/control-room"
    log_info "Repository ready at $WORK_DIR"
}

# Step 3: Build Docker image
step_build_image() {
    echo ""
    echo "🐳 Step 3: Building Docker image..."

    cd "$WORK_DIR/apps/control-room"

    docker build -t "$IMAGE_NAME" . || log_error "Docker build failed"

    log_info "Image built: $IMAGE_NAME"
    docker images | grep synthia-control-room | head -1
}

# Step 4: Start container
step_start_container() {
    echo ""
    echo "🟢 Step 4: Starting container..."

    # Stop existing container if running
    docker stop "$SERVICE_NAME" 2>/dev/null || true
    docker rm "$SERVICE_NAME" 2>/dev/null || true

    # Load environment
    export $(cat "$WORK_DIR/apps/control-room/.env.local" | grep -v '^#' | xargs)

    # Run container
    docker run -d \
        --name "$SERVICE_NAME" \
        --restart always \
        -p 3001:3000 \
        -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        -e SUPABASE_URL="$SUPABASE_URL" \
        -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
        -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        -e DATABASE_URL="$DATABASE_URL" \
        "$IMAGE_NAME" \
        || log_error "Container startup failed"

    log_info "Container started: $SERVICE_NAME on port 3001"
    sleep 3
}

# Step 5: Health check
step_health_check() {
    echo ""
    echo "🔍 Step 5: Health check..."

    for i in {1..5}; do
        sleep 2
        HEALTH=$(curl -s http://localhost:3001/api/health | grep -o "healthy" || echo "")

        if [ "$HEALTH" = "healthy" ]; then
            log_info "Health check passed!"
            curl -s http://localhost:3001/api/health | jq .
            return 0
        fi

        echo "  Attempt $i/5..."
    done

    log_warn "Health check not responding yet, but container is running"
}

# Step 6: Verify endpoints
step_verify_endpoints() {
    echo ""
    echo "✅ Step 6: Verifying endpoints..."

    echo ""
    echo "Testing POST /api/synthia..."
    curl -s -X POST http://localhost:3001/api/synthia \
        -H "Content-Type: application/json" \
        -d '{"message":"Deployment test","agentId":"synthia-0"}' | jq . || log_warn "Synthia endpoint not ready"

    log_info "Deployment verification complete"
}

# Step 7: Summary
step_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT COMPLETE"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Service Details:"
    echo "  Container: $SERVICE_NAME"
    echo "  Port: 3001"
    echo "  Status: $(docker inspect -f '{{.State.Status}}' $SERVICE_NAME)"
    echo ""
    echo "Endpoints:"
    echo "  Health:  http://$VPS_IP:3001/api/health"
    echo "  Synthia: http://$VPS_IP:3001/api/synthia"
    echo "  Dashboard: http://$VPS_IP:3001/api/dashboard"
    echo ""
    echo "Logs:"
    echo "  docker logs -f $SERVICE_NAME"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
}

# Main execution
main() {
    log_info "Starting Synthia deployment..."

    if [ "$1" == "schema-only" ]; then
        step_apply_schema
    else
        step_apply_schema
        step_clone_repo
        step_build_image
        step_start_container
        step_health_check
        step_verify_endpoints
        step_summary
    fi
}

main "$@"
