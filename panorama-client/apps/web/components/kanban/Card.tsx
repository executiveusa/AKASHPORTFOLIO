"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import type { Database } from "@/lib/database.types";

type Card = Database["public"]["Tables"]["cards"]["Row"];

const PRIORITY_COLORS = {
  low:      { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" },
  medium:   { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  high:     { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" },
  critical: { bg: "rgba(220,38,38,0.2)",   text: "#dc2626" },
};

interface Props {
  card: Card;
  locale: "en" | "es";
  isDragging?: boolean;
}

export function CardItem({ card, locale, isDragging = false }: Props) {
  const t = useTranslations("kanban");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0 : 1,
  };

  const priorityStyle = PRIORITY_COLORS[card.priority];
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? "var(--color-accent)" : "var(--color-bg)",
        border: `1px solid ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: 6,
        padding: "10px 12px",
        cursor: "grab",
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", marginBottom: 6, lineHeight: 1.4 }}>
        {card.title}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: priorityStyle.bg, color: priorityStyle.text, fontWeight: 600 }}>
          {t(`priority.${card.priority}`)}
        </span>

        {card.due_date && (
          <span style={{ fontSize: 10, color: isOverdue ? "#ef4444" : "var(--color-muted)" }}>
            → {new Date(card.due_date).toLocaleDateString()}
            {isOverdue && " ⚠"}
          </span>
        )}

        {card.labels.length > 0 && card.labels.slice(0, 2).map((label) => (
          <span key={label} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--color-border)", color: "var(--color-muted)" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
