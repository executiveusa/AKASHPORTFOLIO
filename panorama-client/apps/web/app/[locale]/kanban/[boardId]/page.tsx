"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Board } from "@/components/kanban/Board";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { PhaseTabs } from "@/components/kanban/PhaseTabs";
import { PhaseGate } from "@/components/kanban/PhaseGate";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { flushQueue } from "@/lib/offline-queue";

type Column = Database["public"]["Tables"]["columns"]["Row"];
type Card = Database["public"]["Tables"]["cards"]["Row"];

export interface BoardData {
  id: string;
  name: string;
  columns: (Column & { cards: Card[] })[];
}

export default function KanbanPage() {
  const { boardId, locale } = useParams<{ boardId: string; locale: string }>();
  const t = useTranslations("kanban");
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [activePhase, setActivePhase] = useState<"iniciacion" | "planificacion" | "ejecucion" | "cierre">("ejecucion");
  const [phaseGate, setPhaseGate] = useState<{ status: "pending" | "approved" | "blocked"; approved_at: string | null } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadBoard();
    connectWebSocket();
    flushOfflineQueue();

    return () => wsRef.current?.close();
  }, [boardId]);

  useEffect(() => {
    loadPhaseGate();
  }, [boardId, activePhase]);

  async function loadPhaseGate() {
    const supabase = createClient();
    const { data } = await supabase
      .from("phase_gates")
      .select("status, approved_at")
      .eq("board_id", boardId)
      .eq("phase", activePhase)
      .maybeSingle();
    setPhaseGate(data ? { status: data.status as "pending" | "approved" | "blocked", approved_at: data.approved_at } : { status: "pending", approved_at: null });
  }

  async function loadBoard() {
    const supabase = createClient();

    const { data: boardData } = await supabase
      .from("boards")
      .select("id, name")
      .eq("id", boardId)
      .single();

    if (!boardData) { setLoading(false); return; }

    const { data: columns } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position");

    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .eq("board_id", boardId)
      .order("position");

    const enriched = (columns ?? []).map((col) => ({
      ...col,
      cards: (cards ?? []).filter((c) => c.column_id === col.id),
    }));

    setBoard({ ...boardData, columns: enriched });
    setLoading(false);
  }

  function connectWebSocket() {
    const apiUrl = process.env.NEXT_PUBLIC_PANORAMA_API_URL;
    if (!apiUrl) return;

    const ws = new WebSocket(`${apiUrl.replace("https", "wss")}/ws/board/${boardId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "CardMoved") {
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              cards: col.id === msg.to_column_id
                ? [...col.cards.filter((c) => c.id !== msg.card_id), { ...col.cards.find((c) => c.id === msg.card_id)!, column_id: msg.to_column_id, position: msg.position }].sort((a, b) => a.position - b.position)
                : col.cards.filter((c) => c.id !== msg.card_id),
            })),
          };
        });
      }
    };

    ws.onclose = () => {
      // Reconnect after 2s
      setTimeout(connectWebSocket, 2000);
    };
  }

  async function flushOfflineQueue() {
    const supabase = createClient();
    await flushQueue(async (op) => {
      if (op.type === "move_card") {
        const { card_id, column_id, position } = op.payload as { card_id: string; column_id: string; position: number };
        await supabase.from("cards").update({ column_id, position }).eq("id", card_id);
      }
    });
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)" }}>{t("loading")}</span>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)" }}>Board not found</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <header style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href={`/${locale}/dashboard`}
          aria-label={locale === "es" ? "Volver al inicio" : "Back to dashboard"}
          style={{ color: "var(--color-muted)", fontSize: 18, textDecoration: "none", lineHeight: 1 }}
        >
          ←
        </Link>
        <div style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{board.name}</div>
        {offlineCount > 0 && (
          <span style={{ fontSize: 11, color: "#f59e0b" }}>{offlineCount} {locale === "es" ? "op pendiente" : "pending sync"}</span>
        )}
      </header>

      <PhaseTabs activePhase={activePhase} onChange={setActivePhase} />
      {phaseGate && (
        <PhaseGate
          boardId={boardId}
          phase={activePhase}
          status={phaseGate.status}
          approvedAt={phaseGate.approved_at}
          onStatusChange={(s) => setPhaseGate((g) => g ? { ...g, status: s } : g)}
        />
      )}
      <Board board={board} locale={locale as "en" | "es"} onBoardUpdate={setBoard} />
      <VoiceOrb locale={locale as "en" | "es"} board={board} onBoardUpdate={setBoard} />
    </div>
  );
}
