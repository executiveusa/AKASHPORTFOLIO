import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-charcoal-900)',
      color: 'var(--color-cream-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em',
          color: 'var(--color-gold-400)', textTransform: 'uppercase',
          fontWeight: '700', marginBottom: '16px'
        }}>
          Error 404
        </div>
        <h1 style={{
          fontSize: '56px', fontWeight: '900', letterSpacing: '-0.03em',
          color: 'var(--color-cream-100)', marginBottom: '12px', lineHeight: '1'
        }}>
          Página no encontrada
        </h1>
        <p style={{
          fontSize: '15px', lineHeight: '1.6',
          color: 'var(--color-cream-400)', marginBottom: '40px'
        }}>
          La página que buscas no existe o fue movida.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/landing" style={{
            padding: '12px 24px', fontSize: '12px', fontWeight: '700',
            backgroundColor: 'var(--color-gold-400)',
            color: 'var(--color-charcoal-900)',
            textDecoration: 'none',
            letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '2px'
          }}>
            Volver al inicio
          </Link>
          <Link href="/dashboard" style={{
            padding: '12px 24px', fontSize: '12px', fontWeight: '700',
            border: '1px solid color-mix(in srgb, var(--color-gold-600) 40%, transparent)',
            color: 'var(--color-gold-400)',
            textDecoration: 'none',
            letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '2px'
          }}>
            Ir al Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
