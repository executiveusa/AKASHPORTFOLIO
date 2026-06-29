"use client";

import { SubPageHeader, UserNav } from "@/components/UserNav";

export default function RiesgosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <SubPageHeader title="Registro de Riesgos" backHref="/panorama" backLabel="←" />
      <main style={{ padding: 16 }}>
        <p style={{ color: "var(--color-muted)", fontSize: 13 }}>Risk register PMBOK — próximamente.</p>
      </main>
      <UserNav />
    </div>
  );
}
