"use client";

import Link from "next/link";

export default function ProyectoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/panorama" style={{ color: "var(--color-muted)", fontSize: 13, textDecoration: "none" }}>← Panorama</Link>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Proyecto {params.id}</h1>
      <p style={{ color: "var(--color-muted)", fontSize: 13 }}>WBS, cronograma y riesgos — vista detallada próximamente.</p>
    </div>
  );
}
