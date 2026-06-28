import { createClient } from "./supabase";

export type ChatAction =
  | { type: "create_card"; title: string; column_id?: string; board_id?: string }
  | { type: "create_issue"; title: string; severity?: "low" | "medium" | "high" | "critical"; tenant_id: string }
  | { type: "create_goal"; title_en: string; title_es: string; tenant_id: string }
  | { type: "navigate"; path: string }
  | { type: "none" };

interface ActionContext {
  tenantId: string;
  boardId?: string;
  locale: string;
}

const DEST_MAP: Record<string, string> = {
  tablero:   "dashboard",
  dashboard: "dashboard",
  inicio:    "dashboard",
  issues:    "issues",
  metas:     "goals",
  mensajes:  "messages",
  contactos: "contacts",
};

export async function resolveAction(
  message: string,
  ctx: ActionContext
): Promise<{ action: ChatAction; reply: string }> {
  const supabase = createClient();

  // Server-side Claude intent classification
  let parsed: { action: string; params: Record<string, string>; reply: string };
  try {
    const res = await fetch("/api/synthia/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: [] }),
    });
    parsed = await res.json();
  } catch {
    return { action: { type: "none" }, reply: "Error de conexión. Intenta de nuevo." };
  }

  const { action: actionType, params, reply } = parsed;

  switch (actionType) {
    case "create_card": {
      const { error } = await supabase.from("cards").insert({
        title: params.title ?? message,
        tenant_id: ctx.tenantId,
        board_id: ctx.boardId ?? "",
        column_id: "",
        priority: "medium",
        labels: [],
        position: 0,
      });
      if (error) return { action: { type: "none" }, reply: `Error al crear la tarea: ${error.message}` };
      return {
        action: { type: "create_card", title: params.title ?? message },
        reply,
      };
    }

    case "create_issue": {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { action: { type: "none" }, reply: "Sesión expirada. Inicia sesión de nuevo." };
      const severity = (params.severity ?? "medium") as "low" | "medium" | "high" | "critical";
      const { error } = await supabase.from("issues").insert({
        title: params.title ?? message,
        severity,
        status: "open",
        raised_by: user.user.id,
        tenant_id: ctx.tenantId,
      });
      if (error) return { action: { type: "none" }, reply: `Error: ${error.message}` };
      return {
        action: { type: "create_issue", title: params.title ?? message, severity, tenant_id: ctx.tenantId },
        reply,
      };
    }

    case "create_goal": {
      const title = params.title ?? message;
      const { error } = await supabase.from("goals").insert({
        title_en: title,
        title_es: title,
        tenant_id: ctx.tenantId,
        linked_cards: [],
        percent_complete: 0,
        status: "not_started",
      });
      if (error) return { action: { type: "none" }, reply: `Error: ${error.message}` };
      return {
        action: { type: "create_goal", title_en: title, title_es: title, tenant_id: ctx.tenantId },
        reply,
      };
    }

    case "navigate": {
      const dest = params.destination ?? "dashboard";
      const segment = DEST_MAP[dest] ?? dest;
      const path = `/${ctx.locale}/${segment}`;
      return { action: { type: "navigate", path }, reply };
    }

    default:
      return { action: { type: "none" }, reply: reply ?? "¿En qué más puedo ayudarte?" };
  }
}
