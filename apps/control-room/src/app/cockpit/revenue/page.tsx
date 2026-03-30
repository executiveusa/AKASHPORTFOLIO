"use client";

import { useState, useEffect } from "react";

interface RevenueSource {
  id: string;
  name: string;
  type: string;
  currency: string;
  amountUsd: number;
  status: string;
}

interface MarketStatus {
  country: string;
  flag: string;
  currency: string;
  status: string;
  monthlyRevenue: number;
  prospectCount: number;
  nextAction: string;
}

interface Strategy {
  id: string;
  name: string;
  market: string;
  description: string;
  expectedMonthlyUsd: number;
  effort: string;
  status: string;
  assignedAgent: string;
}

const defaultSources: RevenueSource[] = [
  { id: "stripe-subs", name: "Stripe Subscriptions", type: "stripe", currency: "USD", amountUsd: 1200, status: "active" },
  { id: "creem-products", name: "Creem.io Digital Products", type: "creem", currency: "USD", amountUsd: 840, status: "active" },
  { id: "crypto-dis", name: "DIS Token Revenue", type: "crypto", currency: "MXN", amountUsd: 300, status: "active" },
  { id: "invoices", name: "Direct Invoices", type: "invoice", currency: "USD", amountUsd: 0, status: "pending" },
];

const defaultMarkets: MarketStatus[] = [
  { country: "México", flag: "🇲🇽", currency: "MXN", status: "active", monthlyRevenue: 1100, prospectCount: 47, nextAction: "Enviar 3 propuestas pendientes" },
  { country: "España", flag: "🇪🇸", currency: "EUR", status: "active", monthlyRevenue: 600, prospectCount: 12, nextAction: "LinkedIn campaign — C-suite Madrid" },
  { country: "Puerto Rico", flag: "🇵🇷", currency: "USD", status: "active", monthlyRevenue: 440, prospectCount: 8, nextAction: "Outreach tech startups SJ" },
  { country: "Colombia", flag: "🇨🇴", currency: "COP", status: "scanning", monthlyRevenue: 200, prospectCount: 23, nextAction: "Market research Bogotá" },
  { country: "Argentina", flag: "🇦🇷", currency: "ARS", status: "scanning", monthlyRevenue: 0, prospectCount: 5, nextAction: "Evaluate USDT payment rails" },
  { country: "Chile", flag: "🇨🇱", currency: "CLP", status: "queued", monthlyRevenue: 0, prospectCount: 0, nextAction: "Q3 expansion target" },
];

const defaultStrategies: Strategy[] = [
  { id: "strat-001", name: "PyME Restaurantes CDMX", market: "México", description: "Automatización restaurantes premium CDMX. $2,400/mo. ROI 30 días.", expectedMonthlyUsd: 7200, effort: "medium", status: "active", assignedAgent: "SEDUCTORA™ + CAZADORA™" },
  { id: "strat-002", name: "LinkedIn C-Suite España", market: "España", description: "Contenido LinkedIn targeting directores Madrid/Barcelona. Enterprise plan €1,999/yr.", expectedMonthlyUsd: 4500, effort: "medium", status: "active", assignedAgent: "DRA. CULTURA™ + ALEX™" },
  { id: "strat-003", name: "Digital Products Creem.io", market: "Global", description: "Templates IA, cursos, herramientas via Creem.io. $49-$299. Meta: 30 ventas/mes.", expectedMonthlyUsd: 3000, effort: "low", status: "active", assignedAgent: "FORJADORA™ + ING. TEKNOS" },
  { id: "strat-004", name: "Crypto DIS Ecosystem", market: "México", description: "DIS token payments + hold strategy para apreciación.", expectedMonthlyUsd: 1000, effort: "high", status: "proposed", assignedAgent: "DR. ECONOMÍA" },
  { id: "strat-005", name: "Afiliados Puerto Rico", market: "Puerto Rico", description: "Partner program con tech agencies SJ/Condado. 20% commission. 5 partners.", expectedMonthlyUsd: 2000, effort: "low", status: "proposed", assignedAgent: "CAZADORA™" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "var(--color-status-ok)",
    scanning: "var(--color-status-info)",
    queued: "var(--color-cream-400)",
    paused: "var(--color-status-warn)",
    proposed: "var(--color-status-info)",
    pending: "var(--color-status-warn)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: colors[status] || "var(--color-cream-400)",
        }}
      />
      {status}
    </span>
  );
}

export default function RevenuePage() {
  const [sources] = useState<RevenueSource[]>(defaultSources);
  const [markets] = useState<MarketStatus[]>(defaultMarkets);
  const [strategies] = useState<Strategy[]>(defaultStrategies);
  const [lastScan, setLastScan] = useState<string>("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setLastScan(new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }));
  }, []);

  const totalMonthly = sources.reduce((s, r) => s + r.amountUsd, 0);
  const activeMarketRevenue = markets.reduce((s, m) => s + m.monthlyRevenue, 0);
  const strategyPipeline = strategies.reduce((s, st) => s + st.expectedMonthlyUsd, 0);

  async function triggerScan() {
    setScanning(true);
    try {
      await fetch("/api/revenue", { method: "POST" });
    } catch { /* demo mode */ }
    setTimeout(() => {
      setScanning(false);
      setLastScan(new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }));
    }, 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Revenue Agent
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            Motor de ingresos autónomo — Último scan: {lastScan || "—"}
          </p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          style={{
            padding: "8px 20px",
            backgroundColor: scanning ? "var(--color-charcoal-700)" : "var(--color-gold-600)",
            color: scanning ? "var(--color-cream-400)" : "var(--color-charcoal-900)",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: scanning ? "not-allowed" : "pointer",
          }}
        >
          {scanning ? "Escaneando…" : "Ejecutar Scan"}
        </button>
      </div>

      {/* Revenue KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "Hoy", value: "$147", sub: "+12% vs ayer" },
          { label: "Este Mes", value: `$${totalMonthly.toLocaleString()}`, sub: `${sources.filter(s => s.status === "active").length} fuentes activas` },
          { label: "Mercados Activos", value: `$${activeMarketRevenue.toLocaleString()}`, sub: `${markets.filter(m => m.status === "active").length} de ${markets.length} países` },
          { label: "Pipeline Estimado", value: `$${(strategyPipeline).toLocaleString()}/mo`, sub: `${strategies.filter(s => s.status === "active").length} estrategias activas` },
          { label: "Racha", value: "12 días", sub: "Ingresos consecutivos" },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-cream-100)" }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: "var(--color-gold-600)", marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Payment Sources */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Fuentes de Ingreso
          </h2>
        </div>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 16px" }}>Fuente</th>
              <th style={{ textAlign: "left", padding: "10px 16px" }}>Tipo</th>
              <th style={{ textAlign: "right", padding: "10px 16px" }}>Monto/mo</th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>Moneda</th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr key={src.id}>
                <td style={{ padding: "10px 16px", fontWeight: 500 }}>{src.name}</td>
                <td style={{ padding: "10px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{src.type}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  ${src.amountUsd.toLocaleString()}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "center", fontSize: 12 }}>{src.currency}</td>
                <td style={{ padding: "10px 16px", textAlign: "center" }}><StatusBadge status={src.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Markets */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Mercados Objetivo
          </h2>
        </div>
        <table className="data-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 16px" }}>País</th>
              <th style={{ textAlign: "right", padding: "10px 16px" }}>Revenue/mo</th>
              <th style={{ textAlign: "right", padding: "10px 16px" }}>Leads</th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>Estado</th>
              <th style={{ textAlign: "left", padding: "10px 16px" }}>Próxima Acción</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.country}>
                <td style={{ padding: "10px 16px", fontWeight: 500 }}>
                  <span style={{ marginRight: 8 }}>{m.flag}</span>
                  {m.country}
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--color-cream-400)" }}>{m.currency}</span>
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  ${m.monthlyRevenue.toLocaleString()}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>{m.prospectCount}</td>
                <td style={{ padding: "10px 16px", textAlign: "center" }}><StatusBadge status={m.status} /></td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-cream-200)" }}>{m.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategies */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Estrategias de Revenue
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {strategies.map((st) => (
            <div
              key={st.id}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--color-gold-600-10)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-cream-100)" }}>{st.name}</span>
                  <StatusBadge status={st.status} />
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    backgroundColor: st.effort === "low" ? "rgba(52, 211, 153, 0.1)" : st.effort === "medium" ? "rgba(251, 191, 36, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: st.effort === "low" ? "var(--color-status-ok)" : st.effort === "medium" ? "var(--color-status-warn)" : "var(--color-status-error)",
                  }}>
                    {st.effort}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-cream-400)", lineHeight: 1.5 }}>{st.description}</div>
                <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginTop: 4 }}>
                  Agentes: <span style={{ color: "var(--color-gold-400)" }}>{st.assignedAgent}</span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  Mercado: {st.market}
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 100 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>
                  ${st.expectedMonthlyUsd.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>est. /mes</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Circuit Breaker Notice */}
      <div className="panel" style={{ padding: 14, borderLeft: "3px solid var(--color-status-warn)" }}>
        <div style={{ fontSize: 13, color: "var(--color-cream-200)" }}>
          <strong style={{ color: "var(--color-status-warn)" }}>Circuit Breaker:</strong>{" "}
          Transacciones automáticas limitadas a $500 USD. Montos mayores requieren aprobación manual de Ivette.
        </div>
      </div>
    </div>
  );
}
