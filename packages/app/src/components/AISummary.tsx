'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

type Props = { title: string; text: string }

export function AISummary({ title, text }: Props) {
  const [points, setPoints] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summarize = async () => {
    if (points !== null || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Erreur serveur')
      }
      const data = (await res.json()) as { points: string[] }
      setPoints(data.points)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900">
      {points === null ? (
        <div className="flex items-center gap-3">
          <button
            onClick={summarize}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-200 dark:hover:bg-violet-950/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {loading ? 'Résumé en cours…' : 'Résumer avec IA'}
          </button>
          {error && (
            <span className="text-xs text-rose-500">{error}</span>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles size={12} className="text-violet-500" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
              Résumé IA
            </span>
          </div>
          <ul className="space-y-1.5">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <span className="text-violet-500 font-bold shrink-0 mt-px">{i + 1}.</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
