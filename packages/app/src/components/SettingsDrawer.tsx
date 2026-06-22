'use client'

import { useState } from 'react'
import { X, Clock, Trash2, History } from 'lucide-react'
import Link from 'next/link'
import { useHistory } from '@/hooks/useHistory'
import { formatRelativeDate } from '@/lib/utils'
import { SourceIcon } from './SourceIcon'
import type { TechItem } from '@/types'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: "Auj." },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'all', label: 'Tout' },
]

export function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const { history, clearHistory, clearByPeriod } = useHistory()
  const [period, setPeriod] = useState<Period>('all')

  const now = Date.now()
  const cutoffs: Record<Period, number> = {
    today: now - 24 * 60 * 60 * 1000,
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    all: 0,
  }

  const filtered =
    period === 'all'
      ? history
      : history.filter(e => new Date(e.visitedAt).getTime() > cutoffs[period])

  const isExternal = (path: string) => path.startsWith('http')

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 z-30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <History size={14} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Historique
            </span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full font-bold">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Period filter */}
        <div className="flex gap-1 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 text-xs py-1 rounded-lg transition-colors font-medium ${
                period === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 gap-2">
              <Clock size={28} className="opacity-30" />
              <p className="text-xs">Aucun article consulté</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {filtered.map((entry, i) => (
                <li key={`${entry.id}-${i}`}>
                  {isExternal(entry.detailPath) ? (
                    <a
                      href={entry.detailPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex items-start gap-2.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <span className="shrink-0 mt-0.5 w-4 flex items-center justify-center">
                        <SourceIcon source={entry.source as TechItem['source']} size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                          {entry.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {formatRelativeDate(entry.visitedAt)}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={entry.detailPath}
                      onClick={onClose}
                      className="flex items-start gap-2.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <span className="shrink-0 mt-0.5 w-4 flex items-center justify-center">
                        <SourceIcon source={entry.source as TechItem['source']} size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                          {entry.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {formatRelativeDate(entry.visitedAt)}
                        </p>
                      </div>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-1">
            {period !== 'all' && filtered.length > 0 && (
              <button
                onClick={() => clearByPeriod(period)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-rose-500 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
              >
                <Trash2 size={11} />
                Effacer cette période
              </button>
            )}
            <button
              onClick={clearHistory}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
            >
              <Trash2 size={11} />
              Effacer tout l&apos;historique
            </button>
          </div>
        )}
      </div>
    </>
  )
}
