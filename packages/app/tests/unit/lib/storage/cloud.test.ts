import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/actions/favorites', () => ({
  getFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => {}),
  removeFavorite: vi.fn(async () => {}),
}))
vi.mock('@/actions/read-later', () => ({
  getReadLater: vi.fn(async () => []),
  addReadLater: vi.fn(async () => {}),
  removeReadLater: vi.fn(async () => {}),
}))
vi.mock('@/actions/watched-repos', () => ({
  getWatchedRepos: vi.fn(async () => []),
  addWatchedRepo: vi.fn(async () => {}),
  removeWatchedRepo: vi.fn(async () => {}),
}))
vi.mock('@/actions/watched-feeds', () => ({
  getWatchedFeeds: vi.fn(async () => []),
  addWatchedFeed: vi.fn(async () => {}),
  removeWatchedFeed: vi.fn(async () => {}),
}))
vi.mock('@/actions/history', () => ({
  getHistory: vi.fn(async () => []),
  addHistory: vi.fn(async () => {}),
  clearHistory: vi.fn(async () => {}),
}))
vi.mock('@/actions/preferences', () => ({
  getPreferences: vi.fn(async () => ({ sources: {}, activeTags: [], customTags: [] })),
  savePreferences: vi.fn(async () => {}),
}))
vi.mock('@/actions/recent-searches', () => ({
  getRecentSearches: vi.fn(async () => []),
  addRecentSearch: vi.fn(async () => {}),
  removeRecentSearch: vi.fn(async () => {}),
}))

import { cloudAdapter } from '@/lib/storage/cloud'
import * as favActions from '@/actions/favorites'

describe('CloudAdapter', () => {
  it('should call getFavorites action', async () => {
    await cloudAdapter.getFavorites()
    expect(favActions.getFavorites).toHaveBeenCalled()
  })

  it('should call addFavorite action with item', async () => {
    const item = { id: '1', source: 'github' } as never
    await cloudAdapter.addFavorite(item)
    expect(favActions.addFavorite).toHaveBeenCalledWith(item)
  })
})
