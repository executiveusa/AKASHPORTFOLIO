#!/bin/bash

# Synthia 3.0 Hostinger Deployment Script
# Deploys the Rust backend to a Hostinger VPS

set -e

# Configuration from environment
HOSTINGER_API_TOKEN="${HOSTINGER_API_TOKEN}"
HOSTINGER_VPS_ID="${HOSTINGER_VPS_ID}"
HOSTINGER_SSH_HOST="${HOSTINGER_SSH_HOST}"
HOSTINGER_SSH_USER="${HOSTINGER_SSH_USER:-root}"
HOSTINGER_SSH_PORT="${HOSTINGER_SSH_PORT:-22}"
HOSTINGER_DEPLOY_PATH="${HOSTINGER_DEPLOY_PATH:-/opt/synthia}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Synthia 3.0 Hostinger Deployment${NC}"
echo "=================================================="

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if [ -z "$HOSTINGER_SSH_HOST" ]; then
    echo -e "${RED}Error: HOSTINGER_SSH_HOST not set${NC}"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: Rust/Cargo not installed${NC}"
    exit 1
fi

# Build release binary
echo -e "${YELLOW}Building release binary...${NC}"
cargo build --release
BINARY_PATH="./target/release/synthia"

if [ ! -f "$BINARY_PATH" ]; then
    echo -e "${RED}Error: Binary build failed${NC}"
    exit 1
fi

BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
echo -e "${GREEN}✓ Binary built: $BINARY_SIZE${NC}"

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
mkdir -p deployment
cp "$BINARY_PATH" deployment/
cp .env.example deployment/.env
cp -r workspace/ deployment/workspace/ 2>/dev/null || true

# Create systemd service file
cat > deployment/synthia.service << 'EOF'
[Unit]
Description=Synthia 3.0 Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/synthia
EnvironmentFile=/opt/synthia/.env
ExecStart=/opt/synthia/synthia
Restart=always
RestartSec=10
StandardOutput=append:/var/log/synthia/synthia.log
StandardError=append:/var/log/synthia/synthia-error.log

[Install]
WantedBy=multi-user.target
EOF

# Upload to Hostinger
echo -e "${YELLOW}Uploading to Hostinger VPS...${NC}"
ssh -p "$HOSTINGER_SSH_PORT" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" << 'REMOTE'
mkdir -p /opt/synthia /var/log/synthia
REMOTE

scp -P "$HOSTINGER_SSH_PORT" -r deployment/* "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST:$HOSTINGER_DEPLOY_PATH/"

echo -e "${GREEN}✓ Uploaded to $HOSTINGER_SSH_HOST:$HOSTINGER_DEPLOY_PATH${NC}"

# Set up systemd service
echo -e "${YELLOW}Setting up systemd service...${NC}"
ssh -p "$HOSTINGER_SSH_PORT" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" << 'REMOTE'
cp /opt/synthia/synthia.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable synthia
systemctl restart synthia
REMOTE

echo -e "${GREEN}✓ Systemd service installed${NC}"

# Create log file
echo -e "${YELLOW}Setting up logging...${NC}"
ssh -p "$HOSTINGER_SSH_PORT" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" << 'REMOTE'
touch /var/log/synthia/synthia.log
touch /var/log/synthia/synthia-error.log
chmod 644 /var/log/synthia/*.log
REMOTE

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
sleep 3

HEALTH_STATUS=$(ssh -p "$HOSTINGER_SSH_PORT" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" \
    "curl -s http://localhost:42617/health | grep -q 'healthy' && echo 'OK' || echo 'FAILED'")

if [ "$HEALTH_STATUS" == "OK" ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo -e "${GREEN}✓ Service is healthy and running${NC}"
else
    echo -e "${RED}✗ Deployment verification failed${NC}"
    echo -e "${YELLOW}Check logs:${NC}"
    ssh -p "$HOSTINGER_SSH_PORT" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" \
        "tail -20 /var/log/synthia/synthia-error.log"
    exit 1
fi

# Hostinger API: Get VPS status
echo -e "${YELLOW}Verifying VPS status via Hostinger API...${NC}"
curl -s -X GET "https://api.hostinger.com/v1/vps/$HOSTINGER_VPS_ID" \
    -H "Authorization: Bearer $HOSTINGER_API_TOKEN" | jq '.status'

# Cleanup
rm -rf deployment

echo ""
echo -e "${GREEN}=================================================="
echo "Deployment Complete!"
echo -e "🌐 Access Synthia: http://$HOSTINGER_SSH_HOST:42617"
echo -e "📊 Health Check: http://$HOSTINGER_SSH_HOST:42617/health"
echo -e "🧠 Memory API: http://$HOSTINGER_SSH_HOST:42617/memory/retrieve"
echo -e "=================================================="
echo -e "${NC}"
