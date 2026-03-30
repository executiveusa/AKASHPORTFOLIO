import { NextRequest, NextResponse } from "next/server";

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
  let body: { message?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 422 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const agentUsed = routeToSphere(message);

  if (!apiKey) {
    // Graceful fallback without API key
    return NextResponse.json({
      ok: true,
      reply: `Entendido. He enrutado tu mensaje a ${agentUsed}. Para activar respuestas inteligentes, configura ANTHROPIC_API_KEY en las variables de entorno.`,
      agent_used: agentUsed,
      bead_id: null,
      cost_cents: 0,
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

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? "Procesando tu solicitud...";
    const inputTokens = data?.usage?.input_tokens ?? 0;
    const outputTokens = data?.usage?.output_tokens ?? 0;
    // claude-haiku pricing: ~$0.25/1M input, $1.25/1M output
    const costCents = Math.round((inputTokens * 0.000025 + outputTokens * 0.000125) * 100);

    return NextResponse.json({
      ok: true,
      reply,
      agent_used: agentUsed,
      bead_id: null,
      cost_cents: costCents,
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
