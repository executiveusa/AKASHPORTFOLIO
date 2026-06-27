"use client";

import { useTranslations } from "next-intl";
import type { VoiceIntent } from "@/lib/voice-commands";

interface Props {
  intent: VoiceIntent;
  locale: "en" | "es";
  onDismiss: () => void;
}

export function CommandBubble({ intent, locale, onDismiss }: Props) {
  const t = useTranslations("voice");

  const isUnknown = intent.action.kind === "unknown" || intent.confidence < 0.7;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 92,
        right: 16,
        left: 16,
        background: "var(--color-surface)",
        border: `1px solid ${isUnknown ? "#f59e0b" : "var(--color-accent)"}`,
        borderRadius: 10,
        padding: "12px 14px",
        zIndex: 99,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>
        &ldquo;{intent.raw}&rdquo;
      </div>

      {isUnknown ? (
        <div style={{ fontSize: 13, color: "#f59e0b" }}>{t("unknown")}</div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "var(--color-text)" }}>
            {describeAction(intent, locale)}
          </div>
          <span style={{ fontSize: 11, color: "var(--color-accent)", marginLeft: 8 }}>
            {t("confidence", { pct: Math.round(intent.confidence * 100) })}
          </span>
        </div>
      )}

      <button
        onClick={onDismiss}
        style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: 14 }}
      >
        ✕
      </button>
    </div>
  );
}

function describeAction(intent: VoiceIntent, locale: "en" | "es"): string {
  const a = intent.action;
  if (a.kind === "move_card") {
    return locale === "es"
      ? `Mover "${a.target}" → ${a.to_column}`
      : `Move "${a.target}" → ${a.to_column}`;
  }
  if (a.kind === "add_issue") {
    return locale === "es" ? `Nuevo issue: ${a.title}` : `New issue: ${a.title}`;
  }
  if (a.kind === "filter_by") {
    return locale === "es" ? `Filtrar: ${a.filter}` : `Filter: ${a.filter}`;
  }
  return intent.raw;
}
