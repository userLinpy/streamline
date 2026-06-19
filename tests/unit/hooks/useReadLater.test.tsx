import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReadLater } from '@/hooks/useReadLater'
import type { TechItem } from '@/types'

const mockItem: TechItem = {
  id: 'dt-1',
  source: 'devto',
  title: 'Test article',
  description: 'A test',
  url: 'https://dev.to/test',
  tags: ['react'],
  stars: 10,
  readTime: 5,
  publishedAt: '2026-06-18T10:00:00Z',
  coverInitials: 'TA',
}

describe('useReadLater', () => {
  beforeEach(() => localStorage.clear())

  it('should start with empty list', () => {
    const { result } = renderHook(() => useReadLater())
    expect(result.current.readLaterItems).toEqual([])
  })

  it('should add an item', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.readLaterItems).toHaveLength(1)
  })

  it('should detect item in list after adding', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.isInReadLater('dt-1')).toBe(true)
  })

  it('should return false for item not in list', () => {
    const { result } = renderHook(() => useReadLater())
    expect(result.current.isInReadLater('dt-999')).toBe(false)
  })

  it('should not duplicate items', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.readLaterItems).toHaveLength(1)
  })

  it('should remove an item', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    act(() => result.current.removeFromReadLater('dt-1'))
    expect(result.current.readLaterItems).toHaveLength(0)
    expect(result.current.isInReadLater('dt-1')).toBe(false)
  })
})
