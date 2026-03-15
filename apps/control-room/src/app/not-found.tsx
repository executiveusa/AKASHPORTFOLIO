import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-6xl font-black mb-4 text-emerald-400">404</h2>
        <p className="text-2xl font-bold mb-2">Página no encontrada</p>
        <p className="text-slate-300 mb-6">La página que buscas no existe.</p>
        <Link
          href="/landing-index"
          className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
