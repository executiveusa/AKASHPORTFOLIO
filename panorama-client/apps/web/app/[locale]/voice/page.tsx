"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function VoicePage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("voice");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>SYNTHIA Voice</h1>
      <p style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 24 }}>{t("commandHistory")}</p>

      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "16px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--color-muted)" }}>
          {locale === "es" ? "Comandos disponibles" : "Available commands"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(t.raw("examples") as string[]).map((ex, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--color-text)", padding: "8px 12px", background: "var(--color-bg)", borderRadius: 6, border: "1px solid var(--color-border)" }}>
              &ldquo;{ex}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
