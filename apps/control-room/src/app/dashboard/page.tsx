"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Metric {
  label: string;
  value: string;
  sub?: string;
  status?: "ok" | "warn" | "error";
}

interface SphereStatus {
  id: string;
  name: string;
  role: string;
  color: string;
  status: "active" | "standby" | "error";
  task?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SPHERES_DEFAULT: SphereStatus[] = [
  { id: "synthia",   name: "SYNTHIA",      role: "Coordinadora",  color: "#8b5cf6", status: "standby" },
  { id: "alex",      name: "ALEX",         role: "Estratega",     color: "#d4af37", status: "standby" },
  { id: "cazadora",  name: "CAZADORA",     role: "Oportunidades", color: "#ef4444", status: "standby" },
  { id: "forjadora", name: "FORJADORA",    role: "Arquitecta",    color: "#22c55e", status: "standby" },
  { id: "seductora", name: "SEDUCTORA",    role: "Closera",       color: "#eab308", status: "standby" },
  { id: "consejo",   name: "CONSEJO",      role: "Consejero",     color: "#1d4ed8", status: "standby" },
  { id: "economia",  name: "DR. ECONOMÍA", role: "Finanzas",      color: "#f97316", status: "standby" },
  { id: "cultura",   name: "DRA. CULTURA", role: "Cultura",       color: "#f43f5e", status: "standby" },
  { id: "teknos",    name: "ING. TEKNOS",  role: "Ingeniería",    color: "#06b6d4", status: "standby" },
];

const NAV_ITEMS = [
  { href: "/dashboard",       label: "Inicio",   icon: "⊡" },
  { href: "/panorama",        label: "Panorama", icon: "◎" },
  { href: "/cockpit/tasks",   label: "Tareas",   icon: "✦" },
  { href: "/panorama/gastos", label: "Gastos",   icon: "₿" },
  { href: "/cockpit",         label: "Más",      icon: "⋯" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "ok" | "active" | "standby" | "warn" | "error" }) {
  const c: Record<string, string> = {
    ok: "#22c55e", active: "#22c55e", warn: "#f59e0b", standby: "#6b6b85", error: "#ef4444",
  };
  return (
    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", backgroundColor: c[status] ?? "#6b6b85", flexShrink: 0 }} />
  );
}

function MetricCard({ label, value, sub, status }: Metric) {
  const accent = status === "error" ? "#ef4444" : status === "warn" ? "#f59e0b" : "#8b5cf6";
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderLeft: `3px solid ${accent}`, borderRadius: 8, padding: "14px 16px", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SphereChip({ sphere }: { sphere: SphereStatus }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "8px 12px", minWidth: 0 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: sphere.color, flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>{sphere.name}</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {sphere.task ?? sphere.role}
        </div>
      </div>
      <StatusDot status={sphere.status} />
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.href;
        return (
          <Link key={item.href} href={item.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 4px", color: isActive ? "var(--color-accent)" : "var(--color-muted)", fontSize: 9, fontWeight: isActive ? 600 : 400, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Ingresos hoy",       value: "—", sub: "MXN" },
    { label: "Tareas completadas", value: "—", sub: "hoy" },
    { label: "Agentes activos",    value: "—", sub: "de 9" },
    { label: "Costo API",          value: "—", sub: "USD hoy", status: "ok" },
  ]);
  const [spheres, setSpheres] = useState<SphereStatus[]>(SPHERES_DEFAULT);

  useEffect(() => {
    async function loadData() {
      // Revenue
      try {
        const r = await fetch("/api/revenue");
        if (r.ok) {
          const d = await r.json();
          const usd = d?.snapshot?.todayUsd ?? 0;
          const mxn = (usd * 17.5).toLocaleString("es-MX", { maximumFractionDigits: 0 });
          setMetrics((m) => { const u = [...m]; u[0] = { ...u[0], value: `$${mxn}`, status: "ok" }; return u; });
        }
      } catch {}

      // API cost
      try {
        const t = await fetch("/api/telemetry?view=budget");
        if (t.ok) {
          const d = await t.json();
          const spent = d?.today_usd ?? d?.budget?.today_usd ?? 0;
          const limit = d?.daily_limit_usd ?? 50;
          const pct = Math.round((spent / limit) * 100);
          setMetrics((m) => {
            const u = [...m];
            u[3] = { ...u[3], value: `$${(spent as number).toFixed(2)}`, sub: `${pct}% del límite`, status: pct > 80 ? "error" : pct > 60 ? "warn" : "ok" };
            return u;
          });
        }
      } catch {}

      // Spheres
      try {
        const s = await fetch("/api/spheres/status");
        if (s.ok) {
          const d = await s.json();
          if (Array.isArray(d?.spheres)) {
            const active = d.spheres.filter((x: SphereStatus) => x.status === "active").length;
            setSpheres(d.spheres);
            setMetrics((m) => { const u = [...m]; u[2] = { ...u[2], value: String(active), status: active > 0 ? "ok" : "warn" }; return u; });
          }
        }
      } catch {}
    }

    loadData();
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      {/* Header */}
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Synthia 3.0</div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>Kupuri Media · CDMX</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot status="ok" />
          <span style={{ fontSize: 11, color: "var(--color-muted)" }}>activo</span>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {/* 4 metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        {/* Esferas */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Esferas activas
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {spheres.map((s) => <SphereChip key={s.id} sphere={s} />)}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Acciones rápidas
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/chat" style={{ flex: 1, display: "block", textAlign: "center", padding: "10px 8px", background: "var(--color-accent)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              + Tarea
            </Link>
            <Link href="/panorama" style={{ flex: 1, display: "block", textAlign: "center", padding: "10px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
              Panorama
            </Link>
            <Link href="/panorama/gastos" style={{ flex: 1, display: "block", textAlign: "center", padding: "10px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
              Gastos
            </Link>
          </div>
        </section>
      </main>

      <BottomNav active="/dashboard" />
    </div>
  );
}
