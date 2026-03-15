"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

export default function AlexLandingPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const content = {
    es: {
      hero: {
        title: "Mientras tú duermes, ALEX™ trabaja.",
        subtitle: "El socio de negocios de IA diseñado para empresarias latinoamericanas",
        description: "Sin código. Sin complicaciones. Activo en 10 minutos.",
        cta: "Habla con ALEX™ Ahora — 14 Días Gratis",
        secondaryCta: "Ver Demo en WhatsApp"
      },
      pain_points: {
        title: "¿Cuál es tu mayor dolor?",
        problems: [
          {
            icon: "💬",
            title: "Mis WhatsApps me consumen el día",
            problem: "Pasas horas respondiendo mensajes cuando deberías estar creciendo",
            solution: "ALEX™ los responde como tú, en tu voz, cuando no puedes."
          },
          {
            icon: "📱",
            title: "No tengo tiempo para redes sociales",
            problem: "La gente dice que tengo que estar en TikTok, Instagram, LinkedIn...",
            solution: "ALEX™ programa un mes de contenido en 10 minutos."
          },
          {
            icon: "📊",
            title: "No sé qué está pasando en mi negocio",
            problem: "Al despertar, no sabes tus oportunidades, leads, ni próximas juntas",
            solution: "ALEX™ te manda un briefing cada mañana con todo lo que necesitas."
          },
          {
            icon: "🎯",
            title: "Hago todo yo sola",
            problem: "No puedes delegar porque nadie entiende tu negocio como tú",
            solution: "ALEX™ aprende tu voz, delega, ejecuta, y reporta. Tú solo apruebas."
          },
          {
            icon: "🚀",
            title: "Mis competidoras ya usan IA",
            problem: "Te preocupa quedarte atrás sin saber por dónde empezar",
            solution: "En 10 minutos ALEX™ está activo. No necesitas saber de tecnología."
          }
        ]
      },
      howItWorks: {
        title: "Cómo funciona ALEX™",
        steps: [
          {
            number: "1",
            title: "Cuéntale a ALEX™ quién eres",
            description: "5 minutos: tu nombre, negocio, y qué haces. ALEX™ aprende."
          },
          {
            number: "2",
            title: "ALEX™ aprende tu voz",
            description: "Primeras 48 horas: ALEX™ entiende tu cliente, tus objetivos, cómo hablas."
          },
          {
            number: "3",
            title: "ALEX™ trabaja. Tú creces.",
            description: "Para siempre: responde WhatsApps, publica contenido, reporta resultados."
          }
        ]
      },
      socialProof: {
        title: "Lo que dicen las empresarias que ya usan ALEX™",
        testimonials: [
          {
            name: "María G.",
            role: "Coach Empresarial, CDMX",
            quote: "Pasé de trabajar 70 horas a 40. Mis ventas subieron 40% en 90 días.",
            location: "México City"
          },
          {
            name: "Sofía R.",
            role: "Dueña Boutique, Monterrey",
            quote: "ALEX™ responde mis clientes en WhatsApp mientras duermo. Esto es magia.",
            location: "Monterrey"
          },
          {
            name: "Carmen A.",
            role: "Consultora, Bogotá",
            quote: "De ser yo sola a tener un equipo invisible de 5 personas. Sin contratar a nadie.",
            location: "Bogotá"
          }
        ]
      },
      stats: {
        title: "¿Cuánto vale?",
        metrics: [
          {
            number: "10 horas",
            label: "Recuperadas por semana"
          },
          {
            number: "40%",
            label: "Aumento promedio en ventas"
          },
          {
            number: "50+",
            label: "Habilidades (skills) incluidas"
          },
          {
            number: "24/7",
            label: "ALEX™ trabaja sin descanso"
          }
        ]
      },
      pricing: {
        title: "Planes para cada etapa",
        description: "Un asistente humano cuesta $15,000 MXN/mes. ALEX™ cuesta...",
        plans: [
          {
            name: "ALEX™ Lite",
            price: "Gratis",
            period: "14 días de prueba",
            description: "Para probar sin riesgo",
            valueStack: [
              { item: "ALEX™ vía WhatsApp (5 tareas/mes)", value: "$97/mes" },
              { item: "3 skills incluidas", value: "$97/mes" },
              { item: "Dashboard básico", value: "$97/mes" },
              { divider: true }
            ],
            total: "$291/mes",
            yourPrice: "GRATIS 14 DÍAS",
            features: [
              "Acceso a ALEX™ por WhatsApp",
              "3 skills básicas",
              "Dashboard simplificado",
              "Sin tarjeta de crédito"
            ],
            cta: "Prueba Gratis 14 Días"
          },
          {
            name: "ALEX™ Starter™",
            price: "$47",
            period: "USD/mes | $397/año (ahorra $167)",
            description: "Para empresarias que quieren crecer",
            valueStack: [
              { item: "ALEX™ con 25 skills", value: "$497/mes" },
              { item: "Briefing matutino diario", value: "$97/mes" },
              { item: "Integración WhatsApp", value: "$97/mes" },
              { item: "Respuestas en español", value: "$149/mes" },
              { item: "Guía onboarding 30 días", value: "$197/mes" },
              { divider: true }
            ],
            total: "$1,037/mes",
            yourPrice: "$47/mes",
            savings: "Ahorras: $990/mes",
            features: [
              "25 skills (marketing, ventas, ops)",
              "Briefing ejecutivo 8am CDMX",
              "Respuestas WhatsApp automáticas",
              "Acceso dashboard Synthia™",
              "Garantía: 14 días dinero de vuelta"
            ],
            cta: "Activa Starter™ Ahora",
            highlighted: true
          },
          {
            name: "SYNTHIA™ Growth",
            price: "$147",
            period: "USD/mes | $1,197/año (ahorra $567)",
            description: "Para agencias y equipos",
            valueStack: [
              { item: "Dashboard Synthia™ 3.0™ completo", value: "$497/mes" },
              { item: "100+ skills", value: "$397/mes" },
              { item: "KUPURI™ Social Studio", value: "$297/mes" },
              { item: "3 cuentas de cliente", value: "$297/mes" },
              { item: "Acceso por voz", value: "$197/mes" },
              { item: "Google Trends briefings", value: "$97/mes" },
              { divider: true }
            ],
            total: "$2,976/mes",
            yourPrice: "$147/mes",
            savings: "Ahorras: $2,829/mes",
            features: [
              "Todos los 100+ skills",
              "Dashboard ejecutivo completo",
              "3 cuentas de cliente incluidas",
              "Acceso por voz en español",
              "Integración redes sociales",
              "Garantía: 30 días dinero de vuelta"
            ],
            cta: "Activa Growth Ahora"
          },
          {
            name: "SYNTHIA™ Agency™",
            price: "$497",
            period: "USD/mes | $3,997/año (ahorra $1,967)",
            description: "Para agencias, white-label",
            valueStack: [
              { item: "White-label completo (tu marca)", value: "$997/mes" },
              { item: "Clientes ilimitados", value: "$697/mes" },
              { item: "KUPURI™ Agenda (Cal.com)", value: "$297/mes" },
              { item: "ALEX™ Conversaciones (Chatwoot)", value: "$297/mes" },
              { item: "Cámara del Consejo 3D", value: "$497/mes" },
              { item: "2 sesiones onboarding dedicado", value: "$594/mes" },
              { item: "Programa revendedor (30% comisión)", value: "∞" },
              { divider: true }
            ],
            total: "$5,376+/mes",
            yourPrice: "$497/mes",
            savings: "Ahorras: $4,879+/mes",
            features: [
              "White-label: tu marca, no Kupuri™",
              "Clientes ilimitados",
              "KUPURI™ Agenda + Conversaciones",
              "Cámara del Consejo 3D Observable",
              "Programa de revendedor (30%)",
              "Soporte dedicado 24/7",
              "Garantía: 60 días dinero de vuelta"
            ],
            cta: "Activa Agency™ Ahora"
          }
        ]
      },
      guarantee: {
        title: "14 días sin riesgo. O tu dinero de vuelta.",
        description: "Si no ves resultados en 14 días, te devolvemos cada peso. Sin preguntas. Sin burocracia. Así de seguros estamos.",
        bullets: [
          "✓ Dinero devuelto en 24 horas",
          "✓ Sin preguntas, sin explicaciones",
          "✓ Cancela cuando quieras"
        ]
      },
      finalCta: {
        title: "¿Cuánto vale 10 horas extra a la semana?",
        subtitle: "ALEX™ ya está esperando para trabajar por ti.",
        button: "Activa tu ALEX™ — 14 días gratis"
      },
      footer: {
        tagline: "ALEX™ // Tu primer empleado de IA // Creado por Kupuri Media™",
        copyright: "© 2026 KUPURI MEDIA™ | ALEX™ - Socio de Negocios de IA"
      }
    },
    en: {
      hero: {
        title: "While you sleep, ALEX™ works.",
        subtitle: "The AI business partner designed for Latin American entrepreneurs",
        description: "No code. No complications. Active in 10 minutes.",
        cta: "Talk to ALEX™ Now — 14 Days Free",
        secondaryCta: "See Demo on WhatsApp"
      },
      pain_points: {
        title: "What's your biggest pain?",
        problems: [
          {
            icon: "💬",
            title: "My WhatsApps consume my entire day",
            problem: "You spend hours replying when you should be growing",
            solution: "ALEX™ answers them like you, in your voice, whenever you need."
          },
          {
            icon: "📱",
            title: "I don't have time for social media",
            problem: "People say I need to be on TikTok, Instagram, LinkedIn...",
            solution: "ALEX™ schedules a month of content in 10 minutes."
          },
          {
            icon: "📊",
            title: "I don't know what's happening in my business",
            problem: "When you wake up, you don't know your opportunities, leads, or next meetings",
            solution: "ALEX™ sends you a briefing every morning with everything you need."
          },
          {
            icon: "🎯",
            title: "I do everything myself",
            problem: "You can't delegate because nobody understands your business like you",
            solution: "ALEX™ learns your voice, delegates, executes, and reports. You just approve."
          },
          {
            icon: "🚀",
            title: "My competitors are already using AI",
            problem: "You're worried about falling behind without knowing where to start",
            solution: "ALEX™ is active in 10 minutes. You don't need to know tech."
          }
        ]
      },
      howItWorks: {
        title: "How ALEX™ works",
        steps: [
          {
            number: "1",
            title: "Tell ALEX™ who you are",
            description: "5 minutes: your name, business, and what you do. ALEX™ learns."
          },
          {
            number: "2",
            title: "ALEX™ learns your voice",
            description: "First 48 hours: ALEX™ understands your customer, goals, and how you speak."
          },
          {
            number: "3",
            title: "ALEX™ works. You grow.",
            description: "Forever: answers WhatsApps, publishes content, reports results."
          }
        ]
      },
      socialProof: {
        title: "What entrepreneurs using ALEX™ say",
        testimonials: [
          {
            name: "María G.",
            role: "Business Coach, CDMX",
            quote: "I went from 70 hours to 40 hours a week. My sales went up 40% in 90 days.",
            location: "Mexico City"
          },
          {
            name: "Sofía R.",
            role: "Boutique Owner, Monterrey",
            quote: "ALEX™ responds to my customers on WhatsApp while I sleep. This is magic.",
            location: "Monterrey"
          },
          {
            name: "Carmen A.",
            role: "Consultant, Bogotá",
            quote: "From flying solo to having an invisible team of 5. Without hiring anyone.",
            location: "Bogotá"
          }
        ]
      },
      stats: {
        title: "What's it worth?",
        metrics: [
          {
            number: "10 hours",
            label: "Recovered per week"
          },
          {
            number: "40%",
            label: "Average sales increase"
          },
          {
            number: "50+",
            label: "Skills included"
          },
          {
            number: "24/7",
            label: "ALEX™ never stops working"
          }
        ]
      },
      pricing: {
        title: "Plans for every stage",
        description: "A human assistant costs $800 USD/month. ALEX™ costs...",
        plans: [
          {
            name: "ALEX™ Lite",
            price: "Free",
            period: "14-day trial",
            description: "To test risk-free",
            valueStack: [
              { item: "ALEX™ via WhatsApp (5 tasks/month)", value: "$97/mo" },
              { item: "3 skills included", value: "$97/mo" },
              { item: "Basic dashboard", value: "$97/mo" },
              { divider: true }
            ],
            total: "$291/month",
            yourPrice: "FREE 14 DAYS",
            features: [
              "ALEX™ access via WhatsApp",
              "3 basic skills",
              "Simplified dashboard",
              "No credit card required"
            ],
            cta: "Try Free for 14 Days"
          },
          {
            name: "ALEX™ Starter™",
            price: "$47",
            period: "USD/mo | $397/year (save $167)",
            description: "For entrepreneurs who want to grow",
            valueStack: [
              { item: "ALEX™ with 25 skills", value: "$497/mo" },
              { item: "Daily morning briefing", value: "$97/mo" },
              { item: "WhatsApp integration", value: "$97/mo" },
              { item: "Spanish responses", value: "$149/mo" },
              { item: "30-day onboarding guide", value: "$197/mo" },
              { divider: true }
            ],
            total: "$1,037/month",
            yourPrice: "$47/month",
            savings: "Save: $990/month",
            features: [
              "25 skills (marketing, sales, ops)",
              "8am CDMX executive briefing",
              "Automatic WhatsApp replies",
              "Synthia™ dashboard access",
              "Guarantee: 14-day money back"
            ],
            cta: "Activate Starter™ Now",
            highlighted: true
          },
          {
            name: "SYNTHIA™ Growth",
            price: "$147",
            period: "USD/mo | $1,197/year (save $567)",
            description: "For agencies and teams",
            valueStack: [
              { item: "Full Synthia™ 3.0™ dashboard", value: "$497/mo" },
              { item: "100+ skills", value: "$397/mo" },
              { item: "KUPURI™ Social Studio", value: "$297/mo" },
              { item: "3 client accounts", value: "$297/mo" },
              { item: "Voice access", value: "$197/mo" },
              { item: "Google Trends briefings", value: "$97/mo" },
              { divider: true }
            ],
            total: "$2,976/month",
            yourPrice: "$147/month",
            savings: "Save: $2,829/month",
            features: [
              "All 100+ skills",
              "Full executive dashboard",
              "3 client accounts included",
              "Spanish voice access",
              "Social media integration",
              "Guarantee: 30-day money back"
            ],
            cta: "Activate Growth Now"
          },
          {
            name: "SYNTHIA™ Agency™",
            price: "$497",
            period: "USD/mo | $3,997/year (save $1,967)",
            description: "For agencies, white-label",
            valueStack: [
              { item: "Full white-label (your brand)", value: "$997/mo" },
              { item: "Unlimited clients", value: "$697/mo" },
              { item: "KUPURI™ Agenda (Cal.com)", value: "$297/mo" },
              { item: "ALEX™ Conversations (Chatwoot)", value: "$297/mo" },
              { item: "3D Council Chamber", value: "$497/mo" },
              { item: "2 dedicated onboarding sessions", value: "$594/mo" },
              { item: "Reseller program (30% commission)", value: "∞" },
              { divider: true }
            ],
            total: "$5,376+/month",
            yourPrice: "$497/month",
            savings: "Save: $4,879+/month",
            features: [
              "White-label: your brand, not Kupuri™",
              "Unlimited clients",
              "KUPURI™ Agenda + Conversations",
              "Observable 3D Council Chamber",
              "Reseller program (30%)",
              "24/7 dedicated support",
              "Guarantee: 60-day money back"
            ],
            cta: "Activate Agency™ Now"
          }
        ]
      },
      guarantee: {
        title: "14 days risk-free. Or your money back.",
        description: "If you don't see results in 14 days, we'll refund every dollar. No questions. No hassle. That's how confident we are.",
        bullets: [
          "✓ Refund in 24 hours",
          "✓ No questions asked",
          "✓ Cancel anytime"
        ]
      },
      finalCta: {
        title: "How much is 10 extra hours per week worth?",
        subtitle: "ALEX™ is already waiting to work for you.",
        button: "Activate your ALEX™ — 14 days free"
      },
      footer: {
        tagline: "ALEX™ // Your first AI employee // Created by Kupuri Media™",
        copyright: "© 2026 KUPURI MEDIA™ | ALEX™ - AI Business Partner"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              A
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">ALEX™</h1>
              <p className="text-[10px] text-slate-400">Tu empleado de IA</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded">
              ← {language === 'es' ? 'Dashboard' : 'Dashboard'}
            </Link>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {language === 'es' ? 'English' : 'Español'}
            </button>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            {t.hero.title}
          </h2>
          <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 font-bold rounded-lg transition-colors text-lg">
              {t.hero.cta}
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg transition-colors text-lg border border-slate-700">
              {t.hero.secondaryCta}
            </button>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.pain_points.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.pain_points.problems.map((problem, idx) => (
              <div key={idx} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 transition-colors">
                <div className="text-4xl mb-3">{problem.icon}</div>
                <h4 className="text-xl font-bold mb-2">{problem.title}</h4>
                <p className="text-slate-400 mb-3 text-sm">{problem.problem}</p>
                <p className="text-amber-300 font-semibold">{problem.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.howItWorks.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.howItWorks.steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="p-8 bg-slate-800/30 border border-slate-700 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center font-black text-slate-900 mb-4 text-xl">
                    {step.number}
                  </div>
                  <h4 className="text-lg font-bold mb-3">{step.title}</h4>
                  <p className="text-slate-300">{step.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.stats.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-black text-amber-400 mb-2">{metric.number}</p>
                <p className="text-slate-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.socialProof.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.socialProof.testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
                <p className="text-slate-200 mb-6 italic text-lg font-semibold">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-amber-400">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-4">{t.pricing.title}</h3>
          <p className="text-center text-slate-400 mb-16 text-lg">{t.pricing.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.pricing.plans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border transition-all flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500/50 transform lg:scale-105 lg:z-10'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div>
                  <h4 className="text-2xl font-bold mb-1">{plan.name}</h4>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-black text-amber-400">{plan.price}</span>
                    <span className="text-slate-400 text-xs block">{plan.period}</span>
                  </div>

                  {/* Value Stack */}
                  <div className="mb-6 p-3 bg-slate-900/50 rounded border border-slate-700/50 text-xs space-y-2">
                    {plan.valueStack.map((item, vidx) => (
                      item.divider ? (
                        <div key={vidx} className="border-t border-slate-700 pt-2 mt-2">
                          <p className="font-bold text-amber-300">Total Value: {plan.total}</p>
                          <p className="text-amber-400 font-bold">{plan.yourPrice}</p>
                          {plan.savings && <p className="text-emerald-400 text-xs">{plan.savings}</p>}
                        </div>
                      ) : (
                        <div key={vidx} className="flex justify-between items-center">
                          <span className="text-slate-300">{item.item}</span>
                          <span className="text-slate-500">{item.value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-xs">
                      <span className="text-amber-400 mt-0.5">✓</span>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href="/dashboard" className="w-full py-3 bg-amber-600 hover:bg-amber-700 font-bold rounded-lg transition-colors text-sm block text-center">
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-12">
          <h3 className="text-3xl font-black mb-4">{t.guarantee.title}</h3>
          <p className="text-lg text-slate-300 mb-8">{t.guarantee.description}</p>
          <div className="space-y-2">
            {t.guarantee.bullets.map((bullet, idx) => (
              <p key={idx} className="text-slate-300">{bullet}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-4xl font-black mb-4">{t.finalCta.title}</h3>
          <p className="text-xl text-slate-300 mb-8">{t.finalCta.subtitle}</p>
          <a href="/dashboard" className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 font-bold rounded-lg transition-colors text-lg">
            {t.finalCta.button}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-400 mb-8">{t.footer.tagline}</p>
          <div className="text-center text-xs text-slate-500">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
