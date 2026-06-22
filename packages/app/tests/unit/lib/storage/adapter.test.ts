import { describe, it, expect } from 'vitest'
import type { StorageAdapter } from '@/lib/storage/adapter'
import type { SourceFilters } from '@/hooks/useFilters'

describe('StorageAdapter', () => {
  it('should enforce the full adapter interface at compile time', () => {
    const sources: SourceFilters = { github: true, devto: true, 'github-release': true, hackernews: true, rss: true }
    const mockAdapter: StorageAdapter = {
      getFavorites: async () => [],
      addFavorite: async () => {},
      removeFavorite: async () => {},
      getReadLater: async () => [],
      addReadLater: async () => {},
      removeReadLater: async () => {},
      getWatchedRepos: async () => [],
      addWatchedRepo: async () => {},
      removeWatchedRepo: async () => {},
      getWatchedFeeds: async () => [],
      addWatchedFeed: async () => {},
      removeWatchedFeed: async () => {},
      getHistory: async () => [],
      addHistory: async () => {},
      clearHistory: async () => {},
      getPreferences: async () => ({ sources, activeTags: [], customTags: [] }),
      savePreferences: async () => {},
      getRecentSearches: async () => [],
      addRecentSearch: async () => {},
      removeRecentSearch: async () => {},
    }
    expect(mockAdapter).toBeDefined()
  })
})
