"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase";
import { emitToSynthia } from "@/lib/synthia-bridge";

type Issue = Database["public"]["Tables"]["issues"]["Row"];

const SEVERITY_COLORS = {
  low:      { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" },
  medium:   { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  high:     { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" },
  critical: { bg: "rgba(220,38,38,0.2)",   text: "#dc2626" },
};

const STATUS_COLORS: Record<string, string> = {
  open:        "#6b7280",
  in_progress: "#3b82f6",
  resolved:    "#10b981",
  closed:      "#6b7280",
};

interface Props {
  issues: Issue[];
  locale: "en" | "es";
  onUpdate: () => void;
}

export function IssueTable({ issues, locale, onUpdate }: Props) {
  const t = useTranslations("issues");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function closeIssue(issue: Issue, resolution: string) {
    const supabase = createClient();
    const field = locale === "es" ? "resolution_es" : "resolution_en";

    await supabase.from("issues").update({
      status: "closed",
      closed_at: new Date().toISOString(),
      [field]: resolution,
    }).eq("id", issue.id);

    onUpdate();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {issues.map((issue) => {
        const isExpanded = expanded === issue.id;
        const sevStyle = SEVERITY_COLORS[issue.severity];
        const desc = locale === "es" ? issue.description_es : issue.description_en;
        const resolution = locale === "es" ? issue.resolution_es : issue.resolution_en;

        return (
          <div
            key={issue.id}
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, overflow: "hidden" }}
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : issue.id)}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: sevStyle.bg, color: sevStyle.text, fontWeight: 700, flexShrink: 0 }}>
                {t(`severity.${issue.severity}`)}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text)", flex: 1, fontWeight: 500 }}>{issue.title}</span>
              <span style={{ fontSize: 11, color: STATUS_COLORS[issue.status], flexShrink: 0 }}>
                {t(`status.${issue.status}`)}
              </span>
            </button>

            {isExpanded && (
              <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--color-border)" }}>
                {desc && (
                  <p style={{ fontSize: 13, color: "var(--color-text)", marginTop: 10, lineHeight: 1.5 }}>{desc}</p>
                )}
                {resolution && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(16,185,129,0.08)", borderRadius: 6, borderLeft: "3px solid #10b981" }}>
                    <div style={{ fontSize: 11, color: "#10b981", marginBottom: 4 }}>{t("resolution")}</div>
                    <p style={{ fontSize: 13, color: "var(--color-text)" }}>{resolution}</p>
                  </div>
                )}
                {issue.status !== "closed" && <CloseIssueInline onClose={(r) => closeIssue(issue, r)} locale={locale} />}
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-muted)" }}>
                  {t("raisedBy")}: <UserName id={issue.raised_by} /> · {new Date(issue.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UserName({ id }: { id: string }) {
  const [name, setName] = useState<string>(id.slice(0, 8) + "…");
  useEffect(() => {
    const supabase = createClient();
    supabase.from("user_profiles").select("display_name").eq("id", id).single().then(({ data }) => {
      if (data?.display_name) setName(data.display_name);
    });
  }, [id]);
  return <span>{name}</span>;
}

function CloseIssueInline({ onClose, locale }: { onClose: (r: string) => void; locale: "en" | "es" }) {
  const [resolution, setResolution] = useState("");
  const t = useTranslations("issues");
  const tc = useTranslations("common");

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
      <input
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder={t("resolution")}
        style={{ flex: 1, background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, padding: "7px 10px", fontSize: 13 }}
      />
      <button
        onClick={() => resolution.trim() && onClose(resolution.trim())}
        style={{ padding: "7px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
      >
        {tc("confirm")}
      </button>
    </div>
  );
}
