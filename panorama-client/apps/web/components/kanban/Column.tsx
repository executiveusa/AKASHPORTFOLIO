"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { CardItem } from "./Card";
import type { Database } from "@/lib/database.types";

type Column = Database["public"]["Tables"]["columns"]["Row"];
type Card = Database["public"]["Tables"]["cards"]["Row"];

interface Props {
  column: Column & { cards: Card[] };
  locale: "en" | "es";
}

export function Column({ column, locale }: Props) {
  const t = useTranslations("kanban");
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const title = locale === "es" ? column.title_es : column.title_en;
  const atWipLimit = column.wip_limit !== null && column.cards.length >= column.wip_limit;

  return (
    <div
      style={{
        minWidth: 260,
        maxWidth: 300,
        flexShrink: 0,
        background: isOver ? "rgba(124,58,237,0.06)" : "var(--color-surface)",
        border: `1px solid ${isOver ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: 8,
        transition: "border-color 150ms, background 150ms",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column header */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", flex: 1 }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: atWipLimit ? "#ef4444" : "var(--color-muted)", fontWeight: atWipLimit ? 700 : 400 }}>
          {column.cards.length}{column.wip_limit ? `/${column.wip_limit}` : ""}
        </span>
      </div>

      {/* WIP warning */}
      {atWipLimit && (
        <div style={{ padding: "6px 12px", fontSize: 11, color: "#ef4444", background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
          {t("wipLimit", { limit: column.wip_limit })}
        </div>
      )}

      {/* Cards */}
      <div ref={setNodeRef} style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--color-muted)", textAlign: "center", padding: "16px 8px", border: "1px dashed var(--color-border)", borderRadius: 6 }}>
              {t("noCards")}
            </div>
          ) : (
            column.cards.map((card) => <CardItem key={card.id} card={card} locale={locale} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
