export type VoiceAction =
  | { kind: "move_card"; target: string; to_column: string }
  | { kind: "add_issue"; title: string; severity: string }
  | { kind: "add_comment"; card_ref: string; body: string }
  | { kind: "filter_by"; filter: string }
  | { kind: "read_aloud"; subject: string }
  | { kind: "unknown" };

export interface VoiceIntent {
  action: VoiceAction;
  confidence: number;
  raw: string;
}

export function parseVoiceCommand(transcript: string, locale: "en" | "es"): VoiceIntent {
  const t = transcript.toLowerCase().trim();
  const result = locale === "es" ? matchEs(t) : matchEn(t);
  return { ...result, raw: transcript };
}

function matchEs(t: string): { action: VoiceAction; confidence: number } {
  const moveMatch = t.match(/mover (.+?) a (.+)/);
  if (moveMatch) {
    return { action: { kind: "move_card", target: moveMatch[1], to_column: moveMatch[2] }, confidence: 0.92 };
  }

  const issueMatch = t.match(/agregar issue[:\s]+(.+)/);
  if (issueMatch) {
    return { action: { kind: "add_issue", title: issueMatch[1], severity: "medium" }, confidence: 0.90 };
  }

  const commentMatch = t.match(/agregar comentario en (.+?)[:\s]+(.+)/);
  if (commentMatch) {
    return { action: { kind: "add_comment", card_ref: commentMatch[1], body: commentMatch[2] }, confidence: 0.88 };
  }

  if (t.includes("tareas atrasadas") || t.includes("tareas vencidas")) {
    return { action: { kind: "filter_by", filter: "overdue" }, confidence: 0.95 };
  }

  const whoMatch = t.match(/¿?quién tiene asignada (.+)\??/);
  if (whoMatch) {
    return { action: { kind: "read_aloud", subject: whoMatch[1] }, confidence: 0.88 };
  }

  return { action: { kind: "unknown" }, confidence: 0.0 };
}

function matchEn(t: string): { action: VoiceAction; confidence: number } {
  const markMatch = t.match(/mark (.+?) as (done|review|in review|progress|in progress|planning)/);
  if (markMatch) {
    return { action: { kind: "move_card", target: markMatch[1], to_column: markMatch[2] }, confidence: 0.92 };
  }

  const issueMatch = t.match(/add issue[:\s]+(.+)/);
  if (issueMatch) {
    return { action: { kind: "add_issue", title: issueMatch[1], severity: "medium" }, confidence: 0.90 };
  }

  const commentMatch = t.match(/add comment on (.+?)[:\s]+(.+)/);
  if (commentMatch) {
    return { action: { kind: "add_comment", card_ref: commentMatch[1], body: commentMatch[2] }, confidence: 0.88 };
  }

  if (t.includes("overdue") || t.includes("delayed") || t.includes("past due")) {
    return { action: { kind: "filter_by", filter: "overdue" }, confidence: 0.95 };
  }

  const whoMatch = t.match(/who is assigned to (.+)\??/);
  if (whoMatch) {
    return { action: { kind: "read_aloud", subject: whoMatch[1] }, confidence: 0.88 };
  }

  return { action: { kind: "unknown" }, confidence: 0.0 };
}

// Map voice column names to actual column title_en values
export function resolveColumnName(voiceCol: string): string {
  const map: Record<string, string> = {
    done: "Done",
    review: "In Review",
    "in review": "In Review",
    progress: "In Progress",
    "in progress": "In Progress",
    planning: "In Planning",
    "in planning": "In Planning",
    backlog: "Backlog",
    completado: "Done",
    revisión: "In Review",
    revision: "In Review",
    progreso: "In Progress",
    planificación: "In Planning",
    planificacion: "In Planning",
    pendiente: "Backlog",
  };
  return map[voiceCol.toLowerCase()] ?? voiceCol;
}
