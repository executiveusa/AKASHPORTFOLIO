/**
 * Hermes Adapter — Type Definitions
 * Adapter-first: never fork the Hermes source into this app.
 * All types mirror the Hermes REST API contract.
 */

export type HermesRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type HermesRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type HermesExecutionMode = 'plan' | 'auto' | 'ask_before_tools' | 'admin_kernel';
export type HermesToolCategory = 'execution' | 'research' | 'data' | 'interactive' | 'media';

export interface HermesMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface HermesThread {
  id: string;
  title: string;
  status: HermesRunStatus;
  agent_id?: string;
  project_id?: string;
  execution_mode: HermesExecutionMode;
  risk_level: HermesRiskLevel;
  messages: HermesMessage[];
  summary?: string;
  cost_usd?: number;
  latency_ms?: number;
  trace_url?: string;
  created_at: string;
  updated_at: string;
}

export interface HermesStartThreadInput {
  message: string;
  agent_id?: string;
  project_id?: string;
  execution_mode?: HermesExecutionMode;
  context?: string;
  tools?: string[];
}

export interface HermesContinueThreadInput {
  message: string;
  context?: string;
}

export interface HermesSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  risk_level: HermesRiskLevel;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

export interface HermesTool {
  name: string;
  category: HermesToolCategory;
  description: string;
  risk_level: HermesRiskLevel;
  enabled: boolean;
}

export interface HermesMemory {
  id?: string;
  agent_id?: string;
  thread_id?: string;
  memory_type: 'fact' | 'preference' | 'skill' | 'rubric' | 'suggestion';
  content: string;
  source: string;
  accepted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface HermesSubagentConfig {
  name: string;
  role: string;
  tools?: string[];
  execution_mode?: HermesExecutionMode;
  parent_thread_id?: string;
  budget_usd?: number;
}

export interface HermesScheduleInput {
  cron?: string;
  interval_minutes?: number;
  run_at?: string;
  message: string;
  agent_id?: string;
  execution_mode?: HermesExecutionMode;
}

export interface HermesRunInfo {
  run_id: string;
  thread_id: string;
  status: HermesRunStatus;
  started_at?: string;
  completed_at?: string;
  cost_usd?: number;
  error?: string;
}

export interface HermesAsset {
  id: string;
  thread_id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'webpage' | 'data';
  title: string;
  url?: string;
  storage_path?: string;
  preview_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface HermesConfig {
  baseUrl: string;
  apiKey: string;
  workspaceRoot?: string;
  safeMode: boolean;
  enableShell: boolean;
  enableBrowser: boolean;
  enableCron: boolean;
  enableMessaging: boolean;
  timeoutMs: number;
}

export class HermesError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'HermesError';
  }
}

export const HERMES_DEGRADED: unique symbol = Symbol('HERMES_DEGRADED');
