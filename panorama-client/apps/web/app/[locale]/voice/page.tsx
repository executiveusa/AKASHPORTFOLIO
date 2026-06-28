"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function VoicePage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("voice");
  const isEs = locale === "es";

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>SYNTHIA Voice</div>
        <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
          {isEs ? "Comandos de voz para el tablero" : "Voice commands for the board"}
        </div>
      </header>

      <main style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Activation hint */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "16px" }}>
          <p style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.6 }}>
            {isEs
              ? "Para activar SYNTHIA Voice, abre cualquier tablero y presiona el botón de voz en la esquina inferior derecha."
              : "To activate SYNTHIA Voice, open any board and press the voice button in the bottom-right corner."}
          </p>
        </div>

        {/* Command examples */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "16px" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {isEs ? "Comandos disponibles" : "Available commands"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(t.raw("examples") as string[]).map((ex, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--color-text)", padding: "10px 12px", background: "var(--color-bg)", borderRadius: 6, border: "1px solid var(--color-border)", lineHeight: 1.5 }}>
                &ldquo;{ex}&rdquo;
              </div>
            ))}
          </div>
        </div>

        {/* History placeholder */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "16px" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("commandHistory")}
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {isEs ? "Sin comandos recientes." : "No recent commands."}
          </p>
        </div>
      </main>
    </div>
  );
}
