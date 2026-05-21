/**
 * Hermes Scheduler Adapter
 * Wraps task scheduling. Disabled unless HERMES_ENABLE_CRON=true.
 */

import { scheduleTask } from './hermes-client';
import type { HermesScheduleInput } from './hermes-types';
import { HermesError } from './hermes-types';

export async function scheduleRecurring(
  cronExpression: string,
  message: string,
  agentId?: string,
): Promise<string> {
  if (process.env.HERMES_ENABLE_CRON !== 'true') {
    throw new HermesError('Cron scheduling disabled in this environment', 'TOOL_DISABLED', 403);
  }
  const result = await scheduleTask({ cron: cronExpression, message, agent_id: agentId });
  return result.schedule_id;
}

export async function scheduleOnce(
  runAt: Date,
  message: string,
  agentId?: string,
): Promise<string> {
  if (process.env.HERMES_ENABLE_CRON !== 'true') {
    throw new HermesError('Cron scheduling disabled in this environment', 'TOOL_DISABLED', 403);
  }
  const input: HermesScheduleInput = {
    run_at: runAt.toISOString(),
    message,
    agent_id: agentId,
  };
  const result = await scheduleTask(input);
  return result.schedule_id;
}

export async function scheduleInterval(
  intervalMinutes: number,
  message: string,
  agentId?: string,
): Promise<string> {
  if (process.env.HERMES_ENABLE_CRON !== 'true') {
    throw new HermesError('Cron scheduling disabled in this environment', 'TOOL_DISABLED', 403);
  }
  const result = await scheduleTask({ interval_minutes: intervalMinutes, message, agent_id: agentId });
  return result.schedule_id;
}
