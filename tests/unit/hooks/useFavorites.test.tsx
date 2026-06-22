import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { localStorageAdapter } from '@/lib/storage/local'
import { useFavorites } from '@/hooks/useFavorites'
import type { TechItem } from '@/types'

vi.mock('@/hooks/useStorageAdapter', () => ({ useStorageAdapter: () => localStorageAdapter }))

const mockItem: TechItem = {
  id: 'gh-1',
  source: 'github',
  title: 'shadcn/ui',
  description: 'UI components',
  url: 'https://github.com/shadcn/ui',
  tags: ['typescript'],
  stars: 80000,
  readTime: 0,
  publishedAt: '2026-06-17T10:00:00Z',
  ownerAvatar: 'https://avatars.githubusercontent.com/u/1',
  coverInitials: 'SU',
}

describe('useFavorites', () => {
  beforeEach(() => localStorage.clear())

  it('should start with empty list', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('should add a favorite', async () => {
    const { result } = renderHook(() => useFavorites())
    await act(async () => { result.current.addFavorite(mockItem) })
    expect(result.current.favorites).toHaveLength(1)
  })

  it('should detect favorite status', async () => {
    const { result } = renderHook(() => useFavorites())
    await act(async () => { result.current.addFavorite(mockItem) })
    expect(result.current.isFavorite('gh-1')).toBe(true)
    expect(result.current.isFavorite('gh-999')).toBe(false)
  })

  it('should not duplicate favorites', async () => {
    const { result } = renderHook(() => useFavorites())
    await act(async () => { result.current.addFavorite(mockItem) })
    await act(async () => { result.current.addFavorite(mockItem) })
    expect(result.current.favorites).toHaveLength(1)
  })

  it('should remove a favorite', async () => {
    const { result } = renderHook(() => useFavorites())
    await act(async () => { result.current.addFavorite(mockItem) })
    await act(async () => { result.current.removeFavorite('gh-1') })
    expect(result.current.favorites).toHaveLength(0)
    expect(result.current.isFavorite('gh-1')).toBe(false)
  })
})
