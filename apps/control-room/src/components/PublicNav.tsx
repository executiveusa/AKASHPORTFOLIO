'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Spheres', href: '/spheres' },
  { label: 'Skills', href: '/skills' },
  { label: 'Blog', href: '/blog' },
] as const;

export default function PublicNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        borderBottom: '1px solid var(--color-charcoal-600)',
        background: 'var(--color-charcoal-900)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-cream-100)', letterSpacing: '-0.02em' }}>
            SYNTHIA™
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-cream-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            3.0
          </span>
        </Link>

        {/* Center links — hidden on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-gold-400)' : 'var(--color-cream-400)',
                  textDecoration: 'none',
                  borderRadius: 6,
                  background: isActive ? 'var(--color-charcoal-700)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
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
            letterSpacing: '-0.01em',
          }}
        >
          Cockpit →
        </Link>
      </div>
    </nav>
  );
}
