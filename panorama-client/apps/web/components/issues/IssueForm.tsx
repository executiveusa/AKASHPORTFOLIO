"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase";
import { emitToSynthia } from "@/lib/synthia-bridge";

type Severity = "low" | "medium" | "high" | "critical";

interface Props {
  locale: "en" | "es";
  onClose: () => void;
  onCreated: () => void;
}

const inputStyle = {
  width: "100%",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: 6,
  padding: "9px 12px",
  fontSize: 13,
  boxSizing: "border-box" as const,
};

export function IssueForm({ locale, onClose, onCreated }: Props) {
  const t = useTranslations("issues");
  const tc = useTranslations("common");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }

    const field_en = locale === "en" ? description : undefined;
    const field_es = locale === "es" ? description : undefined;

    const { data } = await supabase.from("issues").insert({
      title: title.trim(),
      description_en: field_en,
      description_es: field_es,
      severity,
      raised_by: user.user.id,
      status: "open",
      tenant_id: "", // set by RLS / server
    }).select().single();

    if (data && severity === "critical") {
      void emitToSynthia({
        kind: "panorama.issue.raised",
        tenant_id: data.tenant_id,
        issue_id: data.id,
        severity: "critical",
      });
    }

    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={t("raise")} onKeyDown={(e) => e.key === "Escape" && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 200 }} onClick={onClose}>
      <div style={{ width: "100%", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderRadius: "16px 16px 0 0", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t("raise")}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>{t("title")} *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title")} style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>{t("description")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 6 }}>{t("severity.label")}</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["low", "medium", "high", "critical"] as Severity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  style={{
                    flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600,
                    border: `1px solid ${severity === s ? "var(--color-accent)" : "var(--color-border)"}`,
                    background: severity === s ? "rgba(124,58,237,0.15)" : "transparent",
                    color: severity === s ? "var(--color-accent)" : "var(--color-muted)",
                    borderRadius: 6, cursor: "pointer",
                  }}
                >
                  {t(`severity.${s}`)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 12, background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
              {tc("cancel")}
            </button>
            <button
              onClick={submit}
              disabled={saving || !title.trim()}
              style={{ flex: 1, padding: 12, background: title.trim() ? "var(--color-accent)" : "var(--color-border)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              {saving ? tc("loading") : tc("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
