/**
 * Hermes Adapter — HTTP Client
 *
 * Adapter-first strategy: Synthia never calls Hermes internals directly.
 * All communication goes through this client using the Hermes REST API.
 *
 * When HERMES_BASE_URL is not set, all methods return degraded stubs
 * that surface clearly as "not configured" — never fake success.
 */

import type {
  HermesThread,
  HermesStartThreadInput,
  HermesContinueThreadInput,
  HermesSkill,
  HermesTool,
  HermesMemory,
  HermesSubagentConfig,
  HermesScheduleInput,
  HermesRunInfo,
  HermesConfig,
} from './hermes-types';
import { HermesError } from './hermes-types';

function getConfig(): HermesConfig {
  return {
    baseUrl:         process.env.HERMES_BASE_URL        ?? '',
    apiKey:          process.env.HERMES_API_KEY          ?? '',
    workspaceRoot:   process.env.HERMES_WORKSPACE_ROOT  ?? '/tmp/hermes',
    safeMode:        process.env.HERMES_SAFE_MODE        !== 'false',
    enableShell:     process.env.HERMES_ENABLE_SHELL     === 'true',
    enableBrowser:   process.env.HERMES_ENABLE_BROWSER   === 'true',
    enableCron:      process.env.HERMES_ENABLE_CRON      === 'true',
    enableMessaging: process.env.HERMES_ENABLE_MESSAGING === 'true',
    timeoutMs:       Number(process.env.HERMES_TIMEOUT_MS ?? 30000),
  };
}

function isConfigured(): boolean {
  const cfg = getConfig();
  return Boolean(cfg.baseUrl && cfg.apiKey);
}

async function hermesRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const cfg = getConfig();
  if (!cfg.baseUrl) {
    throw new HermesError('HERMES_BASE_URL not configured', 'NOT_CONFIGURED', 503);
  }

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
      'X-Hermes-Safe-Mode': cfg.safeMode ? '1' : '0',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(cfg.timeoutMs),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new HermesError(
      `Hermes ${method} ${path} → ${res.status}: ${text}`,
      'HTTP_ERROR',
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public adapter methods
// ---------------------------------------------------------------------------

export async function startThread(input: HermesStartThreadInput): Promise<HermesThread> {
  if (!isConfigured()) {
    throw new HermesError('Hermes not configured — set HERMES_BASE_URL and HERMES_API_KEY', 'NOT_CONFIGURED', 503);
  }
  return hermesRequest<HermesThread>('POST', '/v1/threads', input);
}

export async function continueThread(
  threadId: string,
  input: HermesContinueThreadInput,
): Promise<HermesThread> {
  return hermesRequest<HermesThread>('POST', `/v1/threads/${threadId}/messages`, input);
}

export async function getThread(threadId: string): Promise<HermesThread> {
  return hermesRequest<HermesThread>('GET', `/v1/threads/${threadId}`);
}

export async function summarizeThread(threadId: string): Promise<{ summary: string }> {
  return hermesRequest<{ summary: string }>('POST', `/v1/threads/${threadId}/summarize`);
}

export async function executeSkill(
  skillId: string,
  input: Record<string, unknown>,
): Promise<{ result: unknown; cost_usd: number }> {
  return hermesRequest('POST', `/v1/skills/${skillId}/execute`, input);
}

export async function listSkills(): Promise<HermesSkill[]> {
  if (!isConfigured()) return [];
  return hermesRequest<HermesSkill[]>('GET', '/v1/skills');
}

export async function listTools(): Promise<HermesTool[]> {
  if (!isConfigured()) return [];
  return hermesRequest<HermesTool[]>('GET', '/v1/tools');
}

export async function queryMemory(
  query: string,
  filters?: { agent_id?: string; memory_type?: string },
): Promise<HermesMemory[]> {
  const params = new URLSearchParams({ q: query, ...(filters as Record<string, string>) });
  return hermesRequest<HermesMemory[]>('GET', `/v1/memory?${params}`);
}

export async function writeMemory(memory: HermesMemory): Promise<HermesMemory> {
  return hermesRequest<HermesMemory>('POST', '/v1/memory', memory);
}

export async function spawnSubagent(config: HermesSubagentConfig): Promise<HermesRunInfo> {
  const cfg = getConfig();
  if (!cfg.enableShell && config.tools?.includes('script')) {
    throw new HermesError('Shell execution disabled — set HERMES_ENABLE_SHELL=true', 'TOOL_DISABLED', 403);
  }
  return hermesRequest<HermesRunInfo>('POST', '/v1/subagents', config);
}

export async function scheduleTask(schedule: HermesScheduleInput): Promise<{ schedule_id: string }> {
  const cfg = getConfig();
  if (!cfg.enableCron) {
    throw new HermesError('Cron disabled — set HERMES_ENABLE_CRON=true', 'TOOL_DISABLED', 403);
  }
  return hermesRequest<{ schedule_id: string }>('POST', '/v1/schedules', schedule);
}

export async function getRunStatus(runId: string): Promise<HermesRunInfo> {
  return hermesRequest<HermesRunInfo>('GET', `/v1/runs/${runId}`);
}

export async function cancelRun(runId: string): Promise<{ cancelled: boolean }> {
  return hermesRequest<{ cancelled: boolean }>('DELETE', `/v1/runs/${runId}`);
}

export function hermesStatus(): { configured: boolean; safeMode: boolean; features: Record<string, boolean> } {
  const cfg = getConfig();
  return {
    configured:  Boolean(cfg.baseUrl && cfg.apiKey),
    safeMode:    cfg.safeMode,
    features: {
      shell:     cfg.enableShell,
      browser:   cfg.enableBrowser,
      cron:      cfg.enableCron,
      messaging: cfg.enableMessaging,
    },
  };
}
