'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const STEPS = [
  {
    id: 'what',
    title: '¿Qué es Kupuri Media?',
    body: 'Kupuri Media™ es una plataforma de inteligencia artificial diseñada para empresarias latinoamericanas. Automatiza tus operaciones diarias — desde marketing y ventas hasta finanzas y atención al cliente — para que puedas enfocarte en hacer crecer tu negocio.',
  },
  {
    id: 'synthia',
    title: '¿Qué es SYNTHIA™ 3.0?',
    body: 'SYNTHIA™ 3.0 es el sistema operativo agéntico de Kupuri Media. Es tu CEO invisible: coordina 9 agentes de IA especializados que trabajan en equipo para ejecutar tareas, generar ingresos y mantener todo funcionando — en español, en tu zona horaria, sin código.',
  },
  {
    id: 'spheres',
    title: 'Conoce a los 9 Spheres',
    body: 'Cada Sphere es un agente de IA con personalidad, voz y especialidad propia. ALEX™ es tu estratega. CAZADORA™ busca prospectos. SEDUCTORA™ cierra ventas. FORJADORA™ construye sistemas. DR. ECONOMÍA analiza finanzas. DRA. CULTURA genera contenido. ING. TEKNOS maneja la infraestructura. CONSEJO™ facilita decisiones. Y LA VIGILANTE™ supervisa todo.',
  },
  {
    id: 'how',
    title: '¿Cómo Funciona?',
    body: 'Tú describes tu negocio, tus necesidades y tus metas. SYNTHIA™ asigna a los Spheres adecuados, activa las habilidades correctas y ejecuta tareas automáticamente. Puedes ver todo desde el Cockpit — tu tablero de control centralizado.',
  },
  {
    id: 'start',
    title: 'Primeros Pasos',
    body: 'Completa el cuestionario de abajo para que SYNTHIA™ entienda tu negocio. Según tus respuestas, te asignaremos los Spheres y habilidades ideales para empezar.',
  },
] as const;

const QUESTIONS = [
  { id: 'biz', label: '¿Qué tipo de negocio tienes?', placeholder: 'Ej: Restaurante, tienda online, agencia de marketing...' },
  { id: 'revenue', label: '¿Cómo generas ingresos hoy?', placeholder: 'Ej: Ventas directas, servicios profesionales, e-commerce...' },
  { id: 'team', label: '¿Cuántas personas trabajan contigo?', placeholder: 'Ej: Solo yo, 2-5 personas, 6-20 personas...' },
  { id: 'pain', label: '¿Cuál es tu mayor dolor operativo?', placeholder: 'Ej: No tengo tiempo para marketing, se me escapan clientes...' },
  { id: 'goal', label: '¿Cuál es tu meta de crecimiento para los próximos 6 meses?', placeholder: 'Ej: Duplicar clientes, lanzar producto, automatizar ventas...' },
] as const;

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recommendedSpheres, setRecommendedSpheres] = useState<string[]>([]);

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await res.json() as { success?: boolean; recommendedSpheres?: string[]; error?: string };
      if (data.success) {
        setRecommendedSpheres(data.recommendedSpheres ?? []);
        setSubmitted(true);
      } else {
        setSaveError(data.error || 'Error guardando respuestas. Intenta de nuevo.');
      }
    } catch {
      setSaveError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)' }}>
      {/* Top bar */}
      <nav style={{
        borderBottom: '1px solid var(--color-charcoal-600)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/landing" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-cream-100)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          SYNTHIA™ <span style={{ fontSize: 10, color: 'var(--color-cream-400)' }}>3.0</span>
        </Link>
        <Link
          href="/cockpit"
          style={{
            padding: '7px 16px', fontSize: 13, fontWeight: 700,
            background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)',
            borderRadius: 8, textDecoration: 'none',
          }}
        >
          Cockpit →
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', padding: '32px 24px', gap: 40 }}>
        {/* Left: Table of Contents */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cream-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Contenido
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STEPS.map((step, i) => (
                <li key={step.id}>
                  <button
                    onClick={() => setActiveStep(i)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: 14,
                      fontWeight: activeStep === i ? 600 : 400,
                      color: activeStep === i ? 'var(--color-gold-400)' : 'var(--color-cream-400)',
                      background: activeStep === i ? 'var(--color-charcoal-700)' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {step.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setActiveStep(STEPS.length)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: 14,
                    fontWeight: activeStep === STEPS.length ? 600 : 400,
                    color: activeStep === STEPS.length ? 'var(--color-gold-400)' : 'var(--color-cream-400)',
                    background: activeStep === STEPS.length ? 'var(--color-charcoal-700)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Cuestionario
                </button>
              </li>
            </ul>

            {/* Flipbook link */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-charcoal-700)' }}>
              <a
                href="/onboarding/"
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'var(--color-gold-500)',
                  textDecoration: 'none',
                  borderRadius: 6,
                  border: '1px solid var(--color-charcoal-600)',
                }}
              >
                Ver Flipbook 3D ↗
              </a>
            </div>
          </div>
        </aside>

        {/* Right: Content */}
        <main style={{ flex: 1, maxWidth: 640 }}>
          {activeStep < STEPS.length ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cream-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Paso {activeStep + 1} de {STEPS.length}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, fontFamily: 'var(--font-display, var(--font-sans))' }}>
                {STEPS[activeStep].title}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--color-cream-200)' }}>
                {STEPS[activeStep].body}
              </p>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                {activeStep > 0 && (
                  <button
                    onClick={() => setActiveStep(activeStep - 1)}
                    style={{
                      padding: '8px 20px', fontSize: 14, fontWeight: 600,
                      background: 'transparent', border: '1px solid var(--color-charcoal-600)',
                      color: 'var(--color-cream-400)', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    ← Anterior
                  </button>
                )}
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  style={{
                    padding: '8px 20px', fontSize: 14, fontWeight: 700,
                    background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  {activeStep === STEPS.length - 1 ? 'Comenzar Cuestionario →' : 'Siguiente →'}
                </button>
              </div>
            </div>
          ) : (
            /* Questionnaire */
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-display, var(--font-sans))' }}>
                Cuestionario de Negocio
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-cream-400)', marginBottom: 32 }}>
                Responde estas preguntas para que SYNTHIA™ entienda tu negocio y te asigne los mejores Spheres.
              </p>

              {submitted ? (
                <div style={{ padding: 24, background: 'var(--color-charcoal-800)', border: '1px solid var(--color-gold-600)', borderRadius: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--color-gold-400)' }}>
                    ¡Gracias!
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--color-cream-200)', marginBottom: 16 }}>
                    SYNTHIA™ está analizando tus respuestas. Serás redirigida al Cockpit con tus Spheres asignados.
                  </p>
                  <Link
                    href="/cockpit"
                    style={{
                      display: 'inline-block',
                      padding: '8px 20px', fontSize: 14, fontWeight: 700,
                      background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)',
                      borderRadius: 8, textDecoration: 'none',
                    }}
                  >
                    Ir al Cockpit →
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                  {QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-cream-100)', marginBottom: 8 }}>
                        {q.label}
                      </label>
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder={q.placeholder}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          background: 'var(--color-charcoal-800)',
                          border: '1px solid var(--color-charcoal-600)',
                          borderRadius: 8,
                          color: 'var(--color-cream-100)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(STEPS.length - 1)}
                      style={{
                        padding: '8px 20px', fontSize: 14, fontWeight: 600,
                        background: 'transparent', border: '1px solid var(--color-charcoal-600)',
                        color: 'var(--color-cream-400)', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      ← Anterior
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 20px', fontSize: 14, fontWeight: 700,
                        background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      Enviar y Activar Spheres →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
