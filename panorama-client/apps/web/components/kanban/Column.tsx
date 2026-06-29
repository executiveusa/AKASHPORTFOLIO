"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CardItem } from "./Card";
import { createClient } from "@/lib/supabase";
import type { Phase } from "./PhaseTabs";
import type { Database } from "@/lib/database.types";

type Column = Database["public"]["Tables"]["columns"]["Row"];
type Card = Database["public"]["Tables"]["cards"]["Row"];

interface Props {
  column: Column & { cards: Card[] };
  locale: "en" | "es";
  activePhase?: Phase;
  onCardAdded: (card: Card) => void;
}

export function Column({ column, locale, activePhase, onCardAdded }: Props) {
  const t = useTranslations("kanban");
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const title = locale === "es" ? column.title_es : column.title_en;
  const atWipLimit = column.wip_limit !== null && column.cards.length >= column.wip_limit;
  const [addingCard, setAddingCard] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        column_id: column.id,
        board_id: column.board_id,
        tenant_id: column.tenant_id,
        title: newTitle.trim(),
        description: null,
        priority: "medium",
        labels: [],
        position: column.cards.length,
      })
      .select()
      .single();

    setSaving(false);
    if (!error && card) {
      onCardAdded(card);
      setNewTitle("");
      setAddingCard(false);
    }
  }

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
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)", borderTop: activePhase ? `3px solid var(--phase-${activePhase})` : "none", display: "flex", alignItems: "center", gap: 6 }}>
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

      {/* Add card form */}
      <div style={{ padding: "6px 8px", borderTop: "1px solid var(--color-border)" }}>
        {addingCard ? (
          <form onSubmit={submitCard} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setAddingCard(false); setNewTitle(""); } }}
              placeholder={t("cardTitlePlaceholder")}
              rows={2}
              style={{
                width: "100%",
                background: "var(--color-bg)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-text)",
                borderRadius: 6,
                padding: "8px",
                fontSize: 13,
                resize: "none",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="submit"
                disabled={saving || !newTitle.trim()}
                style={{ flex: 1, padding: "6px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {saving ? "…" : t("addCard")}
              </button>
              <button
                type="button"
                onClick={() => { setAddingCard(false); setNewTitle(""); }}
                style={{ padding: "6px 10px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            disabled={atWipLimit}
            style={{
              width: "100%",
              padding: "7px",
              background: "none",
              border: "none",
              color: atWipLimit ? "var(--color-border)" : "var(--color-muted)",
              fontSize: 12,
              cursor: atWipLimit ? "not-allowed" : "pointer",
              textAlign: "left",
            }}
          >
            + {t("addCard")}
          </button>
        )}
      </div>
    </div>
  );
}
