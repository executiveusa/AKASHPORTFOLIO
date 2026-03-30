'use client';

import Link from 'next/link';

const DIRECTORY_URL = process.env.NEXT_PUBLIC_DIRECTORY_URL || 'https://directorio-kupuri.vercel.app';

const FOOTER_SECTIONS = [
  {
    title: 'Producto',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Spheres', href: '/spheres' },
      { label: 'Skills', href: '/skills' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Plataforma',
    links: [
      { label: 'Cockpit', href: '/cockpit' },
      { label: 'Coordinación', href: '/coordination' },
      { label: 'Theater', href: '/theater' },
      { label: 'Watcher', href: '/watcher' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Directorio Kupuri™', href: DIRECTORY_URL, external: true },
      { label: 'Documentación', href: '/docs' },
      { label: 'Contacto', href: 'mailto:kupurimedia@gmail.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacy' },
      { label: 'Términos', href: '/terms' },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-charcoal-600)',
        background: 'var(--color-charcoal-900)',
        padding: '48px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Link columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 32,
            marginBottom: 40,
          }}
        >
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-cream-400)',
                  marginBottom: 12,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.links.map((link) => {
                  const isExternal = 'external' in link && link.external;
                  const isMailto = link.href.startsWith('mailto:');
                  if (isExternal || isMailto) {
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          style={{
                            fontSize: 14,
                            color: 'var(--color-cream-200)',
                            textDecoration: 'none',
                          }}
                        >
                          {link.label}
                          {isExternal && ' ↗'}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        style={{
                          fontSize: 14,
                          color: 'var(--color-cream-200)',
                          textDecoration: 'none',
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-charcoal-700)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-cream-100)', letterSpacing: '-0.02em' }}>
              KUPURI MEDIA™
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-cream-600)' }}>
            © {new Date().getFullYear()} Kupuri Media™ · Synthia™ 3.0
          </div>
        </div>
      </div>
    </footer>
  );
}
