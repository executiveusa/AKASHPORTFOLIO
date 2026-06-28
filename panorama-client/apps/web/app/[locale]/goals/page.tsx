"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { emitToSynthia } from "@/lib/synthia-bridge";
import { useSessionStore } from "@/lib/session-store";
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title_en: "", title_es: "", target_date: "" });
  const [saving, setSaving] = useState(false);
  const { tenantId, loadProfile } = useSessionStore();

  useEffect(() => {
    if (!tenantId) loadProfile();
    loadGoals();
  }, []);

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

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title_en.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("goals").insert({
      tenant_id: tenantId ?? "",
      title_en: form.title_en,
      title_es: form.title_es || form.title_en,
      target_date: form.target_date || null,
      linked_cards: [],
      percent_complete: 0,
      status: "not_started",
    });
    setSaving(false);
    setShowForm(false);
    setForm({ title_en: "", title_es: "", target_date: "" });
    loadGoals();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--color-muted)" }}>{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{t("milestones")}</div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 14px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + {t("createGoal")}
        </button>
      </header>

      {showForm && (
        <form onSubmit={createGoal} style={{ padding: 16, borderBottom: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>{t("titleEn")} *</label>
              <input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} required style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, padding: "9px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>{t("titleEs")}</label>
              <input value={form.title_es} onChange={(e) => setForm((f) => ({ ...f, title_es: e.target.value }))} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, padding: "9px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>{t("targetDate")}</label>
              <input type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, padding: "9px 12px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{ padding: "9px 18px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "…" : tc("save")}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 14px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
              {tc("cancel")}
            </button>
          </div>
        </form>
      )}

      <main style={{ padding: 16 }}>
        {goals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 14 }}>{locale === "es" ? "Sin metas definidas" : "No goals defined yet"}</p>
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
        <span>{goal.linked_cards.length} {t("linkedCards").toLowerCase()}</span>
      </div>

      {isComplete && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#10b981", textAlign: "center" }}>{t("celebration")}</div>
      )}
    </div>
  );
}
