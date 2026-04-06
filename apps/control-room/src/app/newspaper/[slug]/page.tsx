'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

interface Briefing {
  slug: string;
  title: string;
  summary: string;
  content: string;
  readTime: string;
  audience: string;
  category: 'executive' | 'technical' | 'operational' | 'strategy';
}

const BRIEFINGS: Record<string, Briefing> = {
  'executive-summary': {
    slug: 'executive-summary',
    title: 'Executive Summary & Quick Start',
    summary: 'High-level overview of the zero-human-bottleneck worker management system: photo verification, same-day payment, and the "Verified by your tip" loyalty program.',
    readTime: '10 min',
    audience: 'Leadership',
    category: 'executive',
    content: `
<h2>Overview</h2>
<p>This is the complete operational blueprint for a worker management and verification system designed to eliminate human bottlenecks in the hiring, verification, and payment process.</p>

<h2>Core Innovation</h2>
<ul>
  <li>Zero human verification required — AI photo matching ensures worker identity</li>
  <li>Same-day payment — Workers paid within hours, not days</li>
  <li>"Verified by your tip" loyalty — Customers rate workers, building reputation</li>
  <li>Blockchain transparency — Every transaction auditable and permanent</li>
</ul>

<h2>Financial Model</h2>
<p>Initial investment: $50,000 for platform development and launch</p>
<p>Revenue model: 8-12% take rate on jobs ($2M monthly volume = $160-240K revenue)</p>
<p>Path to profitability: 6 months with 500+ daily active workers</p>

<h2>Next Steps</h2>
<ol>
  <li>Confirm 6 locked decisions (payment model, bonus structure, work acceptance)</li>
  <li>Clarify 6 pending questions (cash logistics, timing, loyalty system)</li>
  <li>Begin Phase 1 development (database, API, worker app)</li>
  <li>Soft launch in 1 city (4 weeks)</li>
</ol>
    `,
  },
  'operational-system': {
    slug: 'operational-system',
    title: 'Operational System Design',
    summary: 'Job-based payment flows, photo-matching intelligence, check-in/check-out UX, Agent Zero verification, and payment routing.',
    readTime: '30 min',
    audience: 'Operations',
    category: 'operational',
    content: `
<h2>System Architecture</h2>
<p>The operational system is built around three core flows:</p>

<h3>1. Job Creation & Broadcasting</h3>
<p>Employers post jobs with photo requirements, hourly rates, and location. Jobs broadcast to nearby workers via push notification.</p>

<h3>2. Worker Verification & Acceptance</h3>
<p>Worker accepts job → takes selfie + ID photo → AI verifies identity → worker checks in on location.</p>

<h3>3. Payment & Rating</h3>
<p>Worker completes job → timesheet auto-approved if customer rating > 4.0 → payment queued for same-day settlement.</p>

<h2>Photo Matching Intelligence</h2>
<p>Uses facial recognition to ensure:</p>
<ul>
  <li>Selfie matches ID photo (prevents fraud)</li>
  <li>Geolocation matches job location (prevents remote acceptance)</li>
  <li>Time-of-photo matches clock-in time (prevents time theft)</li>
</ul>

<h2>Payment Routing</h2>
<p>Workers can receive payment via:</p>
<ul>
  <li>Bank transfer (2-hour settlement)</li>
  <li>Mobile wallet (instant)</li>
  <li>Cash pick-up (1-hour processing)</li>
</ul>
    `,
  },
  'decision-checklist': {
    slug: 'decision-checklist',
    title: 'Decision Checklist — Build Ready',
    summary: '6 locked decisions and 6 pending clarifications. Payment model, bonus structure, work acceptance, cash logistics, timing, and loyalty system.',
    readTime: '15 min',
    audience: 'Stakeholders',
    category: 'strategy',
    content: `
<h2>✅ Locked Decisions</h2>
<ol>
  <li><strong>Payment Model</strong> — 8-12% take rate, workers receive 88-92%</li>
  <li><strong>Verification Method</strong> — AI photo matching, no human approval</li>
  <li><strong>Daily Settlement</strong> — All workers paid same-day</li>
  <li><strong>Loyalty Program</strong> — Customer ratings = worker reputation score</li>
  <li><strong>Geographic Launch</strong> — Start in Mexico City, expand quarterly</li>
  <li><strong>Target Market</strong> — Gig workers, day laborers, temp staff</li>
</ol>

<h2>❓ Pending Clarifications</h2>
<ol>
  <li>Cash logistics — How to handle physical cash handling in 500+ locations?</li>
  <li>Bonus structure — Performance bonuses or flat rates only?</li>
  <li>Work acceptance — Can workers decline jobs? What penalties?</li>
  <li>Rating appeals — If worker disputes a low rating?</li>
  <li>KYC requirements — Full AML/KYC or lighter verification?</li>
  <li>Insurance & liability — Who's responsible for workplace injuries?</li>
</ol>

<h2>Recommended Priority</h2>
<p>Resolve questions 1, 3, and 6 before beginning development. Questions 2, 4, 5 can be decided in Phase 2.</p>
    `,
  },
  'technical-architecture': {
    slug: 'technical-architecture',
    title: 'Technical Architecture Spec',
    summary: 'Database schema, 10 API endpoints, Agent Zero verification decision tree, payment routing, Verified directory algorithm, deployment architecture.',
    readTime: '90 min',
    audience: 'Engineering',
    category: 'technical',
    content: `
<h2>Stack</h2>
<ul>
  <li><strong>Backend</strong>: Node.js + Express (TypeScript)</li>
  <li><strong>Database</strong>: PostgreSQL (relational) + Redis (cache)</li>
  <li><strong>APIs</strong>: REST + WebSocket for real-time job broadcasts</li>
  <li><strong>Payment</strong>: Stripe Connect + local payment providers</li>
  <li><strong>AI/ML</strong>: OpenAI Vision API for photo matching</li>
  <li><strong>Deployment</strong>: Docker + Kubernetes on AWS</li>
</ul>

<h2>Core Database Schema</h2>
<ul>
  <li><code>workers</code> — worker profile, ID documents, bank info, rating history</li>
  <li><code>employers</code> — company profile, job history, payment method</li>
  <li><code>jobs</code> — job posting, requirements, location, payment</li>
  <li><code>shifts</code> — worker accepting job, check-in/out, timesheet</li>
  <li><code>payments</code> — payment records, settlement status, routing</li>
  <li><code>ratings</code> — customer ratings, worker reputation scores</li>
</ul>

<h2>API Endpoints</h2>
<p>10 core endpoints are documented with full request/response specs.</p>
    `,
  },
  'karpathy-model': {
    slug: 'karpathy-model',
    title: 'Karpathy Model — Self-Improving System',
    summary: 'How the auto-research loop makes the worker verification system self-improving: nightly optimization, algorithm versioning, zero-human oversight.',
    readTime: '20 min',
    audience: 'Technical / Strategy',
    category: 'strategy',
    content: `
<h2>The Self-Improvement Loop</h2>
<p>Every night, the system analyzes the day's data and improves itself:</p>

<h3>1. Data Collection</h3>
<p>Every photo, verification, rating, and payment creates a data point. By end of day: 10,000+ data points.</p>

<h3>2. Analysis</h3>
<p>ML pipeline analyzes:</p>
<ul>
  <li>Which workers are most reliable? (low photo rejections, high ratings)</li>
  <li>Which jobs are most profitable? (high volume, low dispute rate)</li>
  <li>Which payment methods have lowest settlement failure?</li>
  <li>Which photo verification patterns indicate fraud risk?</li>
</ul>

<h3>3. Optimization</h3>
<p>The system auto-adjusts:</p>
<ul>
  <li>Photo matching threshold (too loose = fraud, too strict = rejected workers)</li>
  <li>Worker matching algorithm (recommend jobs to workers with highest completion rate)</li>
  <li>Payment priority (fast-settle vs high-risk workers)</li>
</ul>

<h3>4. Versioning</h3>
<p>Every change is versioned. If accuracy drops, system automatically rolls back.</p>

<h2>Result</h2>
<p>Each month the system gets better with zero human oversight — fraud detection improves, worker-job matching improves, payment settlement speeds up.</p>
    `,
  },
  'document-index': {
    slug: 'document-index',
    title: 'Document Index & Navigation',
    summary: 'Complete navigation guide to all deliverables. Read order, audience mapping, and action items for each document.',
    readTime: '5 min',
    audience: 'Everyone',
    category: 'executive',
    content: `
<h2>Reading Guide</h2>
<p><strong>If you have 15 minutes:</strong> Read Executive Summary + Decision Checklist</p>
<p><strong>If you have 1 hour:</strong> Read Executive Summary → Operational System → Technical Architecture → Decision Checklist</p>
<p><strong>If you have 3 hours:</strong> Read all documents in this order</p>

<h2>Document Map</h2>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid #ccc; padding: 8px;">Document</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Audience</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Time</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Action</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px;">Executive Summary</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Leadership</td>
    <td style="border: 1px solid #ccc; padding: 8px;">10 min</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Approve concept, resolve 6 questions</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px;">Operational System</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Ops, Product</td>
    <td style="border: 1px solid #ccc; padding: 8px;">30 min</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Finalize payment flows, job matching</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px;">Technical Architecture</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Engineering</td>
    <td style="border: 1px solid #ccc; padding: 8px;">90 min</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Begin Phase 1 development, setup repos</td>
  </tr>
</table>
    `,
  },
  'whats-next': {
    slug: 'whats-next',
    title: "What's Next — Implementation Roadmap",
    summary: '7-week build timeline, your complete system design package, the 6 clarification questions you need to answer, and immediate next steps.',
    readTime: '10 min',
    audience: 'Leadership / Engineering',
    category: 'strategy',
    content: `
<h2>The 6 Questions You Need Answered First</h2>
<ol>
  <li>Cash logistics — How do we handle physical cash in 500+ locations?</li>
  <li>Bonus structure — Performance bonuses or flat rates only?</li>
  <li>Work acceptance — Can workers decline jobs? What penalties?</li>
  <li>Rating appeals — If worker disputes a low rating?</li>
  <li>KYC requirements — Full AML/KYC or lighter verification?</li>
  <li>Insurance & liability — Who's responsible for workplace injuries?</li>
</ol>

<h2>7-Week Development Timeline</h2>
<ul>
  <li><strong>Week 1-2:</strong> Backend API + database setup</li>
  <li><strong>Week 3:</strong> Photo verification integration + AI pipeline</li>
  <li><strong>Week 4:</strong> Payment routing + settlement</li>
  <li><strong>Week 5:</strong> Worker app + real-time job broadcasting</li>
  <li><strong>Week 6:</strong> Employer dashboard + rating system</li>
  <li><strong>Week 7:</strong> Testing, security audit, soft launch preparation</li>
</ul>

<h2>Immediate Next Steps (This Week)</h2>
<p>1. Schedule decision meeting — resolve all 6 questions</p>
<p>2. Engineering kickoff — review technical architecture</p>
<p>3. Legal review — insurance, liability, data privacy</p>
<p>4. Provider outreach — Stripe, photo verification vendors</p>
    `,
  },
};

export default function NewspaperDetailPage({ params }: { params: { slug: string } }) {
  const briefing = BRIEFINGS[params.slug];

  if (!briefing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Briefing no encontrado</h1>
          <p style={{ fontSize: 16, color: 'var(--color-cream-400)', marginBottom: 32 }}>
            El briefing que buscas no existe o ha sido removido.
          </p>
          <Link href="/newspaper" style={{ color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
            ← Volver a El Panorama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', paddingTop: 60 }}>
        <article style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
          {/* Header */}
          <header style={{ marginBottom: 48 }}>
            <Link href="/newspaper" style={{ fontSize: 13, color: 'var(--color-cream-400)', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
              ← Volver a El Panorama
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-gold-400)', padding: '4px 10px', background: 'var(--color-charcoal-800)', borderRadius: 4 }}>
                {briefing.category.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-cream-600)' }}>
                {briefing.readTime} · {briefing.audience}
              </span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {briefing.title}
            </h1>
          </header>

          {/* Content */}
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'var(--color-cream-200)',
            }}
            dangerouslySetInnerHTML={{ __html: briefing.content }}
          />

          {/* Footer */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--color-charcoal-700)' }}>
            <p style={{ fontSize: 14, color: 'var(--color-cream-400)' }}>
              Todos los briefings están disponibles en El Panorama. Suscríbete para recibir actualizaciones estratégicas directamente en tu correo.
            </p>
            <Link href="/newspaper" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Leer más briefings →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
