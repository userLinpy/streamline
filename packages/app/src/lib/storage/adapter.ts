import type { TechItem } from '@/types'
import type { HistoryEntry } from '@/lib/history'
import type { Filters } from '@/hooks/useFilters'

export type { HistoryEntry, Filters }

export interface StorageAdapter {
  getFavorites(): Promise<TechItem[]>
  addFavorite(item: TechItem): Promise<void>
  removeFavorite(id: string): Promise<void>

  getReadLater(): Promise<TechItem[]>
  addReadLater(item: TechItem): Promise<void>
  removeReadLater(id: string): Promise<void>

  getWatchedRepos(): Promise<string[]>
  addWatchedRepo(repo: string): Promise<void>
  removeWatchedRepo(repo: string): Promise<void>

  getWatchedFeeds(): Promise<string[]>
  addWatchedFeed(url: string): Promise<void>
  removeWatchedFeed(url: string): Promise<void>

  getHistory(): Promise<HistoryEntry[]>
  addHistory(entry: HistoryEntry): Promise<void>
  clearHistory(): Promise<void>

  getPreferences(): Promise<Filters>
  savePreferences(prefs: Filters): Promise<void>

  getRecentSearches(): Promise<string[]>
  addRecentSearch(query: string): Promise<void>
  removeRecentSearch(query: string): Promise<void>
}
