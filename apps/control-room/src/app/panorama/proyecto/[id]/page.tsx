"use client";

import { SubPageHeader, UserNav } from "@/components/UserNav";

export default function ProyectoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <SubPageHeader title={`Proyecto ${params.id}`} backHref="/panorama" backLabel="←" />
      <main style={{ padding: 16 }}>
        <p style={{ color: "var(--color-muted)", fontSize: 13 }}>WBS, cronograma y riesgos — vista detallada próximamente.</p>
      </main>
      <UserNav />
    </div>
  );
}
