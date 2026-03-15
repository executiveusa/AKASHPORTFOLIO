"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

export default function SynthiaLandingPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const content = {
    es: {
      nav: {
        enter: "Entrar al Sistema",
        lang: "English"
      },
      hero: {
        tagline: "Synthia™ 3.0",
        title: "Tu negocio,\ncorriendo solo\nmientras descansas.",
        subtitle: "Synthia™ es tu equipo de agentes IA que trabaja 24/7 — responde emails, crea contenido, gestiona clientes, y te manda un resumen cada mañana por WhatsApp. En español.",
        primaryCta: "Ver cómo funciona",
        secondaryCta: "Ver la Sala del Consejo en 3D →",
        secondaryHint: "No requiere cuenta"
      },
      pain: {
        label: "¿Te suena familiar?",
        title: "Llevas el negocio sola y se nota.",
        problems: [
          {
            title: "Tareas que no terminan",
            desc: "Emails, facturas, publicaciones, reportes. Son horas de trabajo que no te pagan por hacer."
          },
          {
            title: "Contenido que se te acumula",
            desc: "Sabes que debes publicar en TikTok e Instagram, pero entre una cosa y otra, pasan semanas."
          },
          {
            title: "Todo en plataformas distintas",
            desc: "Tu agenda aquí, tus clientes allá, tus pagos en otro lado. Nada está en un solo lugar."
          },
          {
            title: "No sabes qué está funcionando",
            desc: "Trabajas muchísimo pero no tienes forma de saber qué acciones realmente mueven el negocio."
          }
        ]
      },
      solution: {
        label: "La solución",
        title: "Conoce a tu equipo invisible.",
        subtitle: "Synthia™ coordina a tus agentes de IA para que hagan el trabajo operativo mientras tú te concentras en lo que más importa — crear, vender y crecer.",
        features: [
          {
            agent: "ALEX™",
            role: "Tu Jefa de Gabinete",
            desc: "Te llama por WhatsApp cada mañana con el resumen del día. Le puedes responder por voz, en español, y ella coordina al resto del equipo.",
            action: "Habla con ALEX™ →",
            href: "/alex"
          },
          {
            agent: "Sala del Consejo",
            role: "Reuniones en 3D",
            desc: "Tus agentes se reúnen en el Kiosco Morisco, el Zócalo, o Los Manantiales de Xochimilco — ubicaciones icónicas de Ciudad de México — para coordinar tu negocio.",
            action: "Ver la Sala →",
            href: "/theater"
          },
          {
            agent: "Dra. Cultura",
            role: "Contenido sin parar",
            desc: "TikTok, Instagram, LinkedIn. Tu agente de contenido crea, programa y publica — con tu voz y tu estilo.",
            action: null,
            href: null
          },
          {
            agent: "Contadora",
            role: "Dinero bajo control",
            desc: "Factura en Stripe, cobra en PayPal o crypto, y recibe reportes financieros automáticos. Sin hojas de cálculo.",
            action: null,
            href: null
          },
          {
            agent: "850+ conexiones",
            role: "Todo conectado",
            desc: "Gmail, Drive, Notion, Slack, Shopify, Calendly, y 840+ herramientas más. Se conectan solas, sin necesidad de configurar nada.",
            action: null,
            href: null
          },
          {
            agent: "Cazadora",
            role: "Clientes nuevos, solos",
            desc: "Tu agente busca proyectos en Upwork y Workana, escribe propuestas con tu tono y las manda por ti. Tú solo firmas.",
            action: null,
            href: null
          }
        ]
      },
      stats: {
        label: "Resultados reales",
        title: "Números que hablan.",
        items: [
          { number: "10 hrs", label: "recuperadas por semana, en promedio" },
          { number: "3x", label: "retorno en los primeros 3 meses" },
          { number: "850+", label: "herramientas conectadas vía Composio" },
          { number: "24/7", label: "agentes trabajando mientras descansas" }
        ]
      },
      agents: {
        label: "El equipo",
        title: "Personas reales. Agentes reales.",
        subtitle: "Cada agente tiene un nombre, un rol, y una personalidad. No son bots genéricos — son especialistas en tu negocio.",
        roster: [
          { name: "ALEX™", role: "Jefa de Gabinete", color: "#f5d78c", desc: "Coordinadora General. Tu primer punto de contacto cada mañana." },
          { name: "Dr. Economía", role: "Análisis Financiero", color: "#c9a84c", desc: "Monitorea forex LATAM, arbitraje, y reportes de ingresos." },
          { name: "Dra. Cultura", role: "Estrategia de Contenido", color: "#b8a485", desc: "Crea contenido en tu voz para redes sociales y blog." },
          { name: "Ing. Teknos", role: "Arquitectura y Sistemas", color: "#f5efe4", desc: "Supervisa la infraestructura y automatiza procesos técnicos." },
          { name: "Cazadora", role: "Freelance & Clientes", color: "#f5d78c", desc: "Busca proyectos, escribe propuestas, gestiona relaciones." }
        ]
      },
      pricing: {
        label: "Planes",
        title: "Elige tu equipo.",
        plans: [
          {
            name: "Starter",
            price: "$299",
            period: "/año",
            desc: "Para solopreneurs que quieren empezar a delegar.",
            features: [
              "5 agentes simultáneos",
              "20 habilidades incluidas",
              "Resumen diario por WhatsApp",
              "Soporte por email"
            ],
            cta: "Solicitar Acceso",
            highlighted: false
          },
          {
            name: "Growth",
            price: "$899",
            period: "/año",
            desc: "Para equipos de 2–5 personas o agencias en crecimiento.",
            features: [
              "20 agentes simultáneos",
              "50 habilidades incluidas",
              "Sala del Consejo en 3D",
              "Gestión de múltiples clientes",
              "Soporte prioritario"
            ],
            cta: "Solicitar Acceso",
            highlighted: true
          },
          {
            name: "Professional",
            price: "$1,999",
            period: "/año",
            desc: "Para agencias y empresas que quieren escalar sin límites.",
            features: [
              "100+ agentes simultáneos",
              "850+ herramientas conectadas",
              "API personalizada",
              "White-label (tu marca)",
              "Soporte 24/7 dedicado"
            ],
            cta: "Hablar con el Equipo",
            highlighted: false
          }
        ]
      },
      testimonials: {
        label: "Lo que dicen",
        title: "Mujeres reales. Resultados reales.",
        subtitle: "Empresarias, diseñadoras y consultoras en LATAM que ya usan Synthia™.",
        items: [
          {
            name: "María González",
            role: "Fundadora, Agencia Digital CDMX",
            location: "Ciudad de México",
            quote: "Pasaba 40 horas semanales en tareas administrativas. Ahora trabajo 20 y gano el doble. ALEX™ me manda el resumen del día antes de que despierte."
          },
          {
            name: "Sofía Rodríguez",
            role: "Coach Empresarial",
            location: "Puerto Rico",
            quote: "Mis clientes creen que soy sobrehumana porque siempre respondo rápido y tengo contenido listo. Pero es Dra. Cultura quien lo hace. Yo solo superviso."
          },
          {
            name: "Carmen Álvarez",
            role: "Consultora de Marca",
            location: "Seattle, USA",
            quote: "De consultoría individual a agencia de 15 personas en 6 meses. Synthia™ escaló el negocio sin que yo contratara a nadie directamente."
          }
        ]
      },
      cta: {
        title: "¿Lista para que alguien más lleve la operación?",
        subtitle: "30 días gratis. Sin tarjeta de crédito. Sin compromisos.",
        primary: "Solicitar Acceso Temprano",
        secondary: "Ver la Sala del Consejo en 3D",
        note: "Solo 50 lugares disponibles en la primera ronda."
      },
      footer: {
        tagline: "Synthia™ 3.0 — Para empresarias, diseñadoras y creativas de América Latina.",
        madeBy: "Hecho con amor por",
        brand: "Kupuri Media™",
        links: ["Documentación", "Contacto", "Privacidad", "Términos"]
      }
    },
    en: {
      nav: {
        enter: "Enter System",
        lang: "Español"
      },
      hero: {
        tagline: "Synthia™ 3.0",
        title: "Your business,\nrunning itself\nwhile you rest.",
        subtitle: "Synthia™ is your AI agent team working 24/7 — answering emails, creating content, managing clients, and sending you a morning summary on WhatsApp. In your language.",
        primaryCta: "See how it works",
        secondaryCta: "See the 3D Council Chamber →",
        secondaryHint: "No account needed"
      },
      pain: {
        label: "Sound familiar?",
        title: "You're running it alone. And it shows.",
        problems: [
          {
            title: "Tasks that never end",
            desc: "Emails, invoices, posts, reports. Hours of work that don't pay you directly for doing them."
          },
          {
            title: "Content that keeps piling up",
            desc: "You know you should post on TikTok and Instagram, but between one thing and another, weeks go by."
          },
          {
            title: "Everything in different places",
            desc: "Calendar here, clients there, payments somewhere else. Nothing is in one place."
          },
          {
            title: "No idea what's working",
            desc: "You work incredibly hard but have no way to know which actions actually move the business forward."
          }
        ]
      },
      solution: {
        label: "The solution",
        title: "Meet your invisible team.",
        subtitle: "Synthia™ coordinates your AI agents to handle the operational work so you can focus on what matters — creating, selling, and growing.",
        features: [
          {
            agent: "ALEX™",
            role: "Your Chief of Staff",
            desc: "Calls you on WhatsApp every morning with a daily summary. You can reply by voice in Spanish or English, and she coordinates the rest of the team.",
            action: "Talk to ALEX™ →",
            href: "/alex"
          },
          {
            agent: "Council Chamber",
            role: "3D Meetings",
            desc: "Your agents meet at the Kiosco Morisco, Zócalo rooftop, or Los Manantiales in Xochimilco — iconic Mexico City locations — to coordinate your business.",
            action: "See the Chamber →",
            href: "/theater"
          },
          {
            agent: "Dra. Cultura",
            role: "Content on autopilot",
            desc: "TikTok, Instagram, LinkedIn. Your content agent creates, schedules, and publishes — in your voice and style.",
            action: null,
            href: null
          },
          {
            agent: "Contadora",
            role: "Money under control",
            desc: "Invoice via Stripe, collect via PayPal or crypto, and receive automatic financial reports. No spreadsheets.",
            action: null,
            href: null
          },
          {
            agent: "850+ connections",
            role: "Everything connected",
            desc: "Gmail, Drive, Notion, Slack, Shopify, Calendly, and 840+ more tools. They connect automatically, no setup needed.",
            action: null,
            href: null
          },
          {
            agent: "Cazadora",
            role: "New clients, on their own",
            desc: "Your agent finds projects on Upwork and Workana, writes proposals in your tone, and sends them. You just sign.",
            action: null,
            href: null
          }
        ]
      },
      stats: {
        label: "Real results",
        title: "Numbers that speak.",
        items: [
          { number: "10 hrs", label: "recovered per week, on average" },
          { number: "3x", label: "return in the first 3 months" },
          { number: "850+", label: "tools connected via Composio" },
          { number: "24/7", label: "agents working while you rest" }
        ]
      },
      agents: {
        label: "The team",
        title: "Real names. Real agents.",
        subtitle: "Each agent has a name, a role, and a personality. Not generic bots — specialists in your business.",
        roster: [
          { name: "ALEX™", role: "Chief of Staff", color: "#f5d78c", desc: "General Coordinator. Your first point of contact every morning." },
          { name: "Dr. Economía", role: "Financial Analysis", color: "#c9a84c", desc: "Monitors LATAM forex, arbitrage, and income reports." },
          { name: "Dra. Cultura", role: "Content Strategy", color: "#b8a485", desc: "Creates content in your voice for social media and blog." },
          { name: "Ing. Teknos", role: "Architecture & Systems", color: "#f5efe4", desc: "Oversees infrastructure and automates technical processes." },
          { name: "Cazadora", role: "Freelance & Clients", color: "#f5d78c", desc: "Finds projects, writes proposals, manages relationships." }
        ]
      },
      pricing: {
        label: "Plans",
        title: "Choose your team.",
        plans: [
          {
            name: "Starter",
            price: "$299",
            period: "/year",
            desc: "For solopreneurs ready to start delegating.",
            features: [
              "5 concurrent agents",
              "20 skills included",
              "Daily WhatsApp summary",
              "Email support"
            ],
            cta: "Request Access",
            highlighted: false
          },
          {
            name: "Growth",
            price: "$899",
            period: "/year",
            desc: "For teams of 2–5 or growing agencies.",
            features: [
              "20 concurrent agents",
              "50 skills included",
              "3D Council Chamber",
              "Multi-client management",
              "Priority support"
            ],
            cta: "Request Access",
            highlighted: true
          },
          {
            name: "Professional",
            price: "$1,999",
            period: "/year",
            desc: "For agencies and enterprises that want to scale without limits.",
            features: [
              "100+ concurrent agents",
              "850+ connected tools",
              "Custom API",
              "White-label (your brand)",
              "Dedicated 24/7 support"
            ],
            cta: "Talk to the Team",
            highlighted: false
          }
        ]
      },
      testimonials: {
        label: "What they say",
        title: "Real women. Real results.",
        subtitle: "Entrepreneurs, designers and consultants in LATAM already using Synthia™.",
        items: [
          {
            name: "María González",
            role: "Founder, Digital Agency CDMX",
            location: "Mexico City",
            quote: "I was spending 40 hours a week on admin tasks. Now I work 20 and earn double. ALEX™ sends me the daily summary before I even wake up."
          },
          {
            name: "Sofía Rodríguez",
            role: "Business Coach",
            location: "Puerto Rico",
            quote: "My clients think I'm superhuman because I always reply fast and always have content ready. But it's Dra. Cultura doing it. I just supervise."
          },
          {
            name: "Carmen Álvarez",
            role: "Brand Consultant",
            location: "Seattle, USA",
            quote: "From solo consultant to a 15-person agency in 6 months. Synthia™ scaled the business without me hiring anyone directly."
          }
        ]
      },
      cta: {
        title: "Ready for someone else to run the operation?",
        subtitle: "30 days free. No credit card. No commitment.",
        primary: "Request Early Access",
        secondary: "See the 3D Council Chamber",
        note: "Only 50 spots available in the first round."
      },
      footer: {
        tagline: "Synthia™ 3.0 — For entrepreneurs, designers and creatives in Latin America.",
        madeBy: "Made with love by",
        brand: "Kupuri Media™",
        links: ["Documentation", "Contact", "Privacy", "Terms"]
      }
    }
  };

  const t = content[language];
  const contactEmail = "mailto:hola@kuporimedia.com?subject=Synthia%203.0%20-%20Acceso%20Temprano";

  return (
    <div style={{ backgroundColor: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', minHeight: '100vh' }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: 'var(--color-charcoal-900)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-gold-600) 30%, transparent)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px',
              backgroundColor: 'var(--color-gold-400)',
              color: 'var(--color-charcoal-900)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '14px', borderRadius: '2px'
            }}>S</div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--color-cream-100)' }}>SYNTHIA™</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: 'var(--color-cream-400)', textTransform: 'uppercase' }}>3.0 // KUPURI MEDIA™</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: '700',
                backgroundColor: 'var(--color-charcoal-800)',
                border: '1px solid color-mix(in srgb, var(--color-gold-600) 40%, transparent)',
                color: 'var(--color-cream-400)', cursor: 'pointer', borderRadius: '2px',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}
            >
              {t.nav.lang}
            </button>
            <Link href="/dashboard" style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: '700',
              backgroundColor: 'var(--color-gold-400)',
              color: 'var(--color-charcoal-900)',
              textDecoration: 'none', borderRadius: '2px',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              {t.nav.enter}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            {t.hero.tagline}
          </div>
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: '900', lineHeight: '1.05',
            letterSpacing: '-0.03em', marginBottom: '28px',
            color: 'var(--color-cream-100)',
            whiteSpace: 'pre-line'
          }}>
            {t.hero.title}
          </h1>
          <p style={{
            fontSize: '18px', lineHeight: '1.7', color: 'var(--color-cream-400)',
            maxWidth: '560px', marginBottom: '40px'
          }}>
            {t.hero.subtitle}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <a href="#features" style={{
              padding: '14px 28px', fontSize: '14px', fontWeight: '700',
              backgroundColor: 'var(--color-gold-400)',
              color: 'var(--color-charcoal-900)',
              textDecoration: 'none', borderRadius: '2px',
              letterSpacing: '0.03em'
            }}>
              {t.hero.primaryCta}
            </a>
            <div>
              <Link href="/theater" style={{
                fontSize: '14px', fontWeight: '600',
                color: 'var(--color-gold-400)', textDecoration: 'none',
              }}>
                {t.hero.secondaryCta}
              </Link>
              <div style={{ fontSize: '11px', color: 'var(--color-cream-400)', marginTop: '4px' }}>
                {t.hero.secondaryHint}
              </div>
            </div>
          </div>

          {/* Lady at rest — visual metaphor */}
          <div style={{
            marginTop: '64px',
            padding: '32px 40px',
            backgroundColor: 'var(--color-charcoal-800)',
            border: '1px solid color-mix(in srgb, var(--color-gold-600) 25%, transparent)',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 auto' }}>
                {/* Abstract figure — founder at rest, reading */}
                <div style={{
                  width: '80px', height: '80px',
                  backgroundColor: 'var(--color-charcoal-700)',
                  border: '1px solid color-mix(in srgb, var(--color-gold-400) 30%, transparent)',
                  borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px'
                }}>
                  📖
                </div>
              </div>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--color-gold-400)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>
                  {language === 'es' ? 'Mientras tú lees esto' : 'While you read this'}
                </div>
                <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--color-cream-400)' }}>
                  {language === 'es'
                    ? 'Tus agentes ya están revisando tu bandeja de entrada, buscando clientes nuevos en Upwork, programando contenido para la semana, y preparando tu resumen financiero del mes.'
                    : 'Your agents are already checking your inbox, searching for new clients on Upwork, scheduling content for the week, and preparing your monthly financial summary.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-charcoal-800)' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.pain.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '48px', color: 'var(--color-cream-100)', maxWidth: '600px' }}>
            {t.pain.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', backgroundColor: 'color-mix(in srgb, var(--color-gold-600) 20%, transparent)' }}>
            {t.pain.problems.map((p, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'var(--color-charcoal-800)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-cream-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px' }}>
                  0{i + 1}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-cream-100)', marginBottom: '12px' }}>{p.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--color-cream-400)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.solution.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-cream-100)', maxWidth: '600px' }}>
            {t.solution.title}
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--color-cream-400)', maxWidth: '520px', marginBottom: '56px' }}>
            {t.solution.subtitle}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2px', backgroundColor: 'color-mix(in srgb, var(--color-gold-600) 15%, transparent)' }}>
            {t.solution.features.map((f, i) => (
              <div key={i} style={{
                padding: '32px',
                backgroundColor: 'var(--color-charcoal-900)',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                      {f.agent}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-cream-100)' }}>{f.role}</h3>
                  </div>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--color-cream-400)', flex: 1 }}>{f.desc}</p>
                {f.action && f.href && (
                  <Link href={f.href} style={{
                    fontSize: '12px', fontWeight: '700', color: 'var(--color-gold-400)',
                    textDecoration: 'none', letterSpacing: '0.05em',
                    display: 'inline-block', marginTop: '4px'
                  }}>
                    {f.action}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-charcoal-800)', borderTop: '1px solid color-mix(in srgb, var(--color-gold-600) 20%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--color-gold-600) 20%, transparent)' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.stats.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '48px', color: 'var(--color-cream-100)' }}>
            {t.stats.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '40px' }}>
            {t.stats.items.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', color: 'var(--color-gold-400)', letterSpacing: '-0.03em', lineHeight: '1' }}>
                  {s.number}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-cream-400)', marginTop: '8px', lineHeight: '1.5' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Roster */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.agents.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-cream-100)' }}>
            {t.agents.title}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-cream-400)', marginBottom: '48px', maxWidth: '520px', lineHeight: '1.6' }}>
            {t.agents.subtitle}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {t.agents.roster.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: '24px', alignItems: 'flex-start',
                padding: '24px 0',
                borderBottom: i < t.agents.roster.length - 1 ? '1px solid color-mix(in srgb, var(--color-gold-600) 15%, transparent)' : 'none',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  backgroundColor: a.color,
                  borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-charcoal-900)',
                  fontWeight: '900', fontSize: '14px'
                }}>
                  {a.name[0]}
                </div>
                <div style={{ flex: '1', minWidth: '160px' }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-cream-100)', marginBottom: '2px' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>{a.role}</div>
                  <p style={{ fontSize: '13px', color: 'var(--color-cream-400)', lineHeight: '1.5' }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-charcoal-800)' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.pricing.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '48px', color: 'var(--color-cream-100)' }}>
            {t.pricing.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px', backgroundColor: 'color-mix(in srgb, var(--color-gold-600) 20%, transparent)' }}>
            {t.pricing.plans.map((plan, i) => (
              <div key={i} style={{
                padding: '36px 32px',
                backgroundColor: plan.highlighted ? 'var(--color-charcoal-700)' : 'var(--color-charcoal-800)',
                display: 'flex', flexDirection: 'column', gap: '0',
                position: 'relative'
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    fontSize: '9px', letterSpacing: '0.3em', fontWeight: '700',
                    color: 'var(--color-charcoal-900)',
                    backgroundColor: 'var(--color-gold-400)',
                    padding: '3px 8px', textTransform: 'uppercase', borderRadius: '2px'
                  }}>
                    {language === 'es' ? 'Más popular' : 'Most popular'}
                  </div>
                )}
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-cream-100)', marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-cream-400)', marginBottom: '24px' }}>{plan.desc}</div>
                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '44px', fontWeight: '900', color: 'var(--color-gold-400)', letterSpacing: '-0.03em', lineHeight: '1' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-cream-400)', marginLeft: '4px' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-gold-400)', fontWeight: '700', flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-cream-200)', lineHeight: '1.4' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={contactEmail} style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', fontSize: '12px', fontWeight: '700',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  backgroundColor: plan.highlighted ? 'var(--color-gold-400)' : 'transparent',
                  color: plan.highlighted ? 'var(--color-charcoal-900)' : 'var(--color-gold-400)',
                  border: plan.highlighted ? 'none' : '1px solid color-mix(in srgb, var(--color-gold-600) 50%, transparent)',
                  borderRadius: '2px'
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'var(--color-gold-400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>
            {t.testimonials.label}
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-cream-100)' }}>
            {t.testimonials.title}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-cream-400)', marginBottom: '48px' }}>
            {t.testimonials.subtitle}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px', backgroundColor: 'color-mix(in srgb, var(--color-gold-600) 15%, transparent)' }}>
            {t.testimonials.items.map((item, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'var(--color-charcoal-900)' }}>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-cream-200)', marginBottom: '24px', fontStyle: 'italic' }}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-cream-100)' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-cream-400)', marginTop: '2px' }}>{item.role}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gold-600)', marginTop: '2px', letterSpacing: '0.1em' }}>{item.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-charcoal-800)', borderTop: '1px solid color-mix(in srgb, var(--color-gold-600) 25%, transparent)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-cream-100)' }}>
            {t.cta.title}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-cream-400)', marginBottom: '8px' }}>{t.cta.subtitle}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-gold-600)', marginBottom: '36px', letterSpacing: '0.05em', fontWeight: '700' }}>
            {t.cta.note}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <a href={contactEmail} style={{
              padding: '14px 28px', fontSize: '14px', fontWeight: '700',
              backgroundColor: 'var(--color-gold-400)',
              color: 'var(--color-charcoal-900)',
              textDecoration: 'none', borderRadius: '2px',
              letterSpacing: '0.03em'
            }}>
              {t.cta.primary}
            </a>
            <Link href="/theater" style={{
              padding: '14px 28px', fontSize: '14px', fontWeight: '700',
              border: '1px solid color-mix(in srgb, var(--color-gold-600) 50%, transparent)',
              color: 'var(--color-gold-400)',
              textDecoration: 'none', borderRadius: '2px',
              letterSpacing: '0.03em'
            }}>
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        borderTop: '1px solid color-mix(in srgb, var(--color-gold-600) 20%, transparent)',
        backgroundColor: 'var(--color-charcoal-900)'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-cream-400)', maxWidth: '400px', lineHeight: '1.6' }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {t.footer.links.map((link, i) => (
                <a key={i} href="#" style={{ fontSize: '12px', color: 'var(--color-cream-400)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal-700)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}
               className="text-charcoal-600">
            <span style={{ color: 'var(--color-cream-400)', opacity: 0.4 }}>© 2026 {t.footer.madeBy} <strong style={{ color: 'var(--color-gold-600)' }}>{t.footer.brand}</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
