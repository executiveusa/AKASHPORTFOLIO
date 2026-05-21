"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { useState } from "react";

const LOCALES = [
  { id: "es-MX", label: "Español (México)" },
  { id: "es-PR", label: "Español (Puerto Rico)" },
  { id: "es-ES", label: "Español (España)" },
  { id: "en-US", label: "English (US)" },
];

export default function PersonalizationPage() {
  const [locale, setLocale] = useState("es-MX");
  const [defaultAgent, setDefaultAgent] = useState("synthia");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 24 }}>Personalización</h1>

      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Idioma</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {LOCALES.map(l => (
              <button
                key={l.id}
                onClick={() => setLocale(l.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 14px", border: "2px solid",
                  borderColor: locale === l.id ? "#0d0d0d" : "#e5e3df",
                  borderRadius: 8, background: "#fff", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 13 }}>{l.label}</span>
                {locale === l.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Agente predeterminado</div>
          {["synthia", "alex", "cazadora", "forjadora"].map(a => (
            <button
              key={a}
              onClick={() => setDefaultAgent(a)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", marginRight: 6, marginBottom: 6,
                border: "1px solid", borderRadius: 8, cursor: "pointer",
                borderColor: defaultAgent === a ? "#0d0d0d" : "#e5e3df",
                background: defaultAgent === a ? "#0d0d0d" : "#fff",
                color: defaultAgent === a ? "#fff" : "#555",
                fontSize: 12, textTransform: "capitalize",
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <button
          onClick={save}
          style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
        >
          {saved ? "✓ Guardado" : "Guardar preferencias"}
        </button>
      </div>
    </AppShell>
  );
}
