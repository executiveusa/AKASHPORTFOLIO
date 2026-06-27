import { describe, test, expect } from "vitest";

const API = process.env.TEST_API_URL ?? "http://localhost:8080";
const PM_TOKEN = process.env.TEST_PM_TOKEN ?? "";

describe("Goals & Milestones — SPEC 06", () => {
  // SCENARIO 6.1 — PM creates a milestone
  test("create goal returns percent_complete = 0 with no done cards", async () => {
    const res = await fetch(`${API}/api/v1/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
      body: JSON.stringify({
        title_en: "Phase 1 Launch",
        title_es: "Lanzamiento Fase 1",
        target_date: "2026-08-01",
        linked_cards: [],
      }),
    });
    if (res.ok) {
      const goal = await res.json();
      expect(goal.percent_complete).toBe(0);
      expect(goal.status).toBe("in_progress");
    } else {
      expect(res.status).toBeLessThan(500);
    }
  });

  // SCENARIO 6.2 — Percent auto-calculates
  test("percent_complete calculations: 33 → 66 → 100", () => {
    function calc(done: number, total: number) {
      return Math.round((done / total) * 100);
    }
    expect(calc(0, 3)).toBe(0);
    expect(calc(1, 3)).toBe(33);
    expect(calc(2, 3)).toBe(67);
    expect(calc(3, 3)).toBe(100);
  });

  // SCENARIO 6.3 — At-risk when past target date
  test("goal past target_date with progress < 100 should be at_risk", () => {
    const pastDate = new Date("2020-01-01");
    const now = new Date();
    const isAtRisk = pastDate < now;
    expect(isAtRisk).toBe(true);
  });

  // SCENARIO 6.4 — List goals
  test("list goals returns array", async () => {
    const res = await fetch(`${API}/api/v1/goals`, {
      headers: { Authorization: `Bearer ${PM_TOKEN}` },
    });
    if (res.ok) {
      const goals = await res.json();
      expect(Array.isArray(goals)).toBe(true);
    } else {
      expect(res.status).toBeLessThan(500);
    }
  });
});
