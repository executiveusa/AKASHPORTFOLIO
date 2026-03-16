"use client";

import { useState, useEffect } from "react";

interface SocialAccount {
  id: string;
  platform: "linkedin" | "instagram" | "x" | "tiktok" | "youtube";
  handle: string;
  followers: number;
  status: "connected" | "disconnected" | "pending";
  lastPost?: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledFor: string;
  status: "scheduled" | "published" | "failed" | "draft";
  market: string;
  assignedAgent: string;
}

interface ContentMetric {
  period: string;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
}

const demoAccounts: SocialAccount[] = [
  { id: "li_001", platform: "linkedin", handle: "@kupuri-media", followers: 1247, status: "connected", lastPost: "2h ago" },
  { id: "ig_001", platform: "instagram", handle: "@kupuri.cdmx", followers: 3891, status: "connected", lastPost: "6h ago" },
  { id: "x_001", platform: "x", handle: "@KupuriMedia", followers: 892, status: "connected", lastPost: "1h ago" },
  { id: "tt_001", platform: "tiktok", handle: "@kupuri.ai", followers: 567, status: "pending" },
  { id: "yt_001", platform: "youtube", handle: "Kupuri Media CDMX", followers: 234, status: "disconnected" },
];

const demoPosts: ScheduledPost[] = [
  { id: "post_001", platform: "linkedin", content: "🚀 Cómo la IA está transformando las PyMEs en CDMX — nuestro caso de estudio con Restaurante La Buena muestra un ROI del 340% en 30 días.", scheduledFor: "2025-06-16T10:00:00Z", status: "scheduled", market: "México", assignedAgent: "DRA. CULTURA™" },
  { id: "post_002", platform: "instagram", content: "El futuro del trabajo autónomo en Latinoamérica 🌎 Synthia 3.0 ya maneja 9 agentes de IA 24/7 para nuestros clientes.", scheduledFor: "2025-06-16T14:00:00Z", status: "scheduled", market: "LATAM", assignedAgent: "FORJADORA™" },
  { id: "post_003", platform: "x", content: "Just shipped: Revenue Agent autonomously closed $2,400 in recurring revenue for a CDMX restaurant chain. The machines are working 💰", scheduledFor: "2025-06-16T16:00:00Z", status: "scheduled", market: "Global", assignedAgent: "ALEX™" },
  { id: "post_004", platform: "linkedin", content: "Buscamos directores de tecnología en Madrid y Barcelona 🇪🇸 Nuestra plataforma de agentes IA puede reducir costos operativos un 60%.", scheduledFor: "2025-06-17T09:00:00Z", status: "draft", market: "España", assignedAgent: "CAZADORA™" },
  { id: "post_005", platform: "x", content: "From Mexico City with AI 🇲🇽 — Building the most advanced autonomous agent system for the Spanish-speaking market. Demo dropping soon.", scheduledFor: "2025-06-15T18:00:00Z", status: "published", market: "Global", assignedAgent: "FORJADORA™" },
  { id: "post_006", platform: "instagram", content: "Detrás de cámaras: nuestro Theater 3D donde 9 agentes de IA debaten estrategia en tiempo real 🎭✨", scheduledFor: "2025-06-15T12:00:00Z", status: "published", market: "LATAM", assignedAgent: "FORJADORA™" },
];

const demoMetrics: ContentMetric[] = [
  { period: "Hoy", impressions: 2340, engagement: 187, clicks: 45, conversions: 3 },
  { period: "Esta Semana", impressions: 14200, engagement: 1123, clicks: 289, conversions: 12 },
  { period: "Este Mes", impressions: 48900, engagement: 3890, clicks: 967, conversions: 47 },
];

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, { label: string; color: string }> = {
    linkedin: { label: "in", color: "#0a66c2" },
    instagram: { label: "IG", color: "#e1306c" },
    x: { label: "𝕏", color: "#f0f0f0" },
    tiktok: { label: "TT", color: "#ff0050" },
    youtube: { label: "YT", color: "#ff0000" },
  };
  const i = icons[platform] || { label: "?", color: "var(--color-cream-400)" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: i.color,
      fontSize: 10,
      fontWeight: 700,
      color: "#fff",
    }}>
      {i.label}
    </span>
  );
}

export default function SocialPage() {
  const [accounts] = useState<SocialAccount[]>(demoAccounts);
  const [posts] = useState<ScheduledPost[]>(demoPosts);
  const [metrics] = useState<ContentMetric[]>(demoMetrics);
  const [filter, setFilter] = useState<"all" | "scheduled" | "published" | "draft">("all");
  const [now, setNow] = useState("");

  useEffect(() => { setNow(new Date().toLocaleDateString("es-MX")); }, []);

  const filteredPosts = filter === "all" ? posts : posts.filter(p => p.status === filter);
  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>Social Media</h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
          Gestión de contenido multi-plataforma — {now}
        </p>
      </div>

      {/* Content Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.period} className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginBottom: 8 }}>{m.period}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--color-cream-100)" }}>{m.impressions.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "var(--color-cream-400)" }}>impresiones</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--color-status-info)" }}>{m.engagement.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "var(--color-cream-400)" }}>engagement</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--color-gold-400)" }}>{m.clicks}</div>
                <div style={{ fontSize: 10, color: "var(--color-cream-400)" }}>clicks</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--color-status-ok)" }}>{m.conversions}</div>
                <div style={{ fontSize: 10, color: "var(--color-cream-400)" }}>conversiones</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Accounts */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Cuentas ({accounts.filter(a => a.status === "connected").length} conectadas)
          </h2>
          <span style={{ fontSize: 13, color: "var(--color-cream-400)" }}>
            {totalFollowers.toLocaleString()} seguidores totales
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 0 }}>
          {accounts.map((acc) => (
            <div key={acc.id} style={{
              padding: "14px 16px",
              borderRight: "1px solid var(--color-gold-600-10)",
              borderBottom: "1px solid var(--color-gold-600-10)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <PlatformIcon platform={acc.platform} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: "var(--color-cream-100)" }}>{acc.handle}</div>
                <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>
                  {acc.followers.toLocaleString()} · {acc.status === "connected" ? (acc.lastPost || "—") : acc.status}
                </div>
              </div>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: acc.status === "connected" ? "var(--color-status-ok)" : acc.status === "pending" ? "var(--color-status-warn)" : "var(--color-status-error)",
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Calendario de Contenido
          </h2>
          <div style={{ display: "flex", gap: 4, backgroundColor: "var(--color-charcoal-800)", borderRadius: 8, padding: 2 }}>
            {(["all", "scheduled", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: filter === f ? 600 : 400,
                  color: filter === f ? "var(--color-charcoal-900)" : "var(--color-cream-400)",
                  backgroundColor: filter === f ? "var(--color-gold-600)" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "Todo" : f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredPosts.map((post) => (
            <div key={post.id} style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-gold-600-10)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 14,
              alignItems: "start",
            }}>
              <PlatformIcon platform={post.platform} />
              <div>
                <div style={{ fontSize: 13, color: "var(--color-cream-100)", lineHeight: 1.5, marginBottom: 6 }}>
                  {post.content.length > 140 ? post.content.slice(0, 140) + "…" : post.content}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--color-cream-400)" }}>
                  <span>{new Date(post.scheduledFor).toLocaleDateString("es-MX", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span>·</span>
                  <span>{post.market}</span>
                  <span>·</span>
                  <span style={{ color: "var(--color-gold-400)" }}>{post.assignedAgent}</span>
                </div>
              </div>
              <span style={{
                padding: "2px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                color: post.status === "published" ? "var(--color-status-ok)" : post.status === "scheduled" ? "var(--color-status-info)" : post.status === "draft" ? "var(--color-cream-400)" : "var(--color-status-error)",
                backgroundColor: post.status === "published" ? "rgba(52,211,153,0.1)" : post.status === "scheduled" ? "rgba(96,165,250,0.1)" : post.status === "draft" ? "rgba(184,164,133,0.1)" : "rgba(239,68,68,0.1)",
              }}>
                {post.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
