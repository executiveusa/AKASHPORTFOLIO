"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "iniciacion" | "planificacion" | "ejecucion" | "cierre";

interface Project {
  id: string;
  name: string;
  phase: Phase;
  progress: number;
  sponsor: string;
  dueDate?: string;
  riskLevel: "low" | "medium" | "high";
}

interface PMDecision {
  pmbok_rule: string;
  why_it_matters: string;
  options: { label: string; outcome: string }[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  { id: "p1", name: "Culture Shock T1",   phase: "ejecucion",    progress: 65, sponsor: "Ivette", riskLevel: "medium", dueDate: "Abr 15" },
  { id: "p2", name: "Indigo Azul Archivo", phase: "planificacion", progress: 30, sponsor: "Ivette", riskLevel: "low",    dueDate: "May 1" },
  { id: "p3", name: "Fundraiser Bicicleta",phase: "cierre",       progress: 90, sponsor: "Ivette", riskLevel: "low",    dueDate: "Mar 31" },
  { id: "p4", name: "Worker System v2",    phase: "iniciacion",   progress: 10, sponsor: "Synthia", riskLevel: "high",  dueDate: "Jun 1" },
];

const TEACHER_TIP: PMDecision = {
  pmbok_rule: "PMBOK 7 · Principio 2 — Stewardship",
  why_it_matters: "El equipo que protege el proyecto protege el valor del cliente.",
  options: [
    { label: "(A) Revisar riesgos ahora",  outcome: "Prevenir bloqueos esta semana" },
    { label: "(B) Actualizar el WBS",       outcome: "Claridad en el scope" },
    { label: "(C) Ver ejemplo de proyecto", outcome: "Aprender de un caso real" },
  ],
};

const PHASES: { id: Phase; label: string; color: string }[] = [
  { id: "iniciacion",    label: "Iniciación",    color: "#8b5cf6" },
  { id: "planificacion", label: "Planificación",  color: "#d4af37" },
  { id: "ejecucion",     label: "Ejecución",      color: "#22c55e" },
  { id: "cierre",        label: "Cierre",         color: "#06b6d4" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: Project["riskLevel"] }) {
  const map = { low: ["#22c55e20", "#22c55e", "Bajo"], medium: ["#f59e0b20", "#f59e0b", "Medio"], high: ["#ef444420", "#ef4444", "Alto"] } as const;
  const [bg, col, txt] = map[level];
  return (
    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: bg, color: col, fontWeight: 600 }}>{txt}</span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/panorama/proyecto/${project.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "12px 14px", marginBottom: 6, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{project.name}</span>
          <RiskBadge level={project.riskLevel} />
        </div>
        <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: "100%", background: "var(--color-accent)", borderRadius: 2, width: `${project.progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-muted)" }}>
          <span>{project.sponsor}</span>
          {project.dueDate && <span>→ {project.dueDate}</span>}
        </div>
      </div>
    </Link>
  );
}

function TeacherBox({ tip, onAsk }: { tip: PMDecision; onAsk: () => void }) {
  return (
    <div style={{ background: "var(--color-surface)", border: `1px solid var(--color-gold)`, borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontStyle: "italic", color: "var(--color-gold)", marginBottom: 6 }}>{tip.pmbok_rule}</div>
      <div style={{ fontSize: 13, color: "var(--color-text)", marginBottom: 12, lineHeight: 1.5 }}>
        El Panorama sugiere: {tip.why_it_matters}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tip.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => {}}
            style={{ fontSize: 12, padding: "6px 12px", background: "var(--color-border)", color: "var(--color-text)", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={onAsk}
          style={{ fontSize: 12, padding: "6px 12px", background: "transparent", color: "var(--color-accent)", border: `1px solid var(--color-accent)`, borderRadius: 6, cursor: "pointer" }}
        >
          Tengo una pregunta
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PanoramaPage() {
  const [askOpen, setAskOpen] = useState(false);

  const grouped = PHASES.map((ph) => ({
    ...ph,
    projects: SEED_PROJECTS.filter((p) => p.phase === ph.id),
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      {/* Header */}
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>El Panorama™</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>Gestión de proyectos · PMBOK 7</div>
        </div>
        <Link
          href="/panorama/proyecto/nuevo"
          style={{ padding: "8px 14px", background: "var(--color-accent)", color: "#fff", borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          + Nuevo
        </Link>
      </header>

      <main style={{ padding: 16 }}>
        {/* PMBOK Teacher */}
        <TeacherBox tip={TEACHER_TIP} onAsk={() => setAskOpen(true)} />

        {/* Quick links */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { href: "/panorama/equipo",  label: "Equipo RACI" },
            { href: "/panorama/riesgos", label: "Riesgos" },
            { href: "/panorama/gastos",  label: "Gastos" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-muted)", borderRadius: 6, fontSize: 12, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* PMBOK Kanban — 4 phases */}
        {grouped.map((ph) => (
          <section key={ph.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: ph.color, display: "inline-block" }} />
              <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {ph.label}
              </h2>
              <span style={{ fontSize: 11, color: "var(--color-muted)" }}>({ph.projects.length})</span>
            </div>
            {ph.projects.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--color-muted)", padding: "10px 14px", background: "var(--color-surface)", border: "1px dashed var(--color-border)", borderRadius: 8, textAlign: "center" }}>
                Sin proyectos
              </div>
            ) : (
              ph.projects.map((p) => <ProjectCard key={p.id} project={p} />)
            )}
          </section>
        ))}
      </main>

      {/* Ask modal */}
      {askOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setAskOpen(false)}>
          <div style={{ width: "100%", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderRadius: "16px 16px 0 0", padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>¿Tienes una pregunta?</h3>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>Escríbela en el chat y Synthia te enseña la teoría PMBOK.</p>
            <Link href="/chat" style={{ display: "block", textAlign: "center", padding: "12px", background: "var(--color-accent)", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Abrir Chat con Synthia
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
