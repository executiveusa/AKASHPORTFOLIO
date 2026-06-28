import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres SYNTHIA, la asistente de proyectos de Panorama. Tu trabajo es entender lo que el usuario quiere hacer y responder con JSON estructurado.

Acciones disponibles:
- create_card: crear una tarea en el tablero kanban
- create_issue: reportar un problema o incidencia
- create_goal: crear una meta o hito del proyecto
- navigate: ir a una sección de la app (tablero, issues, metas, mensajes, contactos, dashboard)
- none: responder conversacionalmente sin ejecutar ninguna acción

Responde SIEMPRE con JSON válido en este formato exacto:
{
  "action": "create_card" | "create_issue" | "create_goal" | "navigate" | "none",
  "params": {
    "title": "...",           // para create_card, create_issue, create_goal
    "severity": "low" | "medium" | "high" | "critical",  // solo para create_issue
    "destination": "tablero" | "issues" | "metas" | "mensajes" | "contactos" | "dashboard",  // solo para navigate
  },
  "reply": "Tu respuesta en español, breve y amigable, confirmando lo que hiciste o respondiendo la pregunta."
}

Ejemplos:
- "crea una tarea llamada revisar diseño" → action: create_card, title: "Revisar diseño"
- "reporta un issue crítico con el login" → action: create_issue, title: "Problema con el login", severity: "critical"
- "quiero ver mis metas" → action: navigate, destination: "metas"
- "hola, ¿cómo estás?" → action: none, reply: "¡Hola! Estoy lista para ayudarte con tu proyecto."`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json() as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON — Claude may wrap it in markdown code fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ action: "none", params: {}, reply: text });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[synthia/chat]", err);
    return NextResponse.json(
      { action: "none", params: {}, reply: "Error al procesar. Intenta de nuevo." },
      { status: 200 }
    );
  }
}
