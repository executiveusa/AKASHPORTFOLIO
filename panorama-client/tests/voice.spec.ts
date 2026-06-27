import { describe, test, expect } from "vitest";
import { parseVoiceCommand } from "../apps/web/lib/voice-commands";

describe("Voice Commands — SPEC 03", () => {
  // SCENARIO 3.1 — Mark task done by voice (EN)
  test("parse_move_card_en — mark as done", () => {
    const i = parseVoiceCommand("Mark the homepage design task as done", "en");
    expect(i.confidence).toBeGreaterThanOrEqual(0.85);
    expect(i.action.kind).toBe("move_card");
    if (i.action.kind === "move_card") {
      expect(i.action.target).toContain("homepage design");
      expect(i.action.to_column).toBe("done");
    }
  });

  // SCENARIO 3.2 — Add issue by voice (ES)
  test("parse_add_issue_es", () => {
    const i = parseVoiceCommand("Agregar issue: el cliente no recibió sus accesos", "es");
    expect(i.confidence).toBeGreaterThanOrEqual(0.85);
    expect(i.action.kind).toBe("add_issue");
    if (i.action.kind === "add_issue") {
      expect(i.action.title).toContain("cliente");
    }
  });

  // SCENARIO 3.3 — Filter overdue (ES)
  test("parse_filter_overdue_es", () => {
    const i = parseVoiceCommand("mostrar tareas atrasadas", "es");
    expect(i.confidence).toBeGreaterThanOrEqual(0.90);
    expect(i.action.kind).toBe("filter_by");
    if (i.action.kind === "filter_by") {
      expect(i.action.filter).toBe("overdue");
    }
  });

  // SCENARIO 3.3 — Filter overdue (EN)
  test("parse_filter_overdue_en", () => {
    const i = parseVoiceCommand("show me overdue tasks", "en");
    expect(i.confidence).toBeGreaterThanOrEqual(0.90);
    expect(i.action.kind).toBe("filter_by");
    if (i.action.kind === "filter_by") {
      expect(i.action.filter).toBe("overdue");
    }
  });

  // SCENARIO 3.4 — Unknown command
  test("unknown_returns_confidence_zero", () => {
    const i = parseVoiceCommand("purple elephant dancing in the rain", "en");
    expect(i.confidence).toBe(0.0);
    expect(i.action.kind).toBe("unknown");
  });

  // Comment command (EN)
  test("parse_add_comment_en", () => {
    const i = parseVoiceCommand("add comment on homepage redesign: looks great!", "en");
    expect(i.confidence).toBeGreaterThanOrEqual(0.85);
    expect(i.action.kind).toBe("add_comment");
  });

  // Comment command (ES)
  test("parse_add_comment_es", () => {
    const i = parseVoiceCommand("agregar comentario en rediseño: se ve muy bien", "es");
    expect(i.confidence).toBeGreaterThanOrEqual(0.85);
    expect(i.action.kind).toBe("add_comment");
  });
});
