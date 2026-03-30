"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterTag = "Destacados" | "Negocios" | "Proyectos" | "Finanzas" | "Social";

interface Case {
  id: string;
  icon: string;
  title: string;
  description: string;
  result: string;
  tags: FilterTag[];
  sphere: string;
  sphereColor: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CASES: Case[] = [
  {
    id: "c1",
    icon: "🚲",
    title: "Fundraiser Bicicleta $50K",
    description: "Ivette necesitaba recaudar fondos para apoyar a la familia de John Schneider (Bekins NW). Synthia diseñó la estrategia de outreach, redactó los mensajes y coordinó el seguimiento.",
    result: "$50,000 MXN recaudados en 12 días. 23 donantes, 100% a la familia.",
    tags: ["Destacados", "Negocios", "Finanzas"],
    sphere: "CAZADORA",
    sphereColor: "#ef4444",
  },
  {
    id: "c2",
    icon: "📁",
    title: "Indigo Azul Archivo 5 años",
    description: "5 años de contenido disperso en Google Drive, Dropbox y discos duros. Synthia creó la taxonomía, renombró 3,400+ archivos y generó el índice maestro.",
    result: "Archivo maestro organizado. Tiempo de búsqueda: de 20 min → 30 seg.",
    tags: ["Destacados", "Proyectos"],
    sphere: "FORJADORA",
    sphereColor: "#22c55e",
  },
  {
    id: "c3",
    icon: "🎬",
    title: "Culture Shock Temporada 1",
    description: "Lanzamiento del podcast sin presupuesto de marketing. Synthia elaboró el plan de contenido, calendario editorial y estrategia de distribución para 12 episodios.",
    result: "Plan completo en 4 horas. Calendario 3 meses. 4 plataformas cubiertas.",
    tags: ["Destacados", "Social", "Proyectos"],
    sphere: "DRA. CULTURA",
    sphereColor: "#f43f5e",
  },
  {
    id: "c4",
    icon: "⚙️",
    title: "Worker System Design",
    description: "Diseño de un sistema de workers para procesamiento paralelo de tareas. Synthia produjo 6 documentos técnicos (70KB total) con arquitectura, API specs y diagramas.",
    result: "6 archivos, 70KB de documentación técnica. Arquitectura lista para implementar.",
    tags: ["Proyectos", "Negocios"],
    sphere: "ING. TEKNOS",
    sphereColor: "#06b6d4",
  },
  {
    id: "c5",
    icon: "💰",
    title: "Análisis Financiero Q1 2026",
    description: "Consolidación de ingresos de 5 fuentes: Stripe, MercadoPago, Creem, pagos directos SPEI y efectivo. Categorización para SAT México e IRS USA simultánea.",
    result: "Reporte dual-jurisdicción en 45 minutos. Listo para contador.",
    tags: ["Finanzas", "Destacados"],
    sphere: "DR. ECONOMÍA",
    sphereColor: "#f97316",
  },
  {
    id: "c6",
    icon: "📊",
    title: "RACI Matrix Equipo Kupuri",
    description: "El equipo había crecido a 8 personas + 9 agentes y nadie sabía quién era responsable de qué. Synthia entrevistó stakeholders y generó la matriz RACI completa.",
    result: "RACI de 17 roles × 23 procesos. Cero ambigüedades en toma de decisiones.",
    tags: ["Proyectos", "Negocios"],
    sphere: "ALEX",
    sphereColor: "#d4af37",
  },
];

const FILTERS: FilterTag[] = ["Destacados", "Negocios", "Proyectos", "Finanzas", "Social"];

// ─── Components ───────────────────────────────────────────────────────────────

function CaseCard({ caso }: { caso: Case }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {caso.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 3, lineHeight: 1.3 }}>{caso.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: caso.sphereColor, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{caso.sphere}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6, marginBottom: 10 }}>{caso.description}</p>
      <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "8px 12px" }}>
        <div style={{ fontSize: 10, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Resultado</div>
        <div style={{ fontSize: 12, color: "var(--color-text)", fontWeight: 500 }}>{caso.result}</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CasosPage() {
  const [filter, setFilter] = useState<FilterTag>("Destacados");

  const filtered = CASES.filter((c) => c.tags.includes(filter));

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Galería de Casos</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Lo que Synthia ha hecho por clientes reales</div>
      </header>

      <main style={{ padding: 16 }}>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: `1px solid ${filter === f ? "var(--color-accent)" : "var(--color-border)"}`,
                background: filter === f ? "var(--color-accent)20" : "transparent",
                color: filter === f ? "var(--color-accent)" : "var(--color-muted)",
                fontSize: 12,
                fontWeight: filter === f ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{ background: "var(--color-surface)", border: `1px solid var(--color-gold)20`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>¿Quieres que Synthia trabaje para ti?</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Desde $3,000 MXN/mes</div>
          </div>
          <Link href="/chat" style={{ fontSize: 12, padding: "7px 14px", background: "var(--color-accent)", color: "#fff", borderRadius: 7, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Hablar con Synthia
          </Link>
        </div>

        {/* Cases */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--color-muted)", padding: 32, fontSize: 13 }}>Sin casos en esta categoría aún.</div>
        ) : (
          filtered.map((c) => <CaseCard key={c.id} caso={c} />)
        )}
      </main>
    </div>
  );
}
