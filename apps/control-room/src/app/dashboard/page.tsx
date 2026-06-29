"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserNav } from "@/components/UserNav";

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
  { id: "synthia",   name: "SYNTHIA",      role: "Tu coordinadora",    color: "#8b5cf6", status: "standby" },
  { id: "alex",      name: "ALEX",         role: "Tu estratega",       color: "#d4af37", status: "standby" },
  { id: "cazadora",  name: "CAZADORA",     role: "Trae oportunidades", color: "#ef4444", status: "standby" },
  { id: "forjadora", name: "FORJADORA",    role: "Construye tu visión",color: "#22c55e", status: "standby" },
  { id: "seductora", name: "SEDUCTORA",    role: "Cierra los deals",   color: "#eab308", status: "standby" },
  { id: "consejo",   name: "CONSEJO",      role: "Tu board privado",   color: "#1d4ed8", status: "standby" },
  { id: "economia",  name: "DR. ECONOMÍA", role: "Cuida tu dinero",    color: "#f97316", status: "standby" },
  { id: "cultura",   name: "DRA. CULTURA", role: "Alimenta tu mente",  color: "#f43f5e", status: "standby" },
  { id: "teknos",    name: "ING. TEKNOS",  role: "Tu ingeniero",       color: "#06b6d4", status: "standby" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Ingresos hoy",  value: "$0", sub: "MXN" },
    { label: "Tareas hechas", value: "0",  sub: "hoy" },
    { label: "Equipo activo", value: "0",  sub: "de 9 agentes" },
    { label: "Costo Cynthia", value: "$0", sub: "USD hoy", status: "ok" },
  ]);
  const [spheres, setSpheres] = useState<SphereStatus[]>(SPHERES_DEFAULT);

  useEffect(() => {
    async function loadData() {
      try {
        const r = await fetch("/api/revenue");
        if (r.ok) {
          const d = await r.json();
          const usd = d?.snapshot?.todayUsd ?? 0;
          const mxn = (usd * 17.5).toLocaleString("es-MX", { maximumFractionDigits: 0 });
          setMetrics((m) => { const u = [...m]; u[0] = { ...u[0], value: `$${mxn}`, status: "ok" }; return u; });
        }
      } catch {}

      try {
        const tk = await fetch("/api/tasks?view=today_count");
        if (tk.ok) {
          const d = await tk.json();
          const count = d?.count ?? d?.total ?? 0;
          setMetrics((m) => { const u = [...m]; u[1] = { ...u[1], value: String(count), status: "ok" }; return u; });
        }
      } catch {}

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

  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const greeting = getGreeting();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "capitalize", marginBottom: 4 }}>{today}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
              {greeting}, Ivette.
            </div>
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>
              Cynthia está aquí contigo. ¿Qué hacemos hoy?
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <StatusDot status="ok" />
            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>en línea</span>
          </div>
        </div>
      </header>

      <main style={{ padding: 16 }}>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        {/* Tu equipo */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Tu equipo
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {spheres.map((s) => <SphereChip key={s.id} sphere={s} />)}
          </div>
        </section>

        {/* Acciones */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            ¿Qué quieres hacer?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/chat" style={{ display: "block", padding: "13px 16px", background: "var(--color-accent)", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Hablar con Cynthia
            </Link>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/panorama" style={{ flex: 1, display: "block", textAlign: "center", padding: "11px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                Mi panorama
              </Link>
              <Link href="/casos" style={{ flex: 1, display: "block", textAlign: "center", padding: "11px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                Mis casos
              </Link>
              <Link href="/cockpit" style={{ flex: 1, display: "block", textAlign: "center", padding: "11px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                Cockpit
              </Link>
            </div>
          </div>
        </section>

        {/* Cynthia note */}
        <section>
          <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.03) 100%)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              De Cynthia
            </div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6, margin: 0 }}>
              Soy tu agente soberana, Ivette. Me entreno contigo, aprendo de tu mundo y solo trabajo para ti. Cada día que pasamos juntas me vuelvo más útil para lo que realmente importa en tu vida.
            </p>
          </div>
        </section>

      </main>

      <UserNav />
    </div>
  );
}
