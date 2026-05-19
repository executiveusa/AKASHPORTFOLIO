# Observability Contract — PATCH_002

## Status

Langfuse wrapper: **IMPLEMENTED** (env-gated)
Events system: **IMPLEMENTED** (typed, redacted, DB-persisted)

## Langfuse Integration

**File**: `apps/control-room/src/lib/observability/langfuse.ts`

### Configuration
Required env vars:
- `LANGFUSE_HOST` — base URL of Langfuse instance
- `LANGFUSE_PUBLIC_KEY` — Langfuse public key
- `LANGFUSE_SECRET_KEY` — Langfuse secret key (server-side only)
- `LANGFUSE_BASE_URL` — optional alias for LANGFUSE_HOST

When any of these are missing, all Langfuse calls are silently no-ops.
Observability must never crash business logic.

### Helpers

| Function | Description |
|---|---|
| `langfuseConfigured()` | Returns true if all required env vars are set |
| `createTrace(input)` | Creates a trace in Langfuse; returns traceId or null |
| `logGeneration(input)` | Logs an LLM generation to an existing trace |
| `redact(value)` | Redacts secrets/PII from any value |

### Redaction Rules

The following are redacted before any data is sent to Langfuse or DB:
- `sk-*` API key patterns
- `ghp_*` GitHub tokens
- `Bearer <token>` patterns
- Object keys containing: `password`, `secret`, `token`, `key`, `authorization`

### Correlation Fields

| Field | Description |
|---|---|
| `traceId` | Returned by `createTrace()`, used to correlate spans |
| `correlationId` | Application-level ID passed through events |
| `sessionId` | Optional session grouping ID |
| `userId` | User email (redacted if PII policy applies) |

## Control Room Events

**File**: `apps/control-room/src/lib/observability/events.ts`

### Event Types

| Event | When emitted |
|---|---|
| `agent_run_started` | When an agent task begins |
| `agent_run_completed` | When an agent task succeeds |
| `agent_run_failed` | When an agent task fails |
| `approval_requested` | When a workflow approval is created |
| `approval_decided` | When an approval is approved or rejected |
| `workflow_launched` | When a Dify workflow is successfully launched |
| `workflow_blocked_by_policy` | When a workflow is blocked by tool/side-effects policy |
| `tool_invoked` | When a tool is executed via herald/cli |
| `auth_signin` | When a user signs in |
| `integration_checked` | When integration status is probed |

### Payload Shape

```typescript
interface EmittedEvent {
  event: ControlRoomEvent;
  payload: Record<string, unknown>;  // redacted
  correlationId?: string;
  at: string;  // ISO timestamp
}
```

### Persistence

Events are persisted to `control_room_events` table if Supabase DB is available.
If DB is unavailable, events are emitted in-memory only (not queued for retry).
Future patch: add Redis-backed event queue for reliability.

## Blocked Integrations

When `LANGFUSE_HOST` is not set, Langfuse tracing is completely disabled.
All trace/generation helper calls return null/void silently.
`langfuseConfigured()` returns false and callers should handle gracefully.
