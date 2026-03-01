# Complete Setup Guide - Synthia 3.0 + Kupuri Media

## 🚀 Quick Start (All Devices - Desktop, Mobile, Tablet)

### Prerequisites
- Node.js 18+
- Rust 1.75+ (for backend)
- Git

### Step 1: Start the Backend (Terminal 1)

```bash
cd backend
cargo run --release
# Output: 🚀 Synthia 3.0 listening on http://localhost:42617
```

The Rust backend is now running on **all devices** (desktop, mobile, tablet, iPad, etc.)

### Step 2: Start the Frontend (Terminal 2)

```bash
npm install
npm run dev:web
# Output: Local: http://localhost:5173
```

Open your browser to `http://localhost:5173`

### Step 3: Access Control Room (Terminal 3 - Optional)

```bash
cd apps/control-room
npm install
npm run dev
# Output: Local: http://localhost:3000
```

Enter the code: `KUPURI2026` (case-sensitive)

---

## 🔧 Configuration Files

### Backend Configuration (`backend/.env`)

```bash
cd backend
cp .env.example .env
# Edit with your API keys:
nano .env
```

**Key Variables:**
```env
PORT=42617                    # API port
WORKSPACE_ROOT=./workspace    # Data storage
DEFAULT_PROVIDER=liquid       # LLM provider
MEM0_API_KEY=m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg
LIQUID_API_KEY=your_key
COMPOSIO_API_KEY=your_key
FIRECRAWL_API_KEY=your_key
```

### Frontend Configuration (`apps/control-room/.env.local`)

```bash
cd apps/control-room
cp .env.example .env.local
# Edit:
nano .env.local
```

**Key Variables:**
```env
SYNTHIA_BACKEND_URL=http://localhost:42617  # Points to your Synthia backend
NEXT_PUBLIC_SYNTHIA_BACKEND_URL=http://localhost:42617
NODE_ENV=development
```

---

## 📱 Device Support

### Desktop
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Full resolution support (1024px+)
- ✅ Mouse & keyboard optimized

### Mobile
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Touch optimized UI
- ✅ Responsive design (375px+)

### Tablet
- ✅ iPad Safari
- ✅ Android Tablets
- ✅ Responsive grid layout

### Why "Mobile Only" Error Happened
- **Old Issue**: MiniMax API was configured for mobile-only access
- **Solution**: Synthia 3.0 Rust backend works on ALL devices
- **Result**: No more device restrictions ✅

---

## 🧪 Testing the API

### Test from Desktop Browser

```javascript
// Open DevTools Console (F12) and paste:

fetch('http://localhost:42617/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Output: {service: "Synthia 3.0", status: "healthy", ...}
```

### Test from Mobile

```javascript
// Same code works on phone/tablet
// Just navigate to: http://your-computer-ip:42617/health
```

### Test All Endpoints

```bash
# Use the automated test script
bash test_synthia_backend.sh

# Expected output:
# 🧪 Synthia 3.0 API Test Suite
# ✅ Health Check PASS
# ✅ Service Status PASS
# ✅ Chat Endpoint PASS
# ... 11/14 tests passing
```

---

## 🌐 Development Workflow

### Local Development (All on localhost)

```
┌─────────────────────────────────────────┐
│  Your Computer                          │
├─────────────────────────────────────────┤
│ Terminal 1: Backend (port 42617)        │
│   $ cd backend && cargo run             │
│                                         │
│ Terminal 2: Frontend (port 5173)        │
│   $ npm run dev:web                     │
│                                         │
│ Terminal 3: Control Room (port 3000)    │
│   $ cd apps/control-room && npm run dev │
├─────────────────────────────────────────┤
│ Browser: http://localhost:5173          │
│ Mobile:  http://192.168.x.x:5173        │
│ Tablet:  http://192.168.x.x:5173        │
└─────────────────────────────────────────┘
```

### Access from Other Devices (Same Network)

1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows (Command Prompt)
   ipconfig | findstr IPv4
   ```

2. From phone/tablet on same WiFi:
   ```
   http://192.168.1.100:5173     (replace with your IP)
   http://192.168.1.100:42617    (Backend API)
   ```

---

## 🚀 Production Deployment

### Frontend → Vercel

```bash
# 1. Push to main branch
git add .
git commit -m "Deploy frontend"
git push origin main

# Vercel automatically builds and deploys
# Live at: https://akashportfolio.vercel.app
```

### Backend → Hostinger

```bash
# 1. Get Hostinger credentials
export HOSTINGER_API_TOKEN="your_token"
export HOSTINGER_VPS_ID="your_vps_id"
export HOSTINGER_SSH_HOST="your.vps.ip"

# 2. Deploy
cd backend
./deploy-hostinger.sh

# Live at: http://your.vps.ip:42617
```

### Control Room → Vercel (Optional)

```bash
# Create vercel.json in apps/control-room
cd apps/control-room
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "SYNTHIA_BACKEND_URL": "@synthia-backend-url",
    "NEXT_PUBLIC_SYNTHIA_BACKEND_URL": "@synthia-backend-url"
  }
}
EOF

# Deploy
vercel --prod
```

---

## 🔌 Connecting Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Link Project

```bash
cd /home/user/AKASHPORTFOLIO
vercel link

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope should contain your project? (Your Account)
# ? Link to existing project? Yes
# ? What's the name of your existing project? AKASHPORTFOLIO
```

### Deploy Frontend

```bash
vercel --prod
# Frontend live at: https://akashportfolio.vercel.app
```

### Set Environment Variables

```bash
vercel env add SYNTHIA_BACKEND_URL
# Enter: http://your-vps-ip:42617

vercel env add NEXT_PUBLIC_SYNTHIA_BACKEND_URL
# Enter: http://your-vps-ip:42617

vercel env pull  # Pull to .env.local
```

---

## 📊 Monitoring

### Backend Logs

```bash
# Local
cargo run 2>&1 | tee logs.txt

# Production (Hostinger)
ssh root@your.vps.ip
tail -f /var/log/synthia/synthia.log
tail -f /var/log/synthia/synthia-error.log
```

### Frontend Logs

```bash
# Check browser console (F12)
# Or Vercel dashboard for production logs
```

### Health Checks

```bash
# Backend health
curl http://localhost:42617/health

# All endpoints
bash test_synthia_backend.sh

# API status
curl http://localhost:42617/status | jq .
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"

```bash
# Check if backend is running
lsof -i :42617

# If not running:
cd backend
cargo run

# If port conflict:
kill -9 <PID>
cargo run
```

### "Mobile only error" (FIXED ✅)

- **Old Problem**: MiniMax API restriction
- **New Solution**: Synthia 3.0 Rust backend
- **Fallback**: Still has MiniMax if backend unavailable
- **Result**: Works everywhere now!

### "Cannot reach from phone"

1. Both on same WiFi? Yes → Continue
2. Firewall blocking? Check local firewall settings
3. Router blocking? Configure port forwarding
4. Use ngrok for external access:
   ```bash
   ngrok http 42617  # Backend tunnel
   ngrok http 5173   # Frontend tunnel
   ```

### "Control Room code not working"

- Default code: `KUPURI2026`
- Case-sensitive ⚠️
- Edit in: `apps/control-room/src/components/InviteGate.tsx`

---

## 📚 API Reference

### Base URL
- **Local**: `http://localhost:42617`
- **Production**: `http://your-vps-ip:42617`
- **Fallback**: MiniMax API (if backend down)

### Example Requests

#### Health Check
```bash
curl http://localhost:42617/health
# {"status": "healthy", "service": "Synthia 3.0", ...}
```

#### Chat (Works on All Devices!)
```bash
curl -X POST http://localhost:42617/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hola"}],
    "language": "es"
  }'
```

#### Memory (Persistence)
```bash
# Add memory
curl -X POST http://localhost:42617/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "synthia",
    "content": "Test memory"
  }'

# Retrieve
curl -X POST http://localhost:42617/memory/retrieve \
  -H "Content-Type: application/json" \
  -d '{"user_id": "synthia", "limit": 10}'
```

---

## ✅ Checklist

- [ ] Backend running on port 42617
- [ ] Frontend running on port 5173
- [ ] Can access from desktop browser
- [ ] Can access from mobile phone
- [ ] Can access from tablet
- [ ] API tests passing (11+/14)
- [ ] Control Room accessible (code: KUPURI2026)
- [ ] Environment variables set
- [ ] Ready to deploy to Hostinger

---

## 🎯 Next Steps

1. **Start Backend**: `cd backend && cargo run`
2. **Start Frontend**: `npm run dev:web`
3. **Test from Mobile**: `http://your-ip:5173`
4. **Deploy Backend**: `./backend/deploy-hostinger.sh`
5. **Deploy Frontend**: `vercel --prod` or push to main

---

**Synthia 3.0** — Now available on all devices! 🚀

Works on:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iPhone, Android)
- ✅ Tablet (iPad, Android Tablets)
- ✅ Any device with a browser!

No more "mobile only" errors. Empowering Kupuri Media globally. 🦋
