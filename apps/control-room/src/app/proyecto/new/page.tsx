'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    id: 'basics',
    title: 'Información Básica',
    description: 'Cuéntanos sobre tu proyecto',
  },
  {
    id: 'scope',
    title: 'Alcance y Equipo',
    description: 'Qué vas a construir y con quién',
  },
  {
    id: 'timeline',
    title: 'Timeline y Presupuesto',
    description: 'Cuándo y cuánto invertirás',
  },
  {
    id: 'spheres',
    title: 'Asignar Agentes',
    description: 'Selecciona qué Spheres colaborarán',
  },
];

const SPHERE_OPTIONS = [
  { id: 'synthia', name: 'SYNTHIA™', role: 'Coordinadora General', color: '#8b5cf6' },
  { id: 'alex', name: 'ALEX™', role: 'Estratega Ejecutivo', color: '#d4af37' },
  { id: 'cazadora', name: 'CAZADORA™', role: 'Cazadora de Oportunidades', color: '#ef4444' },
  { id: 'forjadora', name: 'FORJADORA™', role: 'Arquitecta de Sistemas', color: '#22c55e' },
  { id: 'seductora', name: 'SEDUCTORA™', role: 'Closera Maestra', color: '#eab308' },
  { id: 'consejo', name: 'CONSEJO™', role: 'Consejero Mayor', color: '#1d4ed8' },
  { id: 'economia', name: 'DR. ECONOMÍA', role: 'Analista Financiero', color: '#f97316' },
  { id: 'cultura', name: 'DRA. CULTURA', role: 'Estratega Cultural', color: '#f43f5e' },
  { id: 'teknos', name: 'ING. TEKNOS', role: 'Ingeniero de Sistemas', color: '#06b6d4' },
];

export default function NewProyectoPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'product',
    team_size: '',
    timeline: '3-6 months',
    budget: '',
    spheres: ['synthia'],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSphereToggle = (sphereId: string) => {
    setFormData({
      ...formData,
      spheres: formData.spheres.includes(sphereId)
        ? formData.spheres.filter((id) => id !== sphereId)
        : [...formData.spheres, sphereId],
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // TODO: In production, POST to /api/projects/create
    console.log('Creating project:', formData);
    setSubmitted(true);

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/cockpit');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)' }}>
      {/* Top bar */}
      <nav style={{ borderBottom: '1px solid var(--color-charcoal-600)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/cockpit" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-cream-100)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          SYNTHIA™ <span style={{ fontSize: 10, color: 'var(--color-cream-400)' }}>Control Room</span>
        </Link>
        <Link
          href="/cockpit"
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 700,
            background: 'var(--color-gold-600)',
            color: 'var(--color-charcoal-900)',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Ir al Cockpit
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', padding: '32px 24px', gap: 40 }}>
        {/* Left: Step Indicators */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cream-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Pasos
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STEPS.map((step, i) => (
                <li key={step.id}>
                  <button
                    onClick={() => {
                      if (i <= activeStep) setActiveStep(i);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '0 0 12px 0',
                      fontSize: 13,
                      fontWeight: activeStep === i ? 600 : 400,
                      color: activeStep === i ? 'var(--color-gold-400)' : activeStep > i ? 'var(--color-cream-400)' : 'var(--color-cream-600)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeStep === i ? '2px solid var(--color-gold-400)' : 'none',
                      cursor: i <= activeStep ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: activeStep > i ? 'var(--color-gold-400)' : activeStep === i ? 'var(--color-gold-600)' : 'var(--color-charcoal-700)',
                        color: activeStep > i || activeStep === i ? 'var(--color-charcoal-900)' : 'var(--color-cream-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {activeStep > i ? '✓' : i + 1}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div>{step.title}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right: Form Content */}
        <main style={{ flex: 1, maxWidth: 640 }}>
          {submitted ? (
            <div style={{ paddingTop: 64 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>¡Proyecto Creado!</h2>
                <p style={{ fontSize: 16, color: 'var(--color-cream-400)', marginBottom: 32, lineHeight: 1.6 }}>
                  SYNTHIA™ está configurando tu proyecto y asignando los Spheres. Serás redirigida al Cockpit en breve.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Step content */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cream-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Paso {activeStep + 1} de {STEPS.length}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  {STEPS[activeStep].title}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-cream-400)' }}>
                  {STEPS[activeStep].description}
                </p>
              </div>

              {/* Form fields based on step */}
              {activeStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Nombre del Proyecto *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Plataforma de Marketing Digital"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
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
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Descripción *
                    </label>
                    <textarea
                      placeholder="Describe brevemente qué harás con este proyecto"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        background: 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-charcoal-600)',
                        borderRadius: 8,
                        color: 'var(--color-cream-100)',
                        outline: 'none',
                        minHeight: 100,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Tipo de Proyecto
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        background: 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-charcoal-600)',
                        borderRadius: 8,
                        color: 'var(--color-cream-100)',
                      }}
                    >
                      <option value="product">Producto/Servicio</option>
                      <option value="marketing">Campaña de Marketing</option>
                      <option value="operations">Automatización de Operaciones</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Tamaño del Equipo
                    </label>
                    <select
                      value={formData.team_size}
                      onChange={(e) => handleInputChange('team_size', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        background: 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-charcoal-600)',
                        borderRadius: 8,
                        color: 'var(--color-cream-100)',
                      }}
                    >
                      <option value="">Selecciona...</option>
                      <option value="solo">Solo yo</option>
                      <option value="2-5">2-5 personas</option>
                      <option value="6-20">6-20 personas</option>
                      <option value="20+">20+ personas</option>
                    </select>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Timeline Estimado
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        background: 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-charcoal-600)',
                        borderRadius: 8,
                        color: 'var(--color-cream-100)',
                      }}
                    >
                      <option value="1-3 months">1-3 meses</option>
                      <option value="3-6 months">3-6 meses</option>
                      <option value="6-12 months">6-12 meses</option>
                      <option value="12+ months">12+ meses</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-cream-100)' }}>
                      Presupuesto Estimado (USD)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 50000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
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
                </div>
              )}

              {activeStep === 3 && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 14, color: 'var(--color-cream-400)', marginBottom: 16 }}>
                      SYNTHIA™ automáticamente selecciona Spheres, pero puedes personalizar:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      {SPHERE_OPTIONS.map((sphere) => (
                        <button
                          key={sphere.id}
                          onClick={() => handleSphereToggle(sphere.id)}
                          style={{
                            padding: '12px',
                            border: formData.spheres.includes(sphere.id)
                              ? `2px solid ${sphere.color}`
                              : '1px solid var(--color-charcoal-600)',
                            background: formData.spheres.includes(sphere.id)
                              ? 'var(--color-charcoal-800)'
                              : 'transparent',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: sphere.color,
                              }}
                            />
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: sphere.color }}>
                                {sphere.name}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--color-cream-600)' }}>
                                {sphere.role}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                {activeStep > 0 && (
                  <button
                    onClick={() => setActiveStep(activeStep - 1)}
                    style={{
                      padding: '8px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'transparent',
                      border: '1px solid var(--color-charcoal-600)',
                      color: 'var(--color-cream-400)',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    ← Anterior
                  </button>
                )}
                {activeStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    style={{
                      padding: '8px 20px',
                      fontSize: 14,
                      fontWeight: 700,
                      background: 'var(--color-gold-600)',
                      color: 'var(--color-charcoal-900)',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    style={{
                      padding: '8px 20px',
                      fontSize: 14,
                      fontWeight: 700,
                      background: 'var(--color-gold-600)',
                      color: 'var(--color-charcoal-900)',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Crear Proyecto →
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
