"use client";

import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { IntegrationsGrid } from "@/components/synthia/IntegrationsGrid";

export default function IntegrationsSettingsPage() {
  return (
    <AppShell>
      <Link href="/settings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
        ← Ajustes
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d0d0d", marginBottom: 8 }}>Integraciones</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
        Conecta tus herramientas favoritas para que Synthia pueda actuar en tu nombre.
      </p>
      <IntegrationsGrid />
    </AppShell>
  );
}
