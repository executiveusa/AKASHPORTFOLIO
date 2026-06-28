"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Board } from "@/components/kanban/Board";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadBoard();
    connectWebSocket();
    flushOfflineQueue();

    return () => wsRef.current?.close();
  }, [boardId]);

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
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{board.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {offlineCount > 0 && (
            <span style={{ fontSize: 11, color: "#f59e0b" }}>{offlineCount} op pendiente</span>
          )}
        </div>
      </header>

      <Board board={board} locale={locale as "en" | "es"} onBoardUpdate={setBoard} />
      <VoiceOrb locale={locale as "en" | "es"} board={board} onBoardUpdate={setBoard} />
    </div>
  );
}
