#!/bin/bash
# free-claude-code proxy installation script
# Installs and configures the free-claude-code service on port 8082

set -e

echo "🚀 Installing free-claude-code proxy..."

# Check if Python 3.10+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Install from https://python.org"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python $PYTHON_VERSION found"

# Clone free-claude-code repository
if [ ! -d "free-claude-code" ]; then
    echo "📦 Cloning free-claude-code repository..."
    git clone https://github.com/Alishahryar1/free-claude-code.git
else
    echo "✅ free-claude-code directory already exists"
fi

cd free-claude-code

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip setuptools wheel
pip install fastapi uvicorn python-dotenv aiohttp requests

# Optional: Install model backends
echo ""
echo "📦 Optional: Install local model backends for FREE mode"
echo "   1. Ollama  → https://ollama.ai"
echo "   2. LM Studio → https://lmstudio.ai"
echo "   3. llama.cpp → https://github.com/ggerganov/llama.cpp"
echo ""
read -p "Install Ollama CLI? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Visit https://ollama.ai to download and install Ollama"
fi

# Create .env file for proxy
cat > .env << 'EOF'
# free-claude-code proxy configuration
PROXY_PORT=8082
PROXY_HOST=0.0.0.0

# Primary backend (choose one)
BACKEND=ollama
# Options: ollama, lm-studio, openrouter, llama-cpp

# Ollama configuration
OLLAMA_ENDPOINT=http://localhost:11434

# LM Studio configuration
LMSTUDIO_ENDPOINT=http://localhost:1234

# OpenRouter configuration (fallback)
OPENROUTER_API_KEY=

# Model mappings
MODEL_OPUS=neural-chat-7b
MODEL_SONNET=mistral
MODEL_HAIKU=neural-chat-7b

# Logging
LOG_LEVEL=INFO
EOF

echo "✅ Created .env file"

# Create startup script
cat > start-proxy.sh << 'EOF'
#!/bin/bash
source venv/bin/activate
python server.py
EOF

chmod +x start-proxy.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Install a local model backend (choose one):"
echo "   • Ollama:      brew install ollama (macOS) or visit https://ollama.ai"
echo "   • LM Studio:   Download from https://lmstudio.ai"
echo "   • llama.cpp:   Build from https://github.com/ggerganov/llama.cpp"
echo ""
echo "2. Pull a model (if using Ollama):"
echo "   ollama pull neural-chat-7b"
echo "   ollama pull mistral"
echo ""
echo "3. Start the proxy:"
echo "   cd free-claude-code"
echo "   ./start-proxy.sh"
echo ""
echo "4. Set CODE_MODE=FREE in your environment:"
echo "   export CODE_MODE=FREE"
echo ""
echo "5. Verify proxy is running:"
echo "   curl http://localhost:8082/health"
echo ""
echo "🎉 Ready to use FREE mode!"
