"use client";

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/Footer';

const SKILLS = [
  // TIER 1 — WOW SKILLS
  { id: '1', name_es: 'WhatsApp Auto-Reply', name_en: 'WhatsApp Auto-Reply', category: 'sales', pain_point: 'No puedo contestar todo el día', tier: 'Starter' },
  { id: '2', name_es: 'Content Calendar Generator', name_en: 'Content Calendar Generator', category: 'marketing', pain_point: 'No tengo tiempo para redes', tier: 'Starter' },
  { id: '3', name_es: 'Morning Daily Brief', name_en: 'Morning Daily Brief', category: 'research', pain_point: 'No sé qué está pasando en mi negocio', tier: 'Starter' },
  { id: '4', name_es: 'Lead Qualifier', name_en: 'Lead Qualifier', category: 'sales', pain_point: 'No sé si un cliente es serio', tier: 'Starter' },
  { id: '5', name_es: 'Meeting Notes → Action Items', name_en: 'Meeting Notes → Action Items', category: 'operations', pain_point: 'Salgo de juntas sin claridad', tier: 'Starter' },

  // TIER 2 — SALES & REVENUE
  { id: '6', name_es: 'Email Sequence Writer (ES)', name_en: 'Email Sequence Writer (ES)', category: 'sales', pain_point: 'Nurturing leads en español', tier: 'Starter' },
  { id: '7', name_es: 'Sales Proposal Generator', name_en: 'Sales Proposal Generator', category: 'sales', pain_point: 'Propuestas personalizadas en minutos', tier: 'Growth' },
  { id: '8', name_es: 'Follow-up Automation', name_en: 'Follow-up Automation', category: 'sales', pain_point: 'Se me olvida dar seguimiento', tier: 'Starter' },
  { id: '9', name_es: 'Invoice Generator', name_en: 'Invoice Generator', category: 'finance', pain_point: 'Odio hacer facturas', tier: 'Starter' },
  { id: '10', name_es: 'Price Objection Handler', name_en: 'Price Objection Handler', category: 'sales', pain_point: 'No sé cómo manejar objeciones', tier: 'Starter' },

  // TIER 3 — OPERATIONS
  { id: '11', name_es: 'Calendar Booking (Cal.com)', name_en: 'Calendar Booking (Cal.com)', category: 'operations', pain_point: 'Coordinar citas me roba horas', tier: 'Growth' },
  { id: '12', name_es: 'Task Delegation', name_en: 'Task Delegation', category: 'operations', pain_point: 'No sé cómo delegar', tier: 'Growth' },
  { id: '13', name_es: 'Project Status Report', name_en: 'Project Status Report', category: 'operations', pain_point: 'No sé en qué están mis proyectos', tier: 'Growth' },
  { id: '14', name_es: 'Supplier Negotiation Draft', name_en: 'Supplier Negotiation Draft', category: 'operations', pain_point: 'No sé negociar con proveedores', tier: 'Growth' },
  { id: '15', name_es: 'SOP Writer', name_en: 'SOP Writer', category: 'operations', pain_point: 'Todo está en mi cabeza', tier: 'Growth' },

  // TIER 4 — CONTENT & MARKETING
  { id: '16', name_es: 'Instagram Caption Writer (ES)', name_en: 'Instagram Caption Writer (ES)', category: 'marketing', pain_point: 'Captions que convierten', tier: 'Starter' },
  { id: '17', name_es: 'TikTok Script Writer', name_en: 'TikTok Script Writer', category: 'marketing', pain_point: 'No sé qué decir en TikTok', tier: 'Starter' },
  { id: '18', name_es: 'LinkedIn Post (Thought Leadership)', name_en: 'LinkedIn Post (Thought Leadership)', category: 'marketing', pain_point: 'Posicionamiento como experta', tier: 'Growth' },
  { id: '19', name_es: 'Blog Post Writer (SEO México)', name_en: 'Blog Post Writer (SEO Mexico)', category: 'marketing', pain_point: 'Contenido para Google México', tier: 'Growth' },
  { id: '20', name_es: 'Hashtag Researcher México', name_en: 'Hashtag Researcher Mexico', category: 'marketing', pain_point: 'Hashtags que funcionan en MX', tier: 'Starter' },
  { id: '21', name_es: 'Email Newsletter (ES)', name_en: 'Email Newsletter (ES)', category: 'marketing', pain_point: 'Newsletter semanal para clientes', tier: 'Growth' },
  { id: '22', name_es: 'YouTube Script', name_en: 'YouTube Script', category: 'marketing', pain_point: 'Quiero hacer videos pero no sé de qué', tier: 'Growth' },
  { id: '23', name_es: 'Podcast Episode Outline', name_en: 'Podcast Episode Outline', category: 'marketing', pain_point: 'No sé mis temas', tier: 'Growth' },
  { id: '24', name_es: 'Press Release (ES)', name_en: 'Press Release (ES)', category: 'marketing', pain_point: 'Relaciones públicas sin agencia', tier: 'Growth' },
  { id: '25', name_es: 'Ad Copy Facebook/Instagram', name_en: 'Ad Copy Facebook/Instagram', category: 'marketing', pain_point: 'Anuncios que convierten', tier: 'Growth' },

  // TIER 5 — RESEARCH & INTELLIGENCE
  { id: '26', name_es: 'Competitor Analysis', name_en: 'Competitor Analysis', category: 'research', pain_point: 'No sé qué hace mi competencia', tier: 'Growth' },
  { id: '27', name_es: 'Google Trends Brief (MX)', name_en: 'Google Trends Brief (MX)', category: 'research', pain_point: 'Saber qué está trending en México', tier: 'Starter' },
  { id: '28', name_es: 'Market Research Brief', name_en: 'Market Research Brief', category: 'research', pain_point: 'Hay mercado para mi idea?', tier: 'Growth' },
  { id: '29', name_es: 'Customer Persona Builder', name_en: 'Customer Persona Builder', category: 'research', pain_point: 'No conozco bien a mi cliente', tier: 'Growth' },
  { id: '30', name_es: 'Industry News Digest', name_en: 'Industry News Digest', category: 'research', pain_point: 'Mantenerse actualizada sin tiempo', tier: 'Growth' },

  // TIER 6 — CUSTOMER SERVICE
  { id: '31', name_es: 'FAQ Auto-Responder', name_en: 'FAQ Auto-Responder', category: 'support', pain_point: 'Las mismas preguntas siempre', tier: 'Starter' },
  { id: '32', name_es: 'Complaint Handler', name_en: 'Complaint Handler', category: 'support', pain_point: 'No sé cómo manejar clientes difíciles', tier: 'Growth' },
  { id: '33', name_es: 'Customer Satisfaction Survey', name_en: 'Customer Satisfaction Survey', category: 'support', pain_point: 'No sé si mis clientes están contentos', tier: 'Growth' },
  { id: '34', name_es: 'Refund/Dispute Response', name_en: 'Refund/Dispute Response', category: 'support', pain_point: 'Situaciones difíciles con palabras correctas', tier: 'Growth' },
  { id: '35', name_es: 'Upsell/Cross-sell Script', name_en: 'Upsell/Cross-sell Script', category: 'sales', pain_point: 'Cómo ofrecer más servicios', tier: 'Growth' },

  // TIER 7 — FINANCE
  { id: '36', name_es: 'Weekly Revenue Report', name_en: 'Weekly Revenue Report', category: 'finance', pain_point: 'No sé cuánto estoy ganando', tier: 'Growth' },
  { id: '37', name_es: 'Expense Categorizer', name_en: 'Expense Categorizer', category: 'finance', pain_point: 'Odio la contabilidad', tier: 'Starter' },
  { id: '38', name_es: 'Cash Flow Forecast', name_en: 'Cash Flow Forecast', category: 'finance', pain_point: 'Me quedo sin dinero sin avisar', tier: 'Growth' },
  { id: '39', name_es: 'Budget Planner', name_en: 'Budget Planner', category: 'finance', pain_point: 'Gasto sin control', tier: 'Growth' },
  { id: '40', name_es: 'Tax Prep Checklist (MX)', name_en: 'Tax Prep Checklist (MX)', category: 'finance', pain_point: 'No sé qué documentos necesito', tier: 'Growth' },

  // TIER 8 — GROWTH & STRATEGY
  { id: '41', name_es: '90-Day Business Plan', name_en: '90-Day Business Plan', category: 'operations', pain_point: 'Quiero crecer pero no sé cómo', tier: 'Growth' },
  { id: '42', name_es: 'Pitch Deck Builder', name_en: 'Pitch Deck Builder', category: 'operations', pain_point: 'Presentarme a inversores', tier: 'Agency' },
  { id: '43', name_es: 'Grant Opportunity Finder (MX)', name_en: 'Grant Opportunity Finder (MX)', category: 'operations', pain_point: 'Apoyos gobierno para empresarias MX', tier: 'Agency' },
  { id: '44', name_es: 'Partnership Proposal Writer', name_en: 'Partnership Proposal Writer', category: 'operations', pain_point: 'Alianzas estratégicas', tier: 'Agency' },
  { id: '45', name_es: 'Hiring Job Description (ES)', name_en: 'Hiring Job Description (ES)', category: 'operations', pain_point: 'Contratación sin saber cómo', tier: 'Growth' },
  { id: '46', name_es: 'Employee Onboarding Guide', name_en: 'Employee Onboarding Guide', category: 'operations', pain_point: 'Mis empleados no saben qué hacer', tier: 'Growth' },
  { id: '47', name_es: 'Brand Voice Guide', name_en: 'Brand Voice Guide', category: 'marketing', pain_point: 'No tengo consistencia en mi mensaje', tier: 'Growth' },
  { id: '48', name_es: 'Crisis Response Script', name_en: 'Crisis Response Script', category: 'support', pain_point: 'No sé qué hacer cuando hay un problema', tier: 'Agency' },
  { id: '49', name_es: 'LATAM Expansion Brief', name_en: 'LATAM Expansion Brief', category: 'operations', pain_point: 'Quiero vender en otros países de LATAM', tier: 'Agency' },
  { id: '50', name_es: 'AI Strategy for SMBs (ES)', name_en: 'AI Strategy for SMBs (ES)', category: 'operations', pain_point: 'No sé cómo implementar IA en mi negocio', tier: 'Growth' },
];

const CATEGORIES = [
  { value: 'all', label_es: 'Todas', label_en: 'All' },
  { value: 'marketing', label_es: 'Marketing', label_en: 'Marketing' },
  { value: 'sales', label_es: 'Ventas', label_en: 'Sales' },
  { value: 'operations', label_es: 'Operaciones', label_en: 'Operations' },
  { value: 'finance', label_es: 'Finanzas', label_en: 'Finance' },
  { value: 'research', label_es: 'Research', label_en: 'Research' },
  { value: 'support', label_es: 'Atención al Cliente', label_en: 'Support' },
];

export default function SkillsPage() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSkills = activeCategory === 'all'
    ? SKILLS
    : SKILLS.filter(skill => skill.category === activeCategory);

  const tierColors = {
    'Starter': 'border-blue-500/50 bg-blue-900/20',
    'Growth': 'border-purple-500/50 bg-purple-900/20',
    'Agency': 'border-gold-500/50 bg-gold-900/20',
  };

  const tierBadgeColors = {
    'Starter': 'bg-blue-600 text-blue-100',
    'Growth': 'bg-purple-600 text-purple-100',
    'Agency': 'bg-amber-600 text-amber-100',
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{language === 'es' ? 'SKILLS MARKETPLACE' : 'SKILLS MARKETPLACE'}</h1>
              <p className="text-[10px] text-slate-400">{language === 'es' ? 'Poderes de ALEX™' : 'ALEX™ Powers'}</p>
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
            <Link href="/alex" className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
              {language === 'es' ? 'Volver a ALEX™' : 'Back to ALEX™'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 bg-linear-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            {language === 'es' ? '50+ Habilidades™ que ALEX™ usa' : '50+ Skills™ ALEX™ Uses'}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {language === 'es'
              ? 'Cada skill resuelve un problema real. Ninguna requiere que sepas de tecnología.'
              : 'Each skill solves a real problem. None require you to know tech.'
            }
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeCategory === cat.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'es' ? cat.label_es : cat.label_en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => (
              <div
                key={skill.id}
                className={`p-6 rounded-xl border transition-all hover:border-amber-400/50 ${tierColors[skill.tier as keyof typeof tierColors] || 'border-slate-700 bg-slate-800/50'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg flex-1">{language === 'es' ? skill.name_es : skill.name_en}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 whitespace-nowrap ${tierBadgeColors[skill.tier as keyof typeof tierBadgeColors]}`}>
                    {skill.tier}
                  </span>
                </div>
                <p className="text-sm text-amber-300 font-semibold mb-2">
                  {language === 'es' ? '🎯 Problema:' : '🎯 Problem:'}
                </p>
                <p className="text-slate-300 text-sm mb-4">{skill.pain_point}</p>
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    {language === 'es' ? 'Incluido en plan:' : 'Included in:'} <span className="text-amber-300 font-semibold">{skill.tier}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WOW Demos Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-4">
            {language === 'es' ? 'Ve ALEX™ en acción' : 'See ALEX™ in Action'}
          </h3>
          <p className="text-center text-slate-300 mb-16">
            {language === 'es'
              ? '60 segundos que cambian tu negocio'
              : '60 seconds that change your business'
            }
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                es: 'El Mes de Contenido en 10 Minutos',
                en: 'A Month of Content in 10 Minutes',
                desc_es: 'Describe tu negocio → ALEX genera 30 posts → Publica → Listo',
                desc_en: 'Describe business → ALEX generates 30 posts → Publish → Done'
              },
              {
                es: 'El Empleado que Trabaja de Noche',
                en: 'The Employee Who Works at Night',
                desc_es: 'WhatsApps llegando a las 11pm → ALEX responde → 4 citas agendadas',
                desc_en: 'WhatsApps at 11pm → ALEX replies → 4 bookings scheduled'
              },
              {
                es: 'El Briefing que Cambia tu Día',
                en: 'The Briefing That Changes Your Day',
                desc_es: '8am: ALEX te manda trends + agenda + leads + recomendación',
                desc_en: '8am: ALEX sends trends + schedule + leads + recommendation'
              }
            ].map((demo, idx) => (
              <div key={idx} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="w-full h-48 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-slate-400">▶ {language === 'es' ? 'Video' : 'Video'}</p>
                </div>
                <h4 className="font-bold text-lg mb-2">{language === 'es' ? demo.es : demo.en}</h4>
                <p className="text-slate-300 text-sm mb-4">{language === 'es' ? demo.desc_es : demo.desc_en}</p>
                <button className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 rounded text-sm font-semibold transition-colors">
                  {language === 'es' ? 'Ver Demo' : 'Watch Demo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-black mb-6">
            {language === 'es'
              ? '¿Listo para tener todas estas habilidades?'
              : 'Ready to have all these skills?'
            }
          </h3>
          <p className="text-xl text-slate-300 mb-8">
            {language === 'es'
              ? 'Activa ALEX™ ahora. Primeros 14 días gratis. Sin tarjeta de crédito.'
              : 'Activate ALEX™ now. First 14 days free. No credit card.'
            }
          </p>
          <Link href="/alex">
            <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 font-bold rounded-lg transition-colors text-lg">
              {language === 'es' ? 'Empezar Gratis' : 'Start Free'}
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
