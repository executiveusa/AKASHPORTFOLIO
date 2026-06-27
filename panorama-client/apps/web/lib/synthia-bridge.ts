// SYNTHIA is a downstream consumer. HTTP only. App works when SYNTHIA is offline.
const SYNTHIA_URL = process.env.SYNTHIA_SSE_BUS_URL;
const SYNTHIA_KEY = process.env.SYNTHIA_API_KEY;

type SynthiaEvent =
  | { kind: "panorama.card.moved"; tenant_id: string; card_id: string; board_id: string }
  | { kind: "panorama.issue.raised"; tenant_id: string; issue_id: string; severity: string }
  | { kind: "panorama.goal.completed"; tenant_id: string; goal_id: string; title: string };

export async function emitToSynthia(event: SynthiaEvent): Promise<void> {
  if (!SYNTHIA_URL) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(SYNTHIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYNTHIA_KEY ?? ""}`,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch {
    // Non-fatal — SYNTHIA being offline must never break El Panorama
  }
}
