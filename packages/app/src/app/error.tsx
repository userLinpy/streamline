'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-sm font-medium text-zinc-700 mb-1">Une erreur est survenue</p>
        <p className="text-xs text-zinc-400 mb-6">
          {error.message ?? 'Impossible de charger cette page.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-xs text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="text-xs text-zinc-600 px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  )
}
