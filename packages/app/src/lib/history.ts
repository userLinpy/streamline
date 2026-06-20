export type HistoryEntry = {
  id: string
  title: string
  source: string
  detailPath: string
  visitedAt: string
}

const STORAGE_KEY = 'streamline-history'
const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000

export function trackVisit(entry: Omit<HistoryEntry, 'visitedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const all: HistoryEntry[] = stored ? (JSON.parse(stored) as HistoryEntry[]) : []
    const cutoff = Date.now() - TWO_MONTHS_MS
    const filtered = all.filter(
      e => e.id !== entry.id && new Date(e.visitedAt).getTime() > cutoff
    )
    filtered.unshift({ ...entry, visitedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 500)))
  } catch {}
}
