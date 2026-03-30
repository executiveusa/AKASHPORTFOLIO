'use client';

import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/Footer';

/* ── El Panorama briefing documents ──────────────────────────────── */

interface Briefing {
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  audience: string;
  category: 'executive' | 'technical' | 'operational' | 'strategy';
}

const BRIEFINGS: Briefing[] = [
  {
    slug: 'executive-summary',
    title: 'Executive Summary & Quick Start',
    summary:
      'High-level overview of the zero-human-bottleneck worker management system: photo verification, same-day payment, and the "Verified by your tip" loyalty program.',
    readTime: '10 min',
    audience: 'Leadership',
    category: 'executive',
  },
  {
    slug: 'operational-system',
    title: 'Operational System Design',
    summary:
      'Job-based payment flows, photo-matching intelligence, check-in/check-out UX, Agent Zero verification, and payment routing (cash, mobile, bank).',
    readTime: '30 min',
    audience: 'Operations',
    category: 'operational',
  },
  {
    slug: 'decision-checklist',
    title: 'Decision Checklist — Build Ready',
    summary:
      '6 locked decisions and 6 pending clarifications. Payment model, bonus structure, work acceptance, cash logistics, timing, and loyalty system.',
    readTime: '15 min',
    audience: 'Stakeholders',
    category: 'strategy',
  },
  {
    slug: 'technical-architecture',
    title: 'Technical Architecture Spec',
    summary:
      'Database schema, 10 API endpoints, Agent Zero verification decision tree, payment routing, Verified directory algorithm, deployment architecture.',
    readTime: '90 min',
    audience: 'Engineering',
    category: 'technical',
  },
  {
    slug: 'karpathy-model',
    title: 'Karpathy Model — Self-Improving System',
    summary:
      'How the auto-research loop makes the worker verification system self-improving: nightly optimization, algorithm versioning, zero-human oversight.',
    readTime: '20 min',
    audience: 'Technical / Strategy',
    category: 'strategy',
  },
  {
    slug: 'document-index',
    title: 'Document Index & Navigation',
    summary:
      'Complete navigation guide to all deliverables. Read order, audience mapping, and action items for each document.',
    readTime: '5 min',
    audience: 'Everyone',
    category: 'executive',
  },
  {
    slug: 'whats-next',
    title: "What's Next — Implementation Roadmap",
    summary:
      '7-week build timeline, your complete system design package, the 6 clarification questions you need to answer, and immediate next steps.',
    readTime: '10 min',
    audience: 'Leadership / Engineering',
    category: 'strategy',
  },
];

const CATEGORY_LABELS: Record<Briefing['category'], string> = {
  executive: 'Ejecutivo',
  technical: 'Técnico',
  operational: 'Operaciones',
  strategy: 'Estrategia',
};

const CATEGORY_COLORS: Record<Briefing['category'], string> = {
  executive: 'var(--color-gold-400)',
  technical: 'var(--color-sphere-teknos)',
  operational: 'var(--color-sphere-forjadora)',
  strategy: 'var(--color-sphere-consejo)',
};

/* ── Component ───────────────────────────────────────────────────── */

export default function NewspaperPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Briefing['category'] | 'all'>('all');

  const filtered =
    activeCategory === 'all' ? BRIEFINGS : BRIEFINGS.filter((b) => b.category === activeCategory);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    // Stub: in production this would POST to /api/newsletter
    setSubscribed(true);
  }

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-charcoal-900)',
          color: 'var(--color-cream-100)',
          padding: '64px 24px 80px',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Header */}
          <header style={{ marginBottom: 48 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'var(--color-cream-400)',
                marginBottom: 8,
              }}
            >
              El Panorama™
            </p>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Strategic Briefings
            </h1>
            <p
              style={{
                marginTop: 12,
                fontSize: 15,
                color: 'var(--color-cream-400)',
                maxWidth: 640,
                lineHeight: 1.6,
              }}
            >
              System design documents for the zero-human-bottleneck worker management platform.
              Photo verification, same-day payment, and self-improving AI operations.
            </p>
          </header>

          {/* Category filters */}
          <nav style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {(['all', 'executive', 'technical', 'operational', 'strategy'] as const).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-gold-400)' : 'var(--color-charcoal-600)',
                    background: isActive ? 'var(--color-charcoal-700)' : 'transparent',
                    color: isActive ? 'var(--color-gold-400)' : 'var(--color-cream-400)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </nav>

          {/* Briefing cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((b) => (
              <article
                key={b.slug}
                className="panel"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Top row: category + read time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: CATEGORY_COLORS[b.category],
                    }}
                  >
                    {CATEGORY_LABELS[b.category]}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-cream-600)' }}>
                    {b.readTime} · {b.audience}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.3,
                    color: 'var(--color-cream-100)',
                  }}
                >
                  {b.title}
                </h2>

                {/* Summary */}
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--color-cream-400)',
                    margin: 0,
                  }}
                >
                  {b.summary}
                </p>
              </article>
            ))}
          </div>

          {/* ── Newsletter signup ───────────────────────────────── */}
          <section
            style={{
              marginTop: 64,
              padding: '32px 24px',
              borderTop: '1px solid var(--color-charcoal-600)',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Boletín El Panorama
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-cream-400)',
                marginBottom: 20,
                maxWidth: 520,
                lineHeight: 1.6,
              }}
            >
              Recibe briefings estratégicos, actualizaciones del sistema y oportunidades
              de arbitraje directamente en tu correo. Sin spam — máx. 1 vez por semana.
            </p>

            {subscribed ? (
              <p style={{ fontSize: 14, color: 'var(--color-sphere-forjadora)', fontWeight: 600 }}>
                ✓ Suscripción confirmada. Revisa tu correo.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{ display: 'flex', gap: 8, maxWidth: 440 }}
              >
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: '1px solid var(--color-charcoal-600)',
                    background: 'var(--color-charcoal-800)',
                    color: 'var(--color-cream-100)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-gold-400)',
                    color: 'var(--color-charcoal-900)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Suscribirse
                </button>
              </form>
            )}
          </section>

          {/* Back link */}
          <div style={{ marginTop: 40 }}>
            <Link
              href="/landing"
              style={{
                fontSize: 13,
                color: 'var(--color-cream-400)',
                textDecoration: 'none',
              }}
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
