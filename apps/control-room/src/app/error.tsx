'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
          color: 'var(--color-gold-600)', textTransform: 'uppercase',
          fontWeight: '700', marginBottom: '16px'
        }}>
          Error del sistema
        </div>
        <h1 style={{
          fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em',
          color: 'var(--color-cream-100)', marginBottom: '12px', lineHeight: '1.1'
        }}>
          Algo salió mal.
        </h1>
        <p style={{
          fontSize: '15px', lineHeight: '1.6',
          color: 'var(--color-cream-400)', marginBottom: '8px'
        }}>
          Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
        </p>
        {error.message && (
          <p style={{
            fontSize: '12px',
            color: 'var(--color-cream-400)',
            backgroundColor: 'var(--color-charcoal-800)',
            border: '1px solid color-mix(in srgb, var(--color-gold-600) 20%, transparent)',
            padding: '12px 16px',
            marginBottom: '32px',
            fontFamily: 'monospace',
            opacity: 0.7
          }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: error.message ? '0' : '32px' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px', fontSize: '12px', fontWeight: '700',
              backgroundColor: 'var(--color-gold-400)',
              color: 'var(--color-charcoal-900)',
              border: 'none', cursor: 'pointer',
              letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '2px'
            }}
          >
            Reintentar
          </button>
          <Link href="/landing" style={{
            padding: '12px 24px', fontSize: '12px', fontWeight: '700',
            border: '1px solid color-mix(in srgb, var(--color-gold-600) 40%, transparent)',
            color: 'var(--color-gold-400)',
            textDecoration: 'none',
            letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '2px'
          }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
