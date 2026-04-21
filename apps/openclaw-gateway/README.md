# OpenClaw Gateway 🔌

Multi-channel AI assistant interface for KUPURI MEDIA. Provides unified webhook handlers for WhatsApp, Telegram, Slack, Discord, and Email with session management and event bridge to HERALD orchestration.

## Architecture

```
WhatsApp/Telegram/Slack/Discord
        ↓
  OpenClaw Gateway
        ↓
  [Session Manager] + [Event Bridge]
        ↓
  HERALD Router
        ↓
  Sphere Council (172 skills)
```

## Features

- ✅ **Multi-Channel Support**: WhatsApp, Telegram, Slack, Discord
- ✅ **Session Management**: SQLite-backed conversation history per user/channel
- ✅ **HERALD Integration**: Semantic intent classification and skill routing
- ✅ **Response Formatting**: Channel-specific message formatting (emojis, blocks, embeds)
- ✅ **Retry Logic**: Exponential backoff for HERALD communication
- ✅ **Health Checks**: Built-in health endpoints for all channels and HERALD

## Quick Start

### 1. Installation

```bash
cd apps/openclaw-gateway
npm install
```

### 2. Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Enable Channels

Edit `.env` to enable channels:

```env
WHATSAPP_ENABLED=true
TELEGRAM_ENABLED=true
SLACK_ENABLED=true
DISCORD_ENABLED=true
```

### 4. Start Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### 5. Verify Health

```bash
curl http://localhost:3000/health
```

## Channel Setup

### WhatsApp (Twilio)

1. Get credentials from [Twilio Console](https://www.twilio.com/console)
2. Set environment variables:
   ```env
   WHATSAPP_ACCOUNT_SID=ACxxx
   WHATSAPP_AUTH_TOKEN=your_token
   WHATSAPP_PHONE_NUMBER=+1234567890
   ```
3. Configure webhook in Twilio: `https://your-domain.com/whatsapp`

### Telegram

1. Create bot via [@BotFather](https://t.me/botfather)
2. Set environment variables:
   ```env
   TELEGRAM_BOT_TOKEN=your_token
   ```
3. Set webhook: 
   ```bash
   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
     -d "url=https://your-domain.com/telegram"
   ```

### Slack

1. Create app at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable "Socket Mode" or use HTTP webhooks
3. Set environment variables:
   ```env
   SLACK_BOT_TOKEN=xoxb-xxx
   SLACK_SIGNING_SECRET=xxx
   ```

### Discord

1. Create bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Get bot token
3. Set environment variable:
   ```env
   DISCORD_BOT_TOKEN=your_token
   ```

## API Endpoints

### Health Check
```bash
GET /health
```

Returns:
```json
{
  "status": "healthy|degraded",
  "timestamp": "2026-04-21T...",
  "herald": "connected|disconnected"
}
```

### Send Message
```bash
POST /api/gateway/send
Content-Type: application/json

{
  "channel": "whatsapp",
  "sender_id": "+1234567890",
  "text": "Hello!",
  "session_id": "optional-session-id"
}
```

### Get Session
```bash
GET /api/gateway/session/:sessionId
```

Returns:
```json
{
  "id": "uuid",
  "user_id": "sender_id",
  "channel": "whatsapp",
  "created_at": 1234567890,
  "updated_at": 1234567890,
  "context": {
    "history": [],
    "intent": "optional-intent"
  },
  "metadata": {}
}
```

### Get Conversation History
```bash
GET /api/gateway/history/:sessionId?limit=20
```

## Data Flow

### Incoming Message

```
User Message (WhatsApp/Telegram/Slack/Discord)
        ↓
  Channel Adapter
        ↓
  Session Manager [Create/Get]
        ↓
  Event Bridge → HERALD
        ↓
  Intent Classification + Skill Selection
        ↓
  Sphere Council Execution
        ↓
  Response Router [Format per Channel]
        ↓
  Send Response to User
```

## Message Types

All messages follow this structure:

```typescript
interface Message {
  id: string;              // UUID
  channel: ChannelType;    // 'whatsapp' | 'telegram' | 'slack' | 'discord'
  sender_id: string;       // User identifier (phone, username, etc)
  sender_name?: string;    // Display name
  text: string;            // Message content
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  timestamp: number;       // Milliseconds
}
```

## Session Management

Sessions are created per `(user_id, channel)` pair:

- **Storage**: SQLite database (`sessions.db`)
- **Persistence**: Conversation history, user context, intent tracking
- **Expiry**: Configurable via `SESSION_EXPIRY_HOURS`
- **History**: Stores up to `MAX_HISTORY_MESSAGES` (default: 50)

## HERALD Integration

OpenClaw sends incoming messages to HERALD for processing:

### Message to HERALD
```json
POST /api/herald/message
{
  "session_id": "uuid",
  "message": { ... },
  "context": { "history": [...] },
  "channel": "whatsapp"
}
```

### Response from HERALD
```json
{
  "response_id": "uuid",
  "text": "Your response",
  "confidence": 0.95,
  "intent": "lead_qualification",
  "agent": "Scout",
  "skills_used": ["lead_scoring", "company_lookup"],
  "execution_time_ms": 234
}
```

## Response Formatting

Each channel receives responses formatted appropriately:

- **WhatsApp**: Emojis + quick replies
- **Telegram**: Markdown + inline keyboards
- **Slack**: Blocks + threading support
- **Discord**: Embeds + components
- **Email**: HTML with metadata
- **SMS**: 160-char limit

## Error Handling

- **Message Processing**: Errors logged, error message sent to user
- **HERALD Connection**: Exponential backoff (1s, 2s, 4s, 8s, max 3 retries)
- **Channel Failures**: Logged and reported via health endpoint

## Development

### Type Checking
```bash
npm run typecheck
```

### Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

## Monitoring

View logs with structured output:

```bash
# Development (pretty output)
npm run dev

# Production (JSON output)
NODE_ENV=production npm start
```

Log levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

Set via `LOG_LEVEL` environment variable.

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  context TEXT NOT NULL,     -- JSON
  metadata TEXT,             -- JSON
  UNIQUE(user_id, channel)
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,        -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  intent TEXT,               -- Classification intent
  timestamp INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
)
```

## Roadmap

- [ ] Phase 2: Email channel adapter
- [ ] Phase 3: SMS (Twilio) channel adapter
- [ ] Phase 4: Webhook rate limiting + queue management
- [ ] Phase 5: Advanced context retention (long-term memory)
- [ ] Phase 6: Multi-language support with i18n
- [ ] Phase 7: Analytics dashboard

## Security

- ✅ Environment variables for all credentials
- ✅ Webhook signature verification (Slack, Twilio)
- ✅ No hardcoded secrets
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation with Zod

## License

MIT - See LICENSE file

---

**Last Updated**: 2026-04-21  
**Status**: Phase 1 Complete - Gateway Setup ✅
