'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-black mb-4 text-red-400">¡Error Critical!</h2>
          <p className="text-slate-300 mb-6">Algo muy grave salió mal en la aplicación.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-colors"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
