"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              S
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">SYNTHIA™</h1>
              <p className="text-[10px] text-slate-400">3.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {language === 'es' ? 'English' : 'Español'}
            </button>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {t.hero.title}
          </h2>
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/dashboard" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg transition-colors text-lg inline-block">
              {t.hero.cta}
            </a>
            <a href="/skills" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg transition-colors text-lg border border-slate-700 inline-block">
              {t.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.pain_points.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.pain_points.problems.map((problem, idx) => (
              <div key={idx} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/50 transition-colors">
                <h4 className="text-xl font-bold mb-3">{problem.title}</h4>
                <p className="text-slate-300">{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-6">{t.solution.title}</h3>
          <p className="text-center text-lg text-slate-300 mb-16 max-w-3xl mx-auto">{t.solution.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.solution.features.map((feature, idx) => (
              <div key={idx} className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-emerald-400">{feature.title}</h4>
                <p className="text-slate-300">{feature.desc}</p>
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
            {t.stats.stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-black text-emerald-400 mb-2">{stat.number}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.pricing.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.plans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 border-emerald-500/50 transform scale-105'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-slate-400 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-emerald-400">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/dashboard" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg transition-colors block text-center">
                  {t.hero.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16">{t.testimonials.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-2xl p-12">
          <h3 className="text-3xl font-black mb-4">{t.cta_section.title}</h3>
          <p className="text-lg text-slate-300 mb-8">{t.cta_section.description}</p>
          <a href="/dashboard" className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg transition-colors text-lg">
            {t.cta_section.button}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-400 mb-8">{t.footer.tagline}</p>
          <div className="flex justify-center gap-8 text-sm">
            <a href="#" className="text-slate-400 hover:text-slate-300">{t.footer.links.docs}</a>
            <a href="#" className="text-slate-400 hover:text-slate-300">{t.footer.links.contact}</a>
            <a href="#" className="text-slate-400 hover:text-slate-300">{t.footer.links.privacy}</a>
            <a href="#" className="text-slate-400 hover:text-slate-300">{t.footer.links.terms}</a>
          </div>
          <div className="text-center text-xs text-slate-500 mt-8">
            © 2026 KUPURI MEDIA™ | Synthia™ 3.0 - Sistema Operativo para Empresarias
          </div>
        </div>
      </footer>
    </div>
  );
}
