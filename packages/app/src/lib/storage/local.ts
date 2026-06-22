import type { TechItem } from '@/types'
import type { HistoryEntry } from '@/lib/history'
import type { Filters } from '@/hooks/useFilters'
import type { StorageAdapter } from './adapter'

const KEYS = {
  favorites: 'streamline_favorites',
  readLater: 'streamline_read_later',
  repos: 'streamline_custom_repos',
  feeds: 'streamline-feeds',
  history: 'streamline-history',
  filters: 'streamline-filters',
  searches: 'streamline-searches',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const DEFAULT_FILTERS: Filters = {
  sources: { github: true, devto: true, 'github-release': true, hackernews: true, rss: true },
  activeTags: [],
  customTags: [],
}

const MAX_SEARCHES = 10
const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000

export const localStorageAdapter: StorageAdapter = {
  async getFavorites() {
    return read<TechItem[]>(KEYS.favorites, [])
  },
  async addFavorite(item) {
    const current = read<TechItem[]>(KEYS.favorites, [])
    if (current.some(i => i.id === item.id)) return
    write(KEYS.favorites, [...current, item])
  },
  async removeFavorite(id) {
    write(KEYS.favorites, read<TechItem[]>(KEYS.favorites, []).filter(i => i.id !== id))
  },

  async getReadLater() {
    return read<TechItem[]>(KEYS.readLater, [])
  },
  async addReadLater(item) {
    const current = read<TechItem[]>(KEYS.readLater, [])
    if (current.some(i => i.id === item.id)) return
    write(KEYS.readLater, [...current, item])
  },
  async removeReadLater(id) {
    write(KEYS.readLater, read<TechItem[]>(KEYS.readLater, []).filter(i => i.id !== id))
  },

  async getWatchedRepos() {
    return read<string[]>(KEYS.repos, [])
  },
  async addWatchedRepo(repo) {
    const current = read<string[]>(KEYS.repos, [])
    if (current.includes(repo)) return
    write(KEYS.repos, [...current, repo])
  },
  async removeWatchedRepo(repo) {
    write(KEYS.repos, read<string[]>(KEYS.repos, []).filter(r => r !== repo))
  },

  async getWatchedFeeds() {
    return read<string[]>(KEYS.feeds, [])
  },
  async addWatchedFeed(url) {
    const current = read<string[]>(KEYS.feeds, [])
    if (current.includes(url)) return
    write(KEYS.feeds, [...current, url])
  },
  async removeWatchedFeed(url) {
    write(KEYS.feeds, read<string[]>(KEYS.feeds, []).filter(f => f !== url))
  },

  async getHistory() {
    const all = read<HistoryEntry[]>(KEYS.history, [])
    const cutoff = Date.now() - TWO_MONTHS_MS
    return all.filter(e => new Date(e.visitedAt).getTime() > cutoff)
  },
  async addHistory(entry) {
    const all = read<HistoryEntry[]>(KEYS.history, [])
    const cutoff = Date.now() - TWO_MONTHS_MS
    const filtered = all.filter(
      e => e.id !== entry.id && new Date(e.visitedAt).getTime() > cutoff
    )
    filtered.unshift(entry)
    write(KEYS.history, filtered.slice(0, 500))
  },
  async clearHistory() {
    write(KEYS.history, [])
  },

  async getPreferences() {
    const stored = read<Partial<Filters>>(KEYS.filters, {})
    return {
      sources: { ...DEFAULT_FILTERS.sources, ...(stored.sources ?? {}) },
      activeTags: stored.activeTags ?? [],
      customTags: stored.customTags ?? [],
    }
  },
  async savePreferences(prefs) {
    write(KEYS.filters, prefs)
  },

  async getRecentSearches() {
    return read<string[]>(KEYS.searches, [])
  },
  async addRecentSearch(query) {
    const trimmed = query.trim()
    if (!trimmed) return
    const current = read<string[]>(KEYS.searches, [])
    const next = [trimmed, ...current.filter(s => s !== trimmed)].slice(0, MAX_SEARCHES)
    write(KEYS.searches, next)
  },
  async removeRecentSearch(query) {
    write(KEYS.searches, read<string[]>(KEYS.searches, []).filter(s => s !== query))
  },
}
