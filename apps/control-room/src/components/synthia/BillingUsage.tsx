"use client";

import { useEffect, useState } from "react";

interface UsageStat {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

interface BillingUsageProps {
  agentId?: string;
}

export function BillingUsage({ agentId }: BillingUsageProps) {
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("Pro");

  useEffect(() => {
    const url = agentId
      ? `/api/synthia/billing?agent_id=${agentId}`
      : `/api/synthia/billing`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.stats) setStats(d.stats);
        if (d.plan) setPlan(d.plan);
      })
      .catch(() => {
        setStats([
          { label: "Mensajes este mes",   used: 0, limit: 1000,  unit: "msgs" },
          { label: "Tokens consumidos",   used: 0, limit: 500000, unit: "tok"  },
          { label: "Activos generados",   used: 0, limit: 50,    unit: "files" },
          { label: "Subagentes lanzados", used: 0, limit: 20,    unit: "runs"  },
        ]);
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) {
    return <div style={{ color: "#999", fontSize: 13 }}>Cargando uso…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#555" }}>Plan actual</span>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          background: "#0d0d0d", color: "#fff",
          padding: "3px 10px", borderRadius: 20,
        }}>{plan}</span>
      </div>

      {stats.map(s => {
        const pct = Math.min((s.used / s.limit) * 100, 100);
        const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
        return (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 4 }}>
              <span>{s.label}</span>
              <span style={{ color: "#0d0d0d", fontWeight: 600 }}>
                {s.used.toLocaleString()} / {s.limit.toLocaleString()} {s.unit}
              </span>
            </div>
            <div style={{ height: 6, background: "#e5e3df", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 8, padding: "12px 14px", background: "#f8f7f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#888" }}>¿Necesitas más capacidad?</span>
        <button style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Actualizar Plan
        </button>
      </div>
    </div>
  );
}
