"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Column } from "./Column";
import { CardItem } from "./Card";
import { PresenceBar } from "./PresenceBar";
import { createClient } from "@/lib/supabase";
import { enqueue } from "@/lib/offline-queue";
import type { BoardData } from "@/app/[locale]/kanban/[boardId]/page";
import type { Database } from "@/lib/database.types";

type Card = Database["public"]["Tables"]["cards"]["Row"];

interface Props {
  board: BoardData;
  locale: "en" | "es";
  onBoardUpdate: (board: BoardData) => void;
}

export function Board({ board, locale, onBoardUpdate }: Props) {
  const t = useTranslations("kanban");
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const card = board.columns
      .flatMap((c) => c.cards)
      .find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const sourceCol = board.columns.find((c) =>
      c.cards.some((card) => card.id === active.id)
    );
    const targetColId = String(over.id);
    const targetCol = board.columns.find((c) => c.id === targetColId);

    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) return;

    // WIP check
    if (targetCol.wip_limit !== null && targetCol.cards.length >= targetCol.wip_limit) {
      alert(t("wipLimit", { limit: targetCol.wip_limit }));
      return;
    }

    const newPosition = targetCol.cards.length;

    // Optimistic update
    const updated: BoardData = {
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === sourceCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
        }
        if (col.id === targetCol.id) {
          const movedCard = sourceCol.cards.find((c) => c.id === active.id)!;
          return {
            ...col,
            cards: [...col.cards, { ...movedCard, column_id: targetColId, position: newPosition }],
          };
        }
        return col;
      }),
    };
    onBoardUpdate(updated);

    // Persist via Rust API
    const apiUrl = process.env.NEXT_PUBLIC_PANORAMA_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/v1/cards/${active.id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_column_id: targetColId, position: newPosition }),
      });

      if (!res.ok) {
        // Rollback
        onBoardUpdate(board);
      }
    } catch {
      // Offline — queue it
      await enqueue({
        type: "move_card",
        payload: { card_id: String(active.id), column_id: targetColId, position: newPosition },
      });
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <PresenceBar boardId={board.id} />

      <div style={{ display: "flex", gap: 12, padding: "12px 16px", overflowX: "auto", minHeight: "calc(100vh - 100px)" }}>
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            locale={locale}
            onCardAdded={(card) => {
              onBoardUpdate({
                ...board,
                columns: board.columns.map((c) =>
                  c.id === col.id ? { ...c, cards: [...c.cards, card] } : c
                ),
              });
            }}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} locale={locale} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
