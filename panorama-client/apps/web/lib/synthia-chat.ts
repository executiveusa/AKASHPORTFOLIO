import { createClient } from "./supabase";

export type ChatAction =
  | { type: "create_card"; title: string; column_id?: string; board_id?: string }
  | { type: "create_issue"; title: string; severity?: "low" | "medium" | "high" | "critical"; tenant_id: string }
  | { type: "create_goal"; title_en: string; title_es: string; tenant_id: string }
  | { type: "navigate"; path: string }
  | { type: "none" };

const INTENT_PATTERNS: Array<{ pattern: RegExp; action: (m: RegExpMatchArray, ctx: ActionContext) => ChatAction }> = [
  {
    pattern: /crear?\s+tarea\s+(.+)/i,
    action: (m, ctx) => ({ type: "create_card", title: m[1].trim(), board_id: ctx.boardId }),
  },
  {
    pattern: /(?:reportar?|crear?)\s+issue[:\s]+(.+)/i,
    action: (m, ctx) => ({ type: "create_issue", title: m[1].trim(), severity: "medium", tenant_id: ctx.tenantId }),
  },
  {
    pattern: /crear?\s+meta[:\s]+(.+)/i,
    action: (m, ctx) => ({ type: "create_goal", title_en: m[1].trim(), title_es: m[1].trim(), tenant_id: ctx.tenantId }),
  },
  {
    pattern: /(?:ir\s+a|abrir?)\s+(tablero|dashboard|inicio|issues|metas|mensajes|contactos)/i,
    action: (m, ctx) => {
      const dest: Record<string, string> = {
        tablero: `/${ctx.locale}/dashboard`,
        dashboard: `/${ctx.locale}/dashboard`,
        inicio: `/${ctx.locale}/dashboard`,
        issues: `/${ctx.locale}/issues`,
        metas: `/${ctx.locale}/goals`,
        mensajes: `/${ctx.locale}/messages`,
        contactos: `/${ctx.locale}/contacts`,
      };
      return { type: "navigate", path: dest[m[1].toLowerCase()] ?? `/${ctx.locale}/dashboard` };
    },
  },
];

interface ActionContext {
  tenantId: string;
  boardId?: string;
  locale: string;
}

export async function resolveAction(message: string, ctx: ActionContext): Promise<{ action: ChatAction; reply: string }> {
  const supabase = createClient();

  for (const { pattern, action } of INTENT_PATTERNS) {
    const match = message.match(pattern);
    if (!match) continue;

    const resolved = action(match, ctx);

    switch (resolved.type) {
      case "create_card": {
        const { data, error } = await supabase
          .from("cards")
          .insert({
            title: resolved.title,
            tenant_id: ctx.tenantId,
            board_id: resolved.board_id ?? "",
            column_id: resolved.column_id ?? "",
            priority: "medium",
            labels: [],
            position: 0,
          })
          .select()
          .single();
        if (error) return { action: resolved, reply: `Error al crear la tarea: ${error.message}` };
        return { action: resolved, reply: `✓ Tarea creada: "${resolved.title}"` };
      }

      case "create_issue": {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return { action: resolved, reply: "Sesión expirada. Inicia sesión de nuevo." };
        const { error } = await supabase.from("issues").insert({
          title: resolved.title,
          severity: resolved.severity ?? "medium",
          status: "open",
          raised_by: user.user.id,
          tenant_id: resolved.tenant_id,
        });
        if (error) return { action: resolved, reply: `Error: ${error.message}` };
        return { action: resolved, reply: `✓ Issue creado: "${resolved.title}"` };
      }

      case "create_goal": {
        const { error } = await supabase.from("goals").insert({
          title_en: resolved.title_en,
          title_es: resolved.title_es,
          tenant_id: resolved.tenant_id,
          linked_cards: [],
          percent_complete: 0,
          status: "not_started",
        });
        if (error) return { action: resolved, reply: `Error: ${error.message}` };
        return { action: resolved, reply: `✓ Meta creada: "${resolved.title_en}"` };
      }

      case "navigate":
        return { action: resolved, reply: `Abriendo ${resolved.path.split("/").pop()}…` };
    }
  }

  // No action matched — return SYNTHIA context reply
  return {
    action: { type: "none" },
    reply: "No entendí exactamente. Prueba: \"Crear tarea [nombre]\", \"Reportar issue: [descripción]\", o \"Ir a metas\".",
  };
}
