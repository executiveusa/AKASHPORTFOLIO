export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  highRisk: boolean;
};

export const localWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf_content_weekly',
    name: 'Contenido semanal',
    description: 'Genera plan editorial semanal para redes.',
    highRisk: false,
  },
  {
    id: 'wf_paid_campaign_publish',
    name: 'Publicar campaña pagada',
    description: 'Publica activos con impacto externo y gasto.',
    highRisk: true,
  },
];

export function difyAvailable() {
  return Boolean(process.env.DIFY_BASE_URL && process.env.DIFY_API_KEY);
}

export async function launchDifyWorkflow(workflowId: string, inputs: Record<string, unknown>) {
  if (!difyAvailable()) {
    return {
      ok: false,
      reason: 'DIFY_UNAVAILABLE',
    } as const;
  }

  const base = process.env.DIFY_BASE_URL!;
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
      user: 'control-room',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, reason: `DIFY_HTTP_${res.status}`, detail: text.slice(0, 500) } as const;
  }

  const data = await res.json();
  return { ok: true, data } as const;
}
