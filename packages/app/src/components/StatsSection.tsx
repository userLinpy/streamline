'use client'

import { useMemo } from 'react'
import { BarChart3, Clock, Star, Bookmark } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import { useFavorites } from '@/hooks/useFavorites'
import { useReadLater } from '@/hooks/useReadLater'

const SOURCE_LABELS: Record<string, string> = {
  github: 'GitHub',
  devto: 'Dev.to',
  hackernews: 'Hacker News',
  'github-release': 'Releases',
  rss: 'RSS',
}

const SOURCE_BAR_COLORS: Record<string, string> = {
  github: 'bg-zinc-700 dark:bg-zinc-400',
  devto: 'bg-zinc-900 dark:bg-white',
  hackernews: 'bg-orange-500',
  'github-release': 'bg-blue-500',
  rss: 'bg-cyan-500',
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function StatsSection() {
  const { history } = useHistory()
  const { favorites } = useFavorites()
  const { readLaterItems } = useReadLater()

  const DAY_MS = 24 * 60 * 60 * 1000

  const periodCounts = useMemo(() => {
    const now = Date.now()
    return {
      today: history.filter(e => now - new Date(e.visitedAt).getTime() < DAY_MS).length,
      week: history.filter(e => now - new Date(e.visitedAt).getTime() < 7 * DAY_MS).length,
      month: history.filter(e => now - new Date(e.visitedAt).getTime() < 30 * DAY_MS).length,
    }
  }, [history, DAY_MS])

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    history.forEach(e => {
      counts[e.source] = (counts[e.source] ?? 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [history])

  const maxSourceCount = sourceCounts[0]?.[1] ?? 1

  const dayCounts = useMemo(() => {
    const counts = Array<number>(7).fill(0)
    history.forEach(e => {
      counts[new Date(e.visitedAt).getDay()]++
    })
    return counts
  }, [history])

  const maxDayCount = Math.max(...dayCounts, 1)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <BarChart3 size={28} className="text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Aucune donnée pour l'instant — consulte quelques articles d'abord
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard icon={<Clock size={16} />} label="Articles lus" value={history.length} color="text-indigo-500 dark:text-indigo-400" />
        <KpiCard icon={<Star size={16} />} label="Favoris" value={favorites.length} color="text-amber-500 dark:text-amber-400" />
        <KpiCard icon={<Bookmark size={16} />} label="À lire" value={readLaterItems.length} color="text-rose-500 dark:text-rose-400" />
      </div>

      {/* Activité par période */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
          Activité
        </h3>
        <div className="space-y-2.5">
          {(
            [
              ["Aujourd'hui", periodCounts.today],
              ['Cette semaine', periodCounts.week],
              ['Ce mois', periodCounts.month],
            ] as [string, number][]
          ).map(([label, count]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 w-28 shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / history.length) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 w-6 text-right tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      {sourceCounts.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            Sources préférées
          </h3>
          <div className="space-y-2.5">
            {sourceCounts.map(([source, count]) => (
              <div key={source} className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 w-28 shrink-0 truncate">
                  {SOURCE_LABELS[source] ?? source}
                </span>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${SOURCE_BAR_COLORS[source] ?? 'bg-indigo-400'}`}
                    style={{ width: `${Math.round((count / maxSourceCount) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 w-6 text-right tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jour le plus actif */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
          Activité par jour de la semaine
        </h3>
        <div className="flex items-end gap-1.5 h-16">
          {dayCounts.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center flex-1">
                <div
                  className="w-full bg-indigo-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${Math.round((count / maxDayCount) * 100)}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">
                {DAY_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1 text-center">
      <div className={color}>{icon}</div>
      <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{value}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{label}</span>
    </div>
  )
}
