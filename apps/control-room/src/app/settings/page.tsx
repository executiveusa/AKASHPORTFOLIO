"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";

const SECTIONS = [
  { href: "/settings/profile",         icon: "👤", label: "Perfil",          desc: "Nombre, foto y datos de cuenta" },
  { href: "/settings/personalization",  icon: "🎨", label: "Personalización", desc: "Idioma, tema y preferencias de UX" },
  { href: "/settings/integrations",    icon: "🔗", label: "Integraciones",   desc: "Conecta herramientas externas" },
  { href: "/settings/billing",         icon: "💳", label: "Facturación",     desc: "Plan, uso y métodos de pago" },
  { href: "/settings/security",        icon: "🔐", label: "Seguridad",       desc: "Contraseña, 2FA y sesiones activas" },
  { href: "/settings/notifications",   icon: "🔔", label: "Notificaciones",  desc: "Canales y frecuencia de alertas" },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>Ajustes</h1>
        <p style={{ fontSize: 13, color: "#888" }}>Configura tu cuenta y preferencias de Synthia</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
        {SECTIONS.map(s => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 18px", background: "#fff",
              border: "1px solid #e5e3df", borderRadius: 10,
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#0d0d0d")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e3df")}
          >
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0d0d0d" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{s.desc}</div>
            </div>
            <span style={{ fontSize: 16, color: "#bbb" }}>›</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
