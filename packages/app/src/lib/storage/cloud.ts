import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '@/actions/favorites'
import {
  getReadLater,
  addReadLater,
  removeReadLater,
} from '@/actions/read-later'
import {
  getWatchedRepos,
  addWatchedRepo,
  removeWatchedRepo,
} from '@/actions/watched-repos'
import {
  getWatchedFeeds,
  addWatchedFeed,
  removeWatchedFeed,
} from '@/actions/watched-feeds'
import {
  getHistory,
  addHistory,
  clearHistory,
} from '@/actions/history'
import { getPreferences, savePreferences } from '@/actions/preferences'
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
} from '@/actions/recent-searches'
import type { StorageAdapter } from './adapter'

export const cloudAdapter: StorageAdapter = {
  getFavorites,
  addFavorite,
  removeFavorite,
  getReadLater,
  addReadLater,
  removeReadLater,
  getWatchedRepos,
  addWatchedRepo,
  removeWatchedRepo,
  getWatchedFeeds,
  addWatchedFeed,
  removeWatchedFeed,
  getHistory,
  addHistory,
  clearHistory,
  getPreferences,
  savePreferences,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
}
