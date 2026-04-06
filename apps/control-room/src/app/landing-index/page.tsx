import Link from 'next/link';

export default function LandingIndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, letterSpacing: '-0.02em' }}>Landing Pages</h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>
            <Link href="/landing" style={{ fontSize: 16, color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
              → Kupuri Media Marketing Landing
            </Link>
          </li>
          <li>
            <Link href="/synthia" style={{ fontSize: 16, color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
              → SYNTHIA™ 3.0 Platform Landing
            </Link>
          </li>
          <li>
            <Link href="/onboarding" style={{ fontSize: 16, color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
              → Onboarding Tour
            </Link>
          </li>
          <li>
            <Link href="/blog" style={{ fontSize: 16, color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
              → Blog
            </Link>
          </li>
          <li>
            <Link href="/newspaper" style={{ fontSize: 16, color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
              → El Panorama (Strategy Briefings)
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}