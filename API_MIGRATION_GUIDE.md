# Synthia 3.0 API Migration Guide

## Overview

All local `/api/*` endpoints are being migrated to the Synthia 3.0 backend. This guide provides step-by-step instructions for migrating components to use the new unified API client.

## Quick Start

### 1. Import the Synthia API Client

```typescript
import { getSynthiaClient } from '@/lib/synthia-api-client';

const synthia = getSynthiaClient();
```

### 2. Use Instead of Direct Fetch

**Before:**
```typescript
const response = await fetch('/api/council');
const data = await response.json();
```

**After:**
```typescript
const synthia = getSynthiaClient();
const data = await synthia.getCouncilStatus();
```

## API Endpoints & Migrations

### Council & Orchestrator

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/council` | `synthia.getCouncilStatus()` | REST |
| `POST /api/council/start` | `synthia.startCouncilMeeting()` | REST |
| `GET /api/council/orchestrator` (SSE) | `synthia.subscribeToCouncilOrchestrator()` | EventSource |
| `GET /api/council/cron` | TBD | - |

### Swarm & Agents

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/swarm` | `synthia.getSwarmStatus()` | REST |
| `GET /api/swarm/:agentId` | `synthia.getAgentStatus(agentId)` | REST |

### Meetings

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/meeting/:id` | `synthia.getMeetingStatus(id)` | REST |
| `POST /api/meeting` | `synthia.createMeeting()` | REST |
| `GET /api/meeting/:id/live` (SSE) | `synthia.subscribeToMeeting()` | EventSource |

### Agent Mail

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/mail/:agentId` | `synthia.getAgentMail(agentId)` | REST |
| `PATCH /api/mail/:agentId/:mailId/read` | `synthia.markMailAsRead()` | REST |
| `POST /api/mail/:agentId/send` | `synthia.sendMail()` | REST |

### HERALD / Tools

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/herald/tools` | `synthia.getToolsRegistry()` | REST |
| `POST /api/herald/bootstrap` | `synthia.bootstrapTools()` | REST |
| `POST /api/herald/execute` | `synthia.executeTool()` | REST |

### Revenue

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/revenue` | `synthia.getRevenueData()` | REST |
| `POST /api/revenue/transaction` | `synthia.recordTransaction()` | REST |

### Dashboard

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/dashboard` | `synthia.getDashboardData()` | REST |
| `GET /api/dashboard/metrics` | `synthia.getDashboardMetrics()` | REST |

### Social Media

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/social/campaigns` | `synthia.getSocialCampaigns()` | REST |
| `POST /api/social/campaigns` | `synthia.createSocialCampaign()` | REST |

### Telemetry

| Local Endpoint | Migration | Method |
|---|---|---|
| `GET /api/telemetry/stream` (SSE) | `synthia.subscribeTelemetry()` | EventSource |

## Migration Pattern Examples

### REST Endpoint

**Component: CouncilRoom.tsx**

```typescript
// Before
useEffect(() => {
  fetch('/api/council')
    .then(r => r.json())
    .then(data => setCouncilData(data))
    .catch(err => console.error(err));
}, []);

// After
import { getSynthiaClient } from '@/lib/synthia-api-client';

useEffect(() => {
  const synthia = getSynthiaClient();
  synthia.getCouncilStatus()
    .then(data => setCouncilData(data))
    .catch(err => console.error(err));
}, []);
```

### EventSource / Streaming

**Component: SphereField.tsx**

```typescript
// Before
const es = new EventSource(`/api/council/orchestrator?meetingId=${meetingId}`);
es.onmessage = (e) => {
  const data = JSON.parse(e.data);
  setPhaseData(data);
};

// After
import { getSynthiaClient } from '@/lib/synthia-api-client';

useEffect(() => {
  const synthia = getSynthiaClient();
  const unsubscribe = synthia.subscribeToCouncilOrchestrator(meetingId, (data) => {
    setPhaseData(data);
  });
  
  return unsubscribe;
}, [meetingId]);
```

### Error Handling & Fallback

The `SynthiaAPIClient` automatically falls back to local `/api/*` endpoints if the Synthia backend is unavailable. You can control this behavior:

```typescript
const synthia = getSynthiaClient({
  baseUrl: 'https://synthia.kupuri.local/api',
  fallbackToLocal: true,  // Enable automatic fallback
  timeout: 5000,          // Request timeout in ms
});
```

To disable fallback and force Synthia backend:

```typescript
const synthia = getSynthiaClient({
  fallbackToLocal: false,
});
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SYNTHIA_API_URL=http://localhost:9000/api
NEXT_PUBLIC_SYNTHIA_API_KEY=your-api-key-here
```

### Health Check

```typescript
const synthia = getSynthiaClient();
const isHealthy = await synthia.healthCheck();

if (!isHealthy) {
  console.warn('Synthia backend unavailable, using local fallback');
}
```

## Monitoring Migration Progress

### TODO Comments

Search for TODO markers to find remaining migrations:

```bash
grep -r "TODO.*migrate.*api" apps/control-room/src --include="*.ts" --include="*.tsx"
```

### Components Pending Migration

- [ ] CouncilRoom.tsx - `/api/council`
- [ ] AgentGrid.tsx - `/api/swarm`
- [ ] MeetingRoom.tsx - `/api/meeting`
- [ ] AgentMailbox.tsx - `/api/mail`
- [ ] HeraldToolLibrary.tsx - `/api/herald`
- [ ] ControlRoomDashboard.tsx - `/api/dashboard`
- [ ] DailyBriefCard.tsx - `/api/daily-brief`
- [ ] VozInterface.tsx - `/api/voz`
- [ ] ViewingRoom.tsx - `/api/council`
- [ ] TelemetryLog.tsx - `/api/telemetry`
- [ ] RepoPulse.tsx - `/api/repos`
- [ ] Social Pages - `/api/social`
- [ ] Revenue Pages - `/api/revenue`
- [ ] Watcher Pages - `/api/watcher`

## Testing the Migration

### Unit Test Example

```typescript
import { getSynthiaClient } from '@/lib/synthia-api-client';

describe('SynthiaAPIClient', () => {
  it('should fetch council status', async () => {
    const synthia = getSynthiaClient();
    const status = await synthia.getCouncilStatus();
    expect(status).toHaveProperty('agents');
  });

  it('should fallback to local endpoint on failure', async () => {
    const synthia = getSynthiaClient({
      baseUrl: 'http://invalid-synthia-url',
      fallbackToLocal: true,
    });
    const status = await synthia.getCouncilStatus();
    expect(status).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
it('should handle EventSource subscriptions', (done) => {
  const synthia = getSynthiaClient();
  
  const unsubscribe = synthia.subscribeToCouncilOrchestrator('test-meeting', (data) => {
    expect(data).toBeDefined();
    unsubscribe();
    done();
  });
});
```

## Deployment Considerations

1. **Backend Availability**: Ensure Synthia 3.0 backend is deployed before disabling local fallback
2. **API Key Management**: Store API keys in environment variables, never in code
3. **Timeout Values**: Adjust timeouts based on network latency (default: 5000ms)
4. **Monitoring**: Log failed API calls for debugging

## Support & Questions

For issues or questions about the migration:

1. Check the TODO comments in components
2. Review this guide's examples
3. Examine the `synthia-api-client.ts` implementation
4. File issues in the repository with `[API-MIGRATION]` prefix

## Timeline

- **Phase 1 (Complete)**: Create unified API client ✅
- **Phase 2 (Current)**: Migrate high-priority components
- **Phase 3**: Migrate remaining components
- **Phase 4**: Full Synthia backend validation
- **Phase 5**: Disable local fallback in production
