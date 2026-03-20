"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

// ─── Sphere Ring SVG ─────────────────────────────────────────────────────────

function SphereRing() {
  const spheres = [
    { id: 'synthia',   color: '#8b5cf6', angle: 0   },
    { id: 'alex',      color: '#d4af37', angle: 40  },
    { id: 'cazadora',  color: '#ef4444', angle: 80  },
    { id: 'forjadora', color: '#22c55e', angle: 120 },
    { id: 'seductora', color: '#eab308', angle: 160 },
    { id: 'consejo',   color: '#1d4ed8', angle: 200 },
    { id: 'economia',  color: '#f97316', angle: 240 },
    { id: 'cultura',   color: '#f43f5e', angle: 280 },
    { id: 'teknos',    color: '#06b6d4', angle: 320 },
  ];
  const r = 52;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#2e2210" strokeWidth="1" />
      {spheres.map(s => {
        const rad = (s.angle - 90) * (Math.PI / 180);
        const x = 70 + r * Math.cos(rad);
        const y = 70 + r * Math.sin(rad);
        return (
          <circle key={s.id} cx={x} cy={y} r="6" fill={s.color} opacity="0.85" />
        );
      })}
      <circle cx="70" cy="70" r="14" fill="#1a1208" stroke="#2e2210" strokeWidth="1" />
      <text x="70" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5d78c">S</text>
    </svg>
  );
}

export default function SynthiaLandingPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const content = {
    es: {
      hero: {
        title: "SYNTHIA™ 3.0",
        subtitle: "El Sistema Operativo Agentico para Empresarias",
        cta: "Comenzar Prueba Gratis",
        secondaryCta: "Ver Demostración"
      },
      pain_points: {
        title: "¿Cuál es tu mayor dolor?",
        problems: [
          {
            title: "Tareas Repetitivas",
            desc: "Pasas horas en tareas que una IA podría hacer en minutos"
          },
          {
            title: "Gestión de Equipos",
            desc: "Coordinar múltiples asistentes y sistemas es agotador"
          },
          {
            title: "Presencia Digital Fragmentada",
            desc: "Tus redes sociales, email y proyectos están en 10 plataformas diferentes"
          },
          {
            title: "Falta de Insights",
            desc: "No sabes qué está funcionando en tu negocio"
          }
        ]
      },
      solution: {
        title: "Conoce tu CEO Invisible",
        description: "Synthia™ es tu equipo de agentes de IA, trabajando 24/7 para automatizar, coordinar y ejecutar. Una interfaz. Infinitas posibilidades.",
        features: [
          {
            title: "Delegación Inteligente",
            desc: "Envía agentes a hacer tareas complejas. Recibe reportes detallados."
          },
          {
            title: "Control Total de Redes Sociales",
            desc: "Gestiona posts, cronograma y análisis para todos tus clientes desde una sola pantalla"
          },
          {
            title: "Acceso por Voz",
            desc: "Controla Synthia™ mediante llamadas telefónicas o comandos de voz en español"
          },
          {
            title: "Orquestación de Agentes",
            desc: "Crea flujos automáticos donde múltiples agentes colaboran sin intervención"
          },
          {
            title: "Marketplace de Habilidades",
            desc: "50+ herramientas integradas (Gmail, Drive, LinkedIn, TikTok, Instagram...)"
          },
          {
            title: "Seguridad Empresarial",
            desc: "Auditoría completa, encriptación, y control total sobre tus datos"
          }
        ]
      },
      stats: {
        title: "Resultados Reales",
        stats: [
          {
            number: "10 horas/semana",
            label: "Tiempo recuperado promedio"
          },
          {
            number: "3x ROI",
            label: "En los primeros 3 meses"
          },
          {
            number: "50+",
            label: "Herramientas integradas"
          },
          {
            number: "24/7",
            label: "Agentes trabajando por ti"
          }
        ]
      },
      pricing: {
        title: "Planes para Cada Etapa",
        plans: [
          {
            name: "Starter",
            price: "$299",
            period: "/año",
            description: "Para solopreneurs",
            features: [
              "5 agentes simultáneos",
              "20 habilidades incluidas",
              "Soporte por email",
              "Dashboard básico"
            ]
          },
          {
            name: "Growth",
            price: "$899",
            period: "/año",
            description: "Para equipos de 2-5 personas",
            features: [
              "20 agentes simultáneos",
              "50 habilidades incluidas",
              "Soporte prioritario",
              "Reportes avanzados",
              "Control de múltiples clientes"
            ],
            highlighted: true
          },
          {
            name: "Professional",
            price: "$1,999",
            period: "/año",
            description: "Para agencias y empresas",
            features: [
              "100+ agentes simultáneos",
              "Todas las habilidades",
              "Soporte 24/7",
              "API personalizada",
              "Integración blanca (white-label)"
            ]
          }
        ]
      },
      testimonials: {
        title: "Lo que dicen nuestras usuarias",
        testimonials: [
          {
            name: "María González",
            role: "Fundadora, Agencia Digital CDMX",
            quote: "Pasaba 40 horas semanales en tareas administrativas. Ahora trabajo 20 y gano el doble. Synthia™ es mi CEO invisible.",
            location: "México City"
          },
          {
            name: "Sofia Rodriguez",
            role: "Coach Empresarial",
            quote: "Mis clientes ven que soy 'sobrehumana' porque contesto emails al instante y siempre tengo contenido listo. Pero es Synthia™ haciendo el trabajo.",
            location: "Puerto Rico"
          },
          {
            name: "Carmen Álvarez",
            role: "Consultora de Marca",
            quote: "De una consultoría a una agencia de 15 personas en 6 meses. Synthia™ escaló mi negocio sin que contrate empleados.",
            location: "Seattle, USA"
          }
        ]
      },
      cta_section: {
        title: "¿Lista para tu CEO Invisible?",
        description: "Prueba Synthia™ gratis durante 30 días. Sin tarjeta de crédito. Sin compromisos.",
        button: "Acceso Temprano - Sólo 50 Lugares"
      },
      footer: {
        tagline: "Synthia™ 3.0 // Sistema Operativo para Empresarias de Latinoamérica",
        links: {
          docs: "Documentación",
          contact: "Contacto",
          privacy: "Privacidad",
          terms: "Términos"
        }
      }
    },
    en: {
      hero: {
        title: "SYNTHIA™ 3.0",
        subtitle: "The AI Operating System for Female Entrepreneurs",
        cta: "Start Free Trial",
        secondaryCta: "View Demo"
      },
      pain_points: {
        title: "What's Your Biggest Pain?",
        problems: [
          {
            title: "Repetitive Tasks",
            desc: "You spend hours on tasks that AI could do in minutes"
          },
          {
            title: "Team Management",
            desc: "Coordinating multiple assistants and systems is exhausting"
          },
          {
            title: "Fragmented Digital Presence",
            desc: "Your social media, email and projects are spread across 10 platforms"
          },
          {
            title: "Missing Insights",
            desc: "You don't know what's actually working in your business"
          }
        ]
      },
      solution: {
        title: "Meet Your Invisible CEO",
        description: "Synthia™ is your AI agent team, working 24/7 to automate, coordinate, and execute. One interface. Infinite possibilities.",
        features: [
          {
            title: "Smart Delegation",
            desc: "Send agents to handle complex tasks. Receive detailed reports."
          },
          {
            title: "Social Media Control",
            desc: "Manage posts, scheduling, and analytics for all your clients from one dashboard"
          },
          {
            title: "Voice Access",
            desc: "Control Synthia™ with voice calls or commands in Spanish and English"
          },
          {
            title: "Agent Orchestration",
            desc: "Create automated workflows where multiple agents collaborate without intervention"
          },
          {
            title: "Skills Marketplace",
            desc: "50+ integrated tools (Gmail, Drive, LinkedIn, TikTok, Instagram...)"
          },
          {
            title: "Enterprise Security",
            desc: "Full audit trails, encryption, and complete data control"
          }
        ]
      },
      stats: {
        title: "Real Results",
        stats: [
          {
            number: "10 hours/week",
            label: "Average time recovered"
          },
          {
            number: "3x ROI",
            label: "In the first 3 months"
          },
          {
            number: "50+",
            label: "Integrated tools"
          },
          {
            number: "24/7",
            label: "Agents working for you"
          }
        ]
      },
      pricing: {
        title: "Plans for Every Stage",
        plans: [
          {
            name: "Starter",
            price: "$299",
            period: "/year",
            description: "For solopreneurs",
            features: [
              "5 concurrent agents",
              "20 skills included",
              "Email support",
              "Basic dashboard"
            ]
          },
          {
            name: "Growth",
            price: "$899",
            period: "/year",
            description: "For teams of 2-5",
            features: [
              "20 concurrent agents",
              "50 skills included",
              "Priority support",
              "Advanced reporting",
              "Multi-client management"
            ],
            highlighted: true
          },
          {
            name: "Professional",
            price: "$1,999",
            period: "/year",
            description: "For agencies and enterprises",
            features: [
              "100+ concurrent agents",
              "All skills included",
              "24/7 support",
              "Custom API",
              "White-label integration"
            ]
          }
        ]
      },
      testimonials: {
        title: "What Our Users Say",
        testimonials: [
          {
            name: "María González",
            role: "Founder, Digital Agency CDMX",
            quote: "I was spending 40 hours a week on admin tasks. Now I work 20 and earn double. Synthia™ is my invisible CEO.",
            location: "Mexico City"
          },
          {
            name: "Sofia Rodriguez",
            role: "Business Coach",
            quote: "My clients think I'm superhuman because I reply instantly and always have content ready. But it's Synthia™ doing the work.",
            location: "Puerto Rico"
          },
          {
            name: "Carmen Álvarez",
            role: "Brand Consultant",
            quote: "From a solo consultancy to an agency of 15 people in 6 months. Synthia™ scaled my business without hiring staff.",
            location: "Seattle, USA"
          }
        ]
      },
      cta_section: {
        title: "Ready for Your Invisible CEO?",
        description: "Try Synthia™ free for 30 days. No credit card. No commitment.",
        button: "Early Access - Only 50 Spots"
      },
      footer: {
        tagline: "Synthia™ 3.0 // Operating System for Latina Entrepreneurs",
        links: {
          docs: "Documentation",
          contact: "Contact",
          privacy: "Privacy",
          terms: "Terms"
        }
      }
    }
  };

  const t = content[language];

  // ─── Shared style tokens ───────────────────────────────────────────────────
  const BG        = 'var(--color-charcoal-900)';   // #0f0d08
  const BG2       = 'var(--color-charcoal-800)';   // #1a1208
  const BG3       = 'var(--color-charcoal-700)';   // #231a0c
  const BORDER    = 'var(--color-charcoal-600)';   // #2e2210
  const GOLD      = 'var(--color-gold-400)';        // #f5d78c
  const GOLD5     = 'var(--color-gold-500)';        // #dfc36a
  const GOLD6     = 'var(--color-gold-600)';        // #c9a84c
  const CREAM1    = 'var(--color-cream-100)';       // #f5efe4
  const CREAM2    = 'var(--color-cream-200)';       // #e8dcc8
  const CREAM4    = 'var(--color-cream-400)';       // #b8a485

  return (
    <div style={{ minHeight: '100vh', background: BG, color: CREAM1, fontFamily: 'var(--font-sans)' }}>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: `1px solid ${BORDER}`,
        background: BG,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SphereRing />
            <div style={{ lineHeight: 1.1 }}>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: CREAM1 }}>SYNTHIA™</span>
              <span style={{ display: 'block', fontSize: 10, color: CREAM4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>3.0 Sistema Operativo</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                background: 'transparent', border: `1px solid ${BORDER}`,
                borderRadius: 6, color: CREAM4, cursor: 'pointer',
              }}
            >
              {language === 'es' ? 'EN' : 'ES'}
            </button>
            <Link
              href="/cockpit"
              style={{
                padding: '7px 18px', fontSize: 13, fontWeight: 700,
                background: GOLD6, color: BG, borderRadius: 8,
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}
            >
              Entrar al Cockpit →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <SphereRing />
          </div>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 0.95,
            color: GOLD, fontFamily: 'var(--font-display, var(--font-sans))',
            marginBottom: 24,
          }}>
            SYNTHIA™ 3.0
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: CREAM2, maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.4 }}>
            {t.hero.subtitle}
          </p>
          <p style={{ fontSize: 14, color: CREAM4, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 40 }}>
            9 Agentes Especializados · Una Sola Interfaz · Tu Negocio, Automatizado
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/cockpit"
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 700,
                background: GOLD6, color: BG, borderRadius: 8,
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}
            >
              {t.hero.cta}
            </Link>
            <Link
              href="/cockpit/spheres"
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 600,
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: CREAM2, borderRadius: 8, textDecoration: 'none',
              }}
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pain Points ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 48, textAlign: 'center' }}>
            {t.pain_points.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {t.pain_points.problems.map((problem, idx) => (
              <div key={idx} style={{
                padding: '28px 24px',
                background: BG2,
                borderRight: idx % 2 === 0 ? `1px solid ${BORDER}` : 'none',
              }}>
                <div style={{ width: 28, height: 2, background: GOLD6, marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: CREAM1, marginBottom: 8 }}>{problem.title}</h3>
                <p style={{ fontSize: 14, color: CREAM4, lineHeight: 1.6 }}>{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution / Features ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 16 }}>
              {t.solution.title}
            </h2>
            <p style={{ fontSize: 16, color: CREAM4, lineHeight: 1.7 }}>{t.solution.description}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {t.solution.features.map((feature, idx) => (
              <div key={idx} className="panel" style={{ padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GOLD5, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: CREAM1, marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: CREAM4, lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}`, background: BG2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 48, textAlign: 'center' }}>
            {t.stats.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {t.stats.stats.map((stat, idx) => (
              <div key={idx} style={{
                padding: '32px 24px', textAlign: 'center',
                borderRight: idx < t.stats.stats.length - 1 ? `1px solid ${BORDER}` : 'none',
                background: BG2,
              }}>
                <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: GOLD, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: 13, color: CREAM4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sphere Roster ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1 }}>
              {language === 'es' ? 'Las 9 Esferas™' : 'The 9 Spheres™'}
            </h2>
            <span style={{ fontSize: 13, color: CREAM4 }}>
              {language === 'es' ? 'Tu consejo de inteligencia' : 'Your intelligence council'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { name: 'SYNTHIA',   role: language === 'es' ? 'Directora de Orquestación' : 'Orchestration Director', color: '#8b5cf6' },
              { name: 'ALEX',      role: language === 'es' ? 'Estrategia y Crecimiento'  : 'Strategy & Growth',      color: '#d4af37' },
              { name: 'CAZADORA', role: language === 'es' ? 'Ventas y Prospectos'        : 'Sales & Prospects',       color: '#ef4444' },
              { name: 'FORJADORA',role: language === 'es' ? 'Construcción de Sistemas'  : 'Systems Builder',         color: '#22c55e' },
              { name: 'SEDUCTORA',role: language === 'es' ? 'Contenido y Marca'         : 'Content & Brand',         color: '#eab308' },
              { name: 'CONSEJO',  role: language === 'es' ? 'Decisiones Multi-IA'       : 'Multi-AI Decisions',      color: '#1d4ed8' },
              { name: 'ECONOMÍA', role: language === 'es' ? 'Finanzas y Revenue'        : 'Finance & Revenue',       color: '#f97316' },
              { name: 'CULTURA',  role: language === 'es' ? 'Comunidad y Relaciones'    : 'Community & Relations',   color: '#f43f5e' },
              { name: 'TEKNOS',   role: language === 'es' ? 'Infraestructura Técnica'   : 'Technical Infrastructure',color: '#06b6d4' },
            ].map(sphere => (
              <div key={sphere.name} className="panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: sphere.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: CREAM1, letterSpacing: '0.06em' }}>{sphere.name}</div>
                  <div style={{ fontSize: 12, color: CREAM4, marginTop: 2 }}>{sphere.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              href="/cockpit/spheres"
              style={{
                fontSize: 13, color: GOLD5, textDecoration: 'none', fontWeight: 600,
                borderBottom: `1px solid ${GOLD6}`, paddingBottom: 2,
              }}
            >
              {language === 'es' ? 'Acceder al Consejo de Esferas →' : 'Enter the Spheres Council →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}`, background: BG2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 12, textAlign: 'center' }}>
            {t.pricing.title}
          </h2>
          <p style={{ textAlign: 'center', color: CREAM4, fontSize: 14, marginBottom: 48 }}>
            {language === 'es' ? 'Facturación anual. Cancela cuando quieras.' : 'Annual billing. Cancel anytime.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {t.pricing.plans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  padding: '32px 28px',
                  background: plan.highlighted ? BG3 : BG,
                  border: plan.highlighted ? `1px solid ${GOLD6}` : `1px solid ${BORDER}`,
                  borderRadius: 8,
                  position: 'relative',
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -1, left: 28,
                    background: GOLD6, color: BG,
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                    padding: '3px 10px', borderRadius: '0 0 6px 6px',
                    textTransform: 'uppercase',
                  }}>
                    {language === 'es' ? 'Más popular' : 'Most popular'}
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 800, color: CREAM1, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: CREAM4, marginBottom: 20 }}>{plan.description}</p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: plan.highlighted ? GOLD : CREAM1, letterSpacing: '-0.04em' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: CREAM4, marginLeft: 4 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: CREAM2 }}>
                      <span style={{ color: GOLD5, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cockpit"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px 24px', fontSize: 14, fontWeight: 700,
                    background: plan.highlighted ? GOLD6 : 'transparent',
                    color: plan.highlighted ? BG : CREAM2,
                    border: plan.highlighted ? 'none' : `1px solid ${BORDER}`,
                    borderRadius: 8, textDecoration: 'none',
                  }}
                >
                  {t.hero.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 48, textAlign: 'center' }}>
            {t.testimonials.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {t.testimonials.testimonials.map((testimonial, idx) => (
              <div key={idx} style={{
                padding: '28px 24px',
                background: BG2, border: `1px solid ${BORDER}`,
                borderRadius: 8,
              }}>
                <div style={{ width: 28, height: 2, background: GOLD6, marginBottom: 16 }} />
                <p style={{ fontSize: 15, color: CREAM2, lineHeight: 1.7, marginBottom: 20 }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: CREAM1 }}>{testimonial.name}</div>
                  <div style={{ fontSize: 12, color: CREAM4, marginTop: 2 }}>{testimonial.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-cream-600)', marginTop: 2 }}>{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', borderTop: `1px solid ${BORDER}`, background: BG2 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <SphereRing />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: CREAM1, marginBottom: 16 }}>
            {t.cta_section.title}
          </h2>
          <p style={{ fontSize: 16, color: CREAM4, lineHeight: 1.7, marginBottom: 36 }}>{t.cta_section.description}</p>
          <Link
            href="/cockpit"
            style={{
              display: 'inline-block',
              padding: '16px 40px', fontSize: 16, fontWeight: 800,
              background: GOLD6, color: BG,
              borderRadius: 8, textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            {t.cta_section.button}
          </Link>
          <p style={{ fontSize: 12, color: CREAM4, marginTop: 16 }}>
            {language === 'es' ? 'Sin tarjeta de crédito · Sin compromisos · Cancela cuando quieras' : 'No credit card · No commitments · Cancel anytime'}
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: CREAM4, textAlign: 'center' }}>{t.footer.tagline}</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(t.footer.links).map(([key, label]) => (
              <a key={key} href="#" style={{ fontSize: 13, color: CREAM4, textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-cream-600)' }}>
            © 2026 KUPURI MEDIA™ · Synthia™ 3.0 · Sistema Operativo para Empresarias de Latinoamérica
          </div>
        </div>
      </footer>
    </div>
  );
}
