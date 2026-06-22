import { describe, it, expect, beforeEach } from 'vitest'
import { localStorageAdapter } from '@/lib/storage/local'
import type { TechItem } from '@/types'

const mockItem: TechItem = {
  id: 'test-1',
  source: 'github',
  title: 'Test Repo',
  description: 'A test repo',
  url: 'https://github.com/test/repo',
  tags: ['typescript'],
  stars: 100,
  readTime: 3,
  publishedAt: '2026-01-01',
  coverInitials: 'TR',
}

beforeEach(() => {
  localStorage.clear()
})

describe('LocalStorageAdapter — favorites', () => {
  it('should return empty array when no favorites stored', async () => {
    const result = await localStorageAdapter.getFavorites()
    expect(result).toEqual([])
  })

  it('should add and retrieve a favorite', async () => {
    await localStorageAdapter.addFavorite(mockItem)
    const result = await localStorageAdapter.getFavorites()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-1')
  })

  it('should not add duplicate favorites', async () => {
    await localStorageAdapter.addFavorite(mockItem)
    await localStorageAdapter.addFavorite(mockItem)
    const result = await localStorageAdapter.getFavorites()
    expect(result).toHaveLength(1)
  })

  it('should remove a favorite by id', async () => {
    await localStorageAdapter.addFavorite(mockItem)
    await localStorageAdapter.removeFavorite('test-1')
    const result = await localStorageAdapter.getFavorites()
    expect(result).toHaveLength(0)
  })
})

describe('LocalStorageAdapter — recentSearches', () => {
  it('should add and retrieve recent searches (most recent first)', async () => {
    await localStorageAdapter.addRecentSearch('typescript')
    await localStorageAdapter.addRecentSearch('react')
    const result = await localStorageAdapter.getRecentSearches()
    expect(result[0]).toBe('react')
    expect(result[1]).toBe('typescript')
  })

  it('should remove a search', async () => {
    await localStorageAdapter.addRecentSearch('typescript')
    await localStorageAdapter.removeRecentSearch('typescript')
    const result = await localStorageAdapter.getRecentSearches()
    expect(result).toHaveLength(0)
  })
})
