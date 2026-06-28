import { describe, test, expect } from "vitest";

const API = process.env.TEST_API_URL ?? "http://localhost:8080";
const PM_TOKEN = process.env.TEST_PM_TOKEN ?? "";
const CLIENT_TOKEN = process.env.TEST_CLIENT_TOKEN ?? "";

describe("Kanban — SPEC 02", () => {
  // SCENARIO 2.1 — Card move syncs within 2 seconds
  test("card move reflected to WebSocket subscriber within 2000ms", async () => {
    // This test requires a live board + WS connection
    // In CI: use test board seeded in beforeAll
    const boardId = process.env.TEST_BOARD_ID;
    if (!boardId) return; // Skip if not configured

    const received = await new Promise<boolean>((resolve) => {
      const ws = new WebSocket(`${API.replace("http", "ws")}/ws/board/${boardId}`);
      const timeout = setTimeout(() => resolve(false), 2000);

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "CardMoved") {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        }
      };

      ws.onopen = async () => {
        // Trigger a card move from another client
        await fetch(`${API}/api/v1/cards/${process.env.TEST_CARD_ID}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
          body: JSON.stringify({ to_column_id: process.env.TEST_COLUMN_ID, position: 0 }),
        });
      };
    });

    expect(received).toBe(true);
  });

  // SCENARIO 2.2 — WIP limit blocks move
  test("WIP limit exceeded returns 422", async () => {
    const cardId = process.env.TEST_CARD_ID_2;
    const wipColumnId = process.env.TEST_WIP_COLUMN_ID;
    if (!cardId || !wipColumnId) return;

    const res = await fetch(`${API}/api/v1/cards/${cardId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CLIENT_TOKEN}` },
      body: JSON.stringify({ to_column_id: wipColumnId, position: 99 }),
    });

    expect(res.status).toBe(422);
  });

  // SCENARIO 2.5 — Goal percent_complete recalculates on card move
  test("goal percent_complete recalculates on card move", async () => {
    const goalId = process.env.TEST_GOAL_ID;
    const doneCardId = process.env.TEST_DONE_CARD_ID;
    const doneColumnId = process.env.TEST_DONE_COLUMN_ID;
    if (!goalId || !doneCardId || !doneColumnId) return;

    // Move card to Done
    await fetch(`${API}/api/v1/cards/${doneCardId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
      body: JSON.stringify({ to_column_id: doneColumnId, position: 0 }),
    });

    // Check goal progress updated
    const goalRes = await fetch(`${API}/api/v1/goals`, {
      headers: { Authorization: `Bearer ${PM_TOKEN}` },
    });
    const goals = await goalRes.json();
    const goal = goals.find((g: { id: string }) => g.id === goalId);
    expect(goal.percent_complete).toBeGreaterThan(0);
  });
});
