"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

// ─── Tier definitions (mirrors 006_articles_directory.sql seed data) ─────────

interface Tier {
  slug: string;
  name_es: string;
  description_es: string;
  price_mxn: number;
  price_usd: number;
  features: string[];
  max_agents: number;
  max_listings: number;
  highlighted: boolean;
  stripe_link: string;
}

const TIERS: Tier[] = [
  {
    slug: "explorador",
    name_es: "Explorador",
    description_es: "Para negocios que quieren visibilidad en el directorio.",
    price_mxn: 0,
    price_usd: 0,
    features: [
      "Listado gratuito en el directorio",
      "1 foto de portada",
      "Datos de contacto básicos",
      "Aparece en búsquedas",
    ],
    max_agents: 1,
    max_listings: 1,
    highlighted: false,
    stripe_link: "#",
  },
  {
    slug: "empresario",
    name_es: "Empresario",
    description_es: "Para negocios con presencia premium y más exposición.",
    price_mxn: 499,
    price_usd: 29.99,
    features: [
      "Todo en Explorador",
      "Galería de hasta 10 fotos",
      "Descripción multilingüe (ES/EN/FR)",
      "Posición destacada en búsquedas",
      "Acceso a analytics",
      "Badge verificado",
    ],
    max_agents: 3,
    max_listings: 5,
    highlighted: true,
    stripe_link: "#",
  },
  {
    slug: "empresaria-pro",
    name_es: "Empresaria Pro",
    description_es:
      "Para agencias y marcas que quieren máxima exposición + automatización.",
    price_mxn: 1499,
    price_usd: 89.99,
    features: [
      "Todo en Empresario",
      "Listados ilimitados",
      "IA escribe tu descripción",
      "Agente CAZADORA™ prospecta clientes",
      "Dashboard de analytics avanzado",
      "Soporte prioritario",
      "White-label disponible",
    ],
    max_agents: 10,
    max_listings: 999,
    highlighted: false,
    stripe_link: "#",
  },
];

// ─── Agent assignment legend ──────────────────────────────────────────────────

interface AgentAssignment {
  sphere: string;
  color: string;
  role: string;
  company: string;
  tasks: string[];
}

const AGENT_ASSIGNMENTS: AgentAssignment[] = [
  {
    sphere: "DR. ECONOMÍA",
    color: "#f97316",
    role: "Gestor de Suscripciones",
    company: "kupuri-media",
    tasks: [
      "Monitorea Stripe webhooks (payment_intent, subscription events)",
      "Detecta churns y emite alertas 7 días antes del vencimiento",
      "Genera reporte de MRR diario a las 09:00 CST",
    ],
  },
  {
    sphere: "SEDUCTORA",
    color: "#eab308",
    role: "Closera de Upgrades",
    company: "kupuri-media",
    tasks: [
      "Envía email de upgrade a usuarios en tier Explorador después de 7 días",
      "Genera copia persuasiva para campañas de conversión",
      "A/B test subject lines con análisis semanal",
    ],
  },
  {
    sphere: "CAZADORA",
    color: "#ef4444",
    role: "Prospectora de Directorio",
    company: "kupuri-media",
    tasks: [
      "Rastrea negocios en Puerto Vallarta / CDMX usando Apollo + Firecrawl",
      "Enriquece listings con IA y asigna tier sugerido",
      "Envía invitaciones de listing a negocios sin presencia digital",
    ],
  },
  {
    sphere: "FORJADORA",
    color: "#22c55e",
    role: "Arquitecta del Directorio",
    company: "kupuri-media",
    tasks: [
      "Mantiene schema de directory_listings en Supabase",
      "Ejecuta enriquecimiento IA de descripciones multilingüe",
      "Genera sitemap dinámico para listings activos",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const BG2 = "var(--color-charcoal-800)";
  const BG3 = "var(--color-charcoal-700)";
  const BORDER = "var(--color-charcoal-600)";
  const GOLD = "var(--color-gold-400)";
  const GOLD6 = "var(--color-gold-600)";
  const GOLD5 = "var(--color-gold-500)";
  const CREAM1 = "var(--color-cream-100)";
  const CREAM2 = "var(--color-cream-200)";
  const CREAM4 = "var(--color-cream-400)";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-charcoal-900)",
        color: CREAM1,
        padding: "32px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: GOLD5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            DR. ECONOMÍA™ · Gestión de Ingresos
          </div>
          <h1
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: CREAM1,
              marginBottom: 8,
            }}
          >
            Planes de Suscripción
          </h1>
          <p style={{ fontSize: 15, color: CREAM4, lineHeight: 1.6 }}>
            Directorio Kupuri™ — Puerto Vallarta &amp; CDMX · Monetización via
            Stripe
          </p>
        </div>

        {/* ── Revenue Stats ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 0,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 40,
          }}
        >
          {[
            { label: "MRR Actual", value: "$0", note: "Stripe no conectado" },
            { label: "Suscriptores", value: "0", note: "Explorador: 0" },
            { label: "Churn Rate", value: "—", note: "< 3% objetivo" },
            { label: "LTV Promedio", value: "—", note: "Empresaria Pro target" },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                padding: "20px 16px",
                background: BG2,
                borderRight: idx < 3 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: CREAM4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: GOLD,
                  letterSpacing: "-0.03em",
                  marginBottom: 2,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: CREAM4 }}>{stat.note}</div>
            </div>
          ))}
        </div>

        {/* ── Tier Cards ─────────────────────────────────────────────────── */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: CREAM1,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}
        >
          Planes Disponibles
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.slug}
              style={{
                padding: "28px 24px",
                background: tier.highlighted ? BG3 : BG2,
                border: tier.highlighted
                  ? `1px solid ${GOLD6}`
                  : `1px solid ${BORDER}`,
                borderRadius: 8,
                position: "relative",
              }}
            >
              {tier.highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: 24,
                    background: GOLD6,
                    color: "var(--color-charcoal-900)",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    padding: "3px 10px",
                    borderRadius: "0 0 6px 6px",
                    textTransform: "uppercase",
                  }}
                >
                  Más popular
                </div>
              )}

              {/* Tier name */}
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: CREAM1,
                  marginBottom: 4,
                  marginTop: tier.highlighted ? 8 : 0,
                }}
              >
                {tier.name_es}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: CREAM4,
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                {tier.description_es}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                {tier.price_mxn === 0 ? (
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: CREAM1,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Gratis
                  </span>
                ) : (
                  <div>
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: tier.highlighted ? GOLD : CREAM1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      ${tier.price_mxn.toLocaleString("es-MX")}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: CREAM4,
                        marginLeft: 6,
                      }}
                    >
                      MXN/mes · ${tier.price_usd} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Feature list */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: CREAM2,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: GOLD5,
                        fontSize: 11,
                        marginTop: 3,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Limits */}
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: 6,
                  marginBottom: 20,
                  display: "flex",
                  gap: 20,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 10, color: CREAM4, textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Agentes
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: CREAM1 }}>
                    {tier.max_agents === 999 ? "∞" : tier.max_agents}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 10, color: CREAM4, textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Listados
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: CREAM1 }}>
                    {tier.max_listings === 999 ? "∞" : tier.max_listings}
                  </div>
                </div>
              </div>

              <a
                href={tier.stripe_link}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  background: tier.highlighted ? GOLD6 : "transparent",
                  color: tier.highlighted
                    ? "var(--color-charcoal-900)"
                    : CREAM2,
                  border: tier.highlighted ? "none" : `1px solid ${BORDER}`,
                  borderRadius: 6,
                  textDecoration: "none",
                  cursor: tier.stripe_link === "#" ? "not-allowed" : "pointer",
                  opacity: tier.stripe_link === "#" ? 0.6 : 1,
                }}
              >
                {tier.price_mxn === 0
                  ? "Publicar Gratis"
                  : "Conectar Stripe →"}
              </a>
            </div>
          ))}
        </div>

        {/* ── Agent Assignment Table ─────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: CREAM1,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            Agentes Asignados
          </h2>
          <p
            style={{
              fontSize: 13,
              color: CREAM4,
              marginBottom: 20,
            }}
          >
            Esferas responsables de la monetización del directorio
          </p>

          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {AGENT_ASSIGNMENTS.map((agent, idx) => (
              <div
                key={agent.sphere}
                style={{
                  padding: "18px 20px",
                  background: BG2,
                  borderBottom:
                    idx < AGENT_ASSIGNMENTS.length - 1
                      ? `1px solid ${BORDER}`
                      : "none",
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 20,
                  alignItems: "start",
                }}
              >
                {/* Sphere identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: agent.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: CREAM1,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {agent.sphere}
                    </div>
                    <div style={{ fontSize: 11, color: CREAM4, marginTop: 1 }}>
                      {agent.role}
                    </div>
                  </div>
                </div>

                {/* Task list */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {agent.tasks.map((task, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 12,
                        color: CREAM4,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: GOLD5, flexShrink: 0 }}>→</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stripe Setup CTA ──────────────────────────────────────────── */}
        <div
          style={{
            padding: "24px",
            background: BG2,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: GOLD5,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Acción requerida
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: CREAM1,
                marginBottom: 4,
              }}
            >
              Configura Stripe para activar pagos
            </div>
            <div style={{ fontSize: 13, color: CREAM4 }}>
              Necesitas{" "}
              <code
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                STRIPE_SECRET_KEY
              </code>{" "}
              y{" "}
              <code
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                STRIPE_WEBHOOK_SECRET
              </code>{" "}
              en tus variables de entorno.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <Link
              href="/cockpit/vault"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: CREAM2,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Ver Bóveda →
            </Link>
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                background: GOLD6,
                color: "var(--color-charcoal-900)",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Ir a Stripe →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
