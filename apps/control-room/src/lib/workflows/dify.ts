/**
 * Dify workflow integration — persisted registry, guarded launch.
 */

import { db } from '@/lib/db/client';

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  highRisk: boolean;
  provider: string;
  active: boolean;
};

/** Fallback in-memory definitions when DB is not available */
export const BUILTIN_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_content_weekly',
    name: 'Contenido semanal',
    description: 'Genera plan editorial semanal para redes.',
    highRisk: false,
    provider: 'dify',
    active: true,
  },
  {
    id: 'wf_paid_campaign_publish',
    name: 'Publicar campaña pagada',
    description: 'Publica activos con impacto externo y gasto.',
    highRisk: true,
    provider: 'dify',
    active: true,
  },
];

/** Returns registry from DB if available, otherwise built-in list */
export async function getWorkflowRegistry(): Promise<WorkflowDefinition[]> {
  if (db) {
    const { data, error } = await db
      .from('workflow_registry')
      .select('*')
      .eq('active', true)
      .order('id');
    if (!error && data) {
      return data.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        highRisk: r.high_risk,
        provider: r.provider,
        active: r.active,
      }));
    }
  }
  return BUILTIN_WORKFLOWS;
}

/** Check whether Dify is configured */
export function difyAvailable(): boolean {
  return Boolean(process.env.DIFY_BASE_URL && process.env.DIFY_API_KEY);
}

export type LaunchResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: string; detail?: string };

/** Launch a Dify workflow via HTTP API */
export async function launchDifyWorkflow(
  workflowId: string,
  inputs: Record<string, unknown>,
  requestedBy?: string
): Promise<LaunchResult> {
  if (!difyAvailable()) {
    return { ok: false, reason: 'DIFY_UNAVAILABLE' };
  }

  // Check external side effects policy
  if (process.env.DISABLE_EXTERNAL_SIDE_EFFECTS === 'true') {
    return { ok: false, reason: 'BLOCKED_EXTERNAL_SIDE_EFFECTS_DISABLED', detail: 'Set DISABLE_EXTERNAL_SIDE_EFFECTS=false to allow workflow execution.' };
  }

  const base = process.env.DIFY_BASE_URL!;
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        inputs,
        response_mode: 'blocking',
        user: requestedBy ?? 'control-room',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: `DIFY_HTTP_${res.status}`, detail: text.slice(0, 500) };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, reason: 'DIFY_FETCH_ERROR', detail: err instanceof Error ? err.message : String(err) };
  }
}
