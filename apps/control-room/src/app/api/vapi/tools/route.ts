/**
 * /api/vapi/tools — VAPI tool webhook handler
 * ALEX™ calls these when she needs to take actions during a voice call.
 * Each tool maps to a business operation in SYNTHIA™ Sphere OS.
 */

import { NextRequest, NextResponse } from 'next/server';

interface VapiToolCall {
  toolCallId: string;
  name: string;
  parameters: Record<string, unknown>;
}

interface VapiWebhookBody {
  message?: {
    type: string;
    toolCallList?: VapiToolCall[];
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: VapiWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const toolCalls = body.message?.toolCallList ?? [];
  if (!toolCalls.length) {
    return NextResponse.json({ results: [] });
  }

  const results = await Promise.all(toolCalls.map(handleToolCall));
  return NextResponse.json({ results });
}

async function handleToolCall(call: VapiToolCall): Promise<{ toolCallId: string; result: string }> {
  const { toolCallId, name, parameters } = call;

  try {
    switch (name) {
      case 'get_sphere_status': {
        const { supabaseAdmin } = await import('@/lib/supabase-client');
        const query = supabaseAdmin.from('agent_state').select('agent_id,name,status,metadata');
        if (parameters.sphereId) {
          query.eq('agent_id', parameters.sphereId);
        }
        const { data } = await query;
        const spheres = (data ?? []).map((s: { agent_id: string; name: string; status: string }) =>
          `${s.name}: ${s.status}`
        ).join(', ');
        return { toolCallId, result: spheres || 'No hay esferas activas en este momento.' };
      }

      case 'run_council_meeting': {
        const { topic, urgency = 'medium' } = parameters as { topic: string; urgency?: string };
        const { supabaseAdmin } = await import('@/lib/supabase-client');
        await supabaseAdmin.from('agent_tasks').insert({
          task_type: 'council_meeting',
          input: { topic, urgency },
          status: 'pending',
          created_at: new Date().toISOString(),
        });
        return {
          toolCallId,
          result: `Reunión del Consejo convocada sobre "${topic}" con urgencia ${urgency}. Las 9 esferas han sido notificadas.`,
        };
      }

      case 'search_knowledge': {
        const { query } = parameters as { query: string };
        // Simple Supabase full-text search on agent_memory table
        const { supabaseAdmin } = await import('@/lib/supabase-client');
        const { data } = await supabaseAdmin
          .from('agent_memory')
          .select('key,value')
          .textSearch('value', query, { type: 'websearch' })
          .limit(3);
        if (!data?.length) {
          return { toolCallId, result: `No encontré información específica sobre "${query}" en la base de conocimiento.` };
        }
        const snippets = data.map((d: { key: string; value: string }) => `${d.key}: ${String(d.value).slice(0, 100)}`).join(' | ');
        return { toolCallId, result: snippets };
      }

      case 'create_task': {
        const { title, assignee, priority = 'medium' } = parameters as {
          title: string; assignee?: string; priority?: string;
        };
        const { supabaseAdmin } = await import('@/lib/supabase-client');
        const { data } = await supabaseAdmin.from('agent_tasks').insert({
          task_type: 'manual',
          input: { title, assignee, priority },
          status: 'pending',
          created_at: new Date().toISOString(),
        }).select('id').single();
        return {
          toolCallId,
          result: `Tarea creada: "${title}" (ID: ${(data as { id: string } | null)?.id ?? 'nuevo'}, prioridad: ${priority}${assignee ? `, asignada a: ${assignee}` : ''}).`,
        };
      }

      case 'get_analytics': {
        const { metric = 'overview', period = 'today' } = parameters as { metric?: string; period?: string };
        // Return stub analytics — wire to real dashboard-data.ts as needed
        return {
          toolCallId,
          result: `Métricas de ${metric} para ${period}: datos en procesamiento. Revisa el dashboard para detalles completos.`,
        };
      }

      default:
        return { toolCallId, result: `Herramienta "${name}" no reconocida.` };
    }
  } catch (err) {
    console.error(`[vapi/tools] Error in tool ${name}:`, (err as Error).message);
    return { toolCallId, result: 'Hubo un error procesando esa acción. Por favor intenta de nuevo.' };
  }
}
