export type ControlRoomEvent='agent_run_started'|'agent_run_completed'|'agent_run_failed'|'approval_requested'|'workflow_launched';
export function emitEvent(event: ControlRoomEvent,payload:Record<string,unknown>){return {event,payload,at:new Date().toISOString()};}
