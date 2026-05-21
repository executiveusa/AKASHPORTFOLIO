"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { useState } from "react";

const PREFS = [
  { id: "task-complete",    label: "Tarea completada",     desc: "Cuando un agente termina una tarea" },
  { id: "task-failed",      label: "Tarea fallida",        desc: "Cuando una tarea necesita atención" },
  { id: "suggestion",       label: "Nueva sugerencia",     desc: "Cuando Synthia aprende algo nuevo" },
  { id: "billing-alert",    label: "Alerta de uso",        desc: "Cuando te acercas al límite del plan" },
  { id: "team-invite",      label: "Invitación de equipo", desc: "Cuando alguien te invita a un workspace" },
  { id: "weekly-summary",   label: "Resumen semanal",      desc: "Resumen de actividad cada lunes" },
];

export default function NotificationsSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map(p => [p.id, true]))
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setEnabled(e => ({ ...e, [id]: !e[id] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 8 }}>Notificaciones</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
        Controla qué alertas recibes y con qué frecuencia.
      </p>

      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 8 }}>
        {PREFS.map(p => (
          <div
            key={p.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", background: "#fff", border: "1px solid #e5e3df", borderRadius: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{p.desc}</div>
            </div>
            <button
              onClick={() => toggle(p.id)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                background: enabled[p.id] ? "#0d0d0d" : "#e5e3df",
                position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                left: enabled[p.id] ? 22 : 2,
              }} />
            </button>
          </div>
        ))}

        <button
          onClick={save}
          style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start", marginTop: 8 }}
        >
          {saved ? "✓ Guardado" : "Guardar preferencias"}
        </button>
      </div>
    </AppShell>
  );
}
