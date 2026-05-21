"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

export default function SecuritySettingsPage() {
  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 8 }}>Seguridad</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
        Gestiona tu contraseña, autenticación de dos factores y sesiones activas.
      </p>

      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Cambiar contraseña",       desc: "Actualiza tu contraseña de acceso", action: "Cambiar" },
          { label: "Autenticación 2FA",         desc: "Añade una capa extra de seguridad",  action: "Configurar" },
          { label: "Sesiones activas",          desc: "Ver y cerrar dispositivos conectados", action: "Ver sesiones" },
          { label: "Claves API",                desc: "Genera y revoca claves de API",       action: "Gestionar" },
        ].map(item => (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px", background: "#fff", border: "1px solid #e5e3df", borderRadius: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{item.desc}</div>
            </div>
            <button style={{
              padding: "7px 14px", borderRadius: 6, border: "1px solid #e5e3df",
              background: "#fff", color: "#555", fontSize: 12, cursor: "pointer",
            }}>
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
