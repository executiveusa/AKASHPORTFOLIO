"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { emitToSynthia } from "@/lib/synthia-bridge";
import type { Database } from "@/lib/database.types";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

const STATUS_CONFIG = {
  not_started: { color: "#6b7280", emoji: "○" },
  in_progress: { color: "#3b82f6", emoji: "◑" },
  completed:   { color: "#10b981", emoji: "●" },
  at_risk:     { color: "#ef4444", emoji: "⚠" },
};

export default function GoalsPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("goals");
  const tc = useTranslations("common");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    const supabase = createClient();
    const { data } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    const g = data ?? [];

    // Emit celebration for newly completed goals
    for (const goal of g) {
      if (goal.status === "completed" && goal.percent_complete === 100) {
        const title = (locale === "es" ? goal.title_es : goal.title_en) ?? goal.title_en;
        void emitToSynthia({ kind: "panorama.goal.completed", tenant_id: goal.tenant_id, goal_id: goal.id, title });
      }
    }

    setGoals(g);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)" }}>{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{t("milestones")}</div>
      </header>

      <main style={{ padding: 16 }}>
        {goals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 14 }}>Sin metas definidas</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {goals.map((goal) => <GoalCard key={goal.id} goal={goal} locale={locale as "en" | "es"} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function GoalCard({ goal, locale }: { goal: Goal; locale: "en" | "es" }) {
  const t = useTranslations("goals");
  const title = (locale === "es" ? goal.title_es : null) ?? goal.title_en;
  const cfg = STATUS_CONFIG[goal.status];
  const isAtRisk = goal.status === "at_risk";
  const isComplete = goal.status === "completed";

  return (
    <div style={{ background: "var(--color-surface)", border: `1px solid ${isAtRisk ? "rgba(239,68,68,0.4)" : isComplete ? "rgba(16,185,129,0.4)" : "var(--color-border)"}`, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ color: cfg.color, fontSize: 16 }}>{cfg.emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{title}</span>
        {isAtRisk && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 700 }}>
            {t("status.at_risk")}
          </span>
        )}
        {isComplete && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
            {t("status.completed")}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "var(--color-border)", borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${goal.percent_complete}%`, background: isComplete ? "#10b981" : isAtRisk ? "#ef4444" : "var(--color-accent)", borderRadius: 3, transition: "width 600ms ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-muted)" }}>
        <span>{goal.percent_complete}%</span>
        {goal.target_date && <span>→ {new Date(goal.target_date).toLocaleDateString()}</span>}
        <span>{goal.linked_cards.length} tareas</span>
      </div>

      {isComplete && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#10b981", textAlign: "center" }}>{t("celebration")}</div>
      )}
    </div>
  );
}
