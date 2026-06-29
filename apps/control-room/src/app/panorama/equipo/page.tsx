"use client";

import { SubPageHeader, UserNav } from "@/components/UserNav";

export default function EquipoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <SubPageHeader title="Equipo RACI" backHref="/panorama" backLabel="←" />
      <main style={{ padding: 16 }}>
        <p style={{ color: "var(--color-muted)", fontSize: 13 }}>Matriz de responsabilidades — próximamente.</p>
      </main>
      <UserNav />
    </div>
  );
}
