#!/bin/bash

###############################################################################
# Build and Push Synthia 3.0 Docker Image
# Supports: Docker Hub, GitHub Container Registry, Local Registry
###############################################################################

set -e

# Configuration
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
REGISTRY_USER="${DOCKER_USERNAME:-}"
REGISTRY_PASSWORD="${DOCKER_PASSWORD:-}"
IMAGE_NAME="${IMAGE_NAME:-synthia-control-room}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DOCKERFILE="${DOCKERFILE:-Dockerfile.prod}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; exit 1; }
log_header() { echo -e "\n${BLUE}════════════════════════════════════════${NC}\n$1\n${BLUE}════════════════════════════════════════${NC}\n"; }

# Parse arguments
PUSH_REGISTRY="${1:-none}"

log_header "🐳 SYNTHIA 3.0 DOCKER IMAGE BUILD"

echo "Configuration:"
echo "  Registry: $REGISTRY"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG"
echo "  Dockerfile: $DOCKERFILE"
echo "  Push to: $PUSH_REGISTRY"
echo ""

# ============================================================================
# STEP 1: LOGIN TO REGISTRY (if pushing)
# ============================================================================
if [ "$PUSH_REGISTRY" != "none" ]; then
    echo "[1/4] Authenticating with registry..."

    if [ -z "$REGISTRY_PASSWORD" ]; then
        log_warn "DOCKER_PASSWORD not set - skipping authentication"
    else
        echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USER" --password-stdin "$REGISTRY" || \
            log_error "Docker login failed"
        log_info "Authenticated with $REGISTRY"
    fi
    echo ""
fi

# ============================================================================
# STEP 2: BUILD IMAGE
# ============================================================================
echo "[2/4] Building Docker image..."

docker build \
    -f "$DOCKERFILE" \
    -t "$REGISTRY/$REGISTRY_USER/$IMAGE_NAME:$IMAGE_TAG" \
    -t "$REGISTRY/$REGISTRY_USER/$IMAGE_NAME:latest" \
    --progress=plain \
    . || log_error "Docker build failed"

log_info "Image built successfully"
echo ""

# ============================================================================
# STEP 3: TEST IMAGE
# ============================================================================
echo "[3/4] Testing image..."

# Create temp container to verify
TEST_CONTAINER="synthia-test-$$"
docker run --rm --name "$TEST_CONTAINER" \
    --env ANTHROPIC_API_KEY="test" \
    --env SUPABASE_URL="http://localhost" \
    --env SUPABASE_ANON_KEY="test" \
    "$REGISTRY/$REGISTRY_USER/$IMAGE_NAME:$IMAGE_TAG" \
    node -e "console.log('✅ Node.js runtime OK')" || \
    log_error "Image test failed"

log_info "Image test passed"
echo ""

# ============================================================================
# STEP 4: PUSH IMAGE
# ============================================================================
if [ "$PUSH_REGISTRY" != "none" ]; then
    echo "[4/4] Pushing image to registry..."

    docker push "$REGISTRY/$REGISTRY_USER/$IMAGE_NAME:$IMAGE_TAG" || \
        log_error "Failed to push $IMAGE_TAG"

    docker push "$REGISTRY/$REGISTRY_USER/$IMAGE_NAME:latest" || \
        log_error "Failed to push latest"

    log_info "Image pushed successfully"
    echo ""
    echo "Image available at:"
    echo "  $REGISTRY/$REGISTRY_USER/$IMAGE_NAME:$IMAGE_TAG"
    echo "  $REGISTRY/$REGISTRY_USER/$IMAGE_NAME:latest"
else
    echo "[4/4] Skipping push (use: bash build-and-push.sh <registry_type>)"
    echo ""
    echo "Local image available:"
    docker images | grep "$IMAGE_NAME" | head -2
fi

echo ""
log_header "✅ BUILD COMPLETE"

echo "Next steps:"
echo ""
echo "1. Deploy locally:"
echo "   docker-compose up -d"
echo ""
echo "2. Deploy remotely:"
echo "   docker run -d -p 3001:3000 --env-file .env.local \\"
echo "     $REGISTRY/$REGISTRY_USER/$IMAGE_NAME:$IMAGE_TAG"
echo ""
echo "3. Verify:"
echo "   curl http://localhost:3001/api/health"
echo ""
