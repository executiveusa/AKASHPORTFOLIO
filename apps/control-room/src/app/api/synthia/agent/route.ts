import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/litellm-gateway";
import { requireOperatorOrAdmin, toErrorResponse } from "@/lib/auth/guards";

/**
 * POST /api/synthia/agent — Hermes single-entry agent
 * Body: { message: string, context?: string }
 * Returns: { reply, agent_used, bead_id, cost_cents }
 */
export const dynamic = "force-dynamic";

// Sphere routing heuristics
function routeToSphere(message: string): string {
  const lower = message.toLowerCase();
  if (/gasto|factura|recibo|pago|dinero|ingreso|precio|costo|presupuesto/.test(lower)) return "DR. ECONOMÍA";
  if (/proyecto|plan|pmbok|wbs|riesgo|alcance|scope|cronograma|hito/.test(lower)) return "EL PANORAMA";
  if (/tarea|delegar|asignar|pendiente|checklist/.test(lower)) return "FORJADORA";
  if (/cliente|venta|oportunidad|prospecto|negocio/.test(lower)) return "CAZADORA";
  if (/código|técnico|bug|deploy|api|sistema|arquitectura/.test(lower)) return "ING. TEKNOS";
  if (/contenido|cultura|podcast|redes|social|post/.test(lower)) return "DRA. CULTURA";
  if (/estrategia|decisión|consejo|cómo debo/.test(lower)) return "ALEX";
  return "SYNTHIA";
}

export async function POST(req: NextRequest) {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: { message?: string; context?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 422 });
  }

  const agentUsed = routeToSphere(message);
  const requestedModel = typeof body.model === 'string' ? body.model : undefined;

  if (!process.env.OPEN_ROUTER_API && !process.env.ANTHROPIC_API_KEY) {
    // Graceful fallback without any LLM key
    return NextResponse.json({
      ok: true,
      reply: `Entendido. He enrutado tu mensaje a ${agentUsed}. Para activar respuestas inteligentes, configura OPEN_ROUTER_API en Infisical.`,
      agent_used: agentUsed,
      bead_id: null,
      cost_cents: 0,
      model: null,
    });
  }

  try {
    const systemPrompt = `Eres Synthia, la CEO invisible de Kupuri Media. Respondes en español mexicano natural, eres directa y profesional. Actualmente canalizando a: ${agentUsed}.

Reglas:
- Responde en máximo 3 párrafos
- Si detectas una tarea delegable, confirma con el ID del bead (formato: ZTE-MMDD-XXXX)
- Si detectas una pregunta de gestión de proyectos, cita brevemente el proceso PMBOK relevante
- Si el usuario sube una foto, analiza el contenido y ruta al agente correcto
- Nunca digas "no puedo" — siempre propone una alternativa`;

    // Free by default; a paid model runs only if the operator picked it in the switcher.
    const result = await callLLM(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
      { model: requestedModel, maxTokens: 512, temperature: 0.7, sphereId: 'synthia' },
    );
    const reply = result.content?.trim() || 'Procesando tu solicitud...';
    const costCents = Math.round((result.costEstimateUsd ?? 0) * 100);

    return NextResponse.json({
      ok: true,
      reply,
      agent_used: agentUsed,
      bead_id: null,
      cost_cents: costCents,
      model: result.model,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[synthia/agent]", err);
    return NextResponse.json({
      ok: true,
      reply: "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
      agent_used: agentUsed,
      bead_id: null,
      cost_cents: 0,
    });
  }
}
