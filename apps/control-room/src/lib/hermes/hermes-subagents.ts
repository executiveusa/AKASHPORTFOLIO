/**
 * Hermes Subagent Dispatcher
 * Spawning subagents requires admin role — enforced at the API route level.
 * This adapter enforces tool policy before hitting the Hermes API.
 */

import { spawnSubagent, getRunStatus, cancelRun } from './hermes-client';
import type { HermesSubagentConfig, HermesRunInfo } from './hermes-types';
import { HermesError } from './hermes-types';

const DANGEROUS_TOOLS = new Set(['shell', 'full_vm', 'code-exec']);

function validateSubagentConfig(config: HermesSubagentConfig): void {
  if (!process.env.HERMES_ENABLE_SHELL) {
    const dangerous = config.tools?.filter(t => DANGEROUS_TOOLS.has(t)) ?? [];
    if (dangerous.length > 0) {
      throw new HermesError(
        `Dangerous tools [${dangerous.join(', ')}] require HERMES_ENABLE_SHELL=true`,
        'TOOL_POLICY_VIOLATION',
        403,
      );
    }
  }
  if (!config.name?.trim()) {
    throw new HermesError('Subagent name is required', 'VALIDATION_ERROR', 422);
  }
  if (!config.role?.trim()) {
    throw new HermesError('Subagent role is required', 'VALIDATION_ERROR', 422);
  }
}

export async function dispatchSubagent(config: HermesSubagentConfig): Promise<HermesRunInfo> {
  validateSubagentConfig(config);
  return spawnSubagent(config);
}

export async function pollRunUntilDone(
  runId: string,
  maxWaitMs = 60_000,
  intervalMs = 2_000,
): Promise<HermesRunInfo> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const run = await getRunStatus(runId);
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
      return run;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  await cancelRun(runId);
  throw new HermesError(`Run ${runId} timed out after ${maxWaitMs}ms`, 'TIMEOUT', 504);
}
