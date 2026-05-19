/**
 * Control Room event emission — typed, redacted, DB-persisted if available.
 */

import { db } from '@/lib/db/client';
import { redact } from './langfuse';

export type ControlRoomEvent =
  | 'agent_run_started'
  | 'agent_run_completed'
  | 'agent_run_failed'
  | 'approval_requested'
  | 'approval_decided'
  | 'workflow_launched'
  | 'workflow_blocked_by_policy'
  | 'tool_invoked'
  | 'auth_signin'
  | 'integration_checked';

export interface EmittedEvent {
  event: ControlRoomEvent;
  payload: Record<string, unknown>;
  correlationId?: string;
  at: string;
}

/**
 * Emit a control room event.
 * Redacts secrets from payload, persists to DB if available.
 * Never throws — observability must not crash business logic.
 */
export function emitEvent(
  event: ControlRoomEvent,
  payload: Record<string, unknown>,
  correlationId?: string,
): EmittedEvent {
  const at = new Date().toISOString();
  const safePayload = redact(payload) as Record<string, unknown>;
  const emitted: EmittedEvent = { event, payload: safePayload, correlationId, at };

  // Persist async — do not await in calling code
  if (db) {
    void (async () => {
      try {
        await db!.from('control_room_events')
          .insert({ event, payload: safePayload, correlation_id: correlationId, created_at: at });
      } catch { /* ignore */ }
    })();
  }

  return emitted;
}
