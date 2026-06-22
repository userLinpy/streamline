import { vi } from 'vitest'
import { localStorageAdapter } from '@/lib/storage/local'

vi.mock('./useStorageAdapter', () => ({
  useStorageAdapter: () => localStorageAdapter,
}))

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilters } from './useFilters'

describe('useFilters', () => {
  it('should start with all sources enabled', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.sources.github).toBe(true)
    expect(result.current.filters.sources.devto).toBe(true)
    expect(result.current.filters.sources['github-release']).toBe(true)
    expect(result.current.filters.sources.hackernews).toBe(true)
  })

  it('should start with no active tags', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.activeTags).toEqual([])
  })

  it('should start with no custom tags', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.customTags).toEqual([])
  })

  it('should disable a source when toggleSource called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleSource('github') })
    expect(result.current.filters.sources.github).toBe(false)
  })

  it('should re-enable a source on second toggleSource call', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleSource('github') })
    act(() => { result.current.toggleSource('github') })
    expect(result.current.filters.sources.github).toBe(true)
  })

  it('should activate a tag when toggleTag called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleTag('Python') })
    expect(result.current.filters.activeTags).toContain('Python')
  })

  it('should deactivate an active tag on second toggleTag call', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleTag('Python') })
    act(() => { result.current.toggleTag('Python') })
    expect(result.current.filters.activeTags).not.toContain('Python')
  })

  it('should add a tag to customTags when addCustomTag called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    expect(result.current.filters.customTags).toContain('Kotlin')
  })

  it('should trim whitespace in addCustomTag', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('  Kotlin  ') })
    expect(result.current.filters.customTags).toContain('Kotlin')
  })

  it('should ignore duplicate custom tags', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    act(() => { result.current.addCustomTag('Kotlin') })
    expect(result.current.filters.customTags.filter(t => t === 'Kotlin').length).toBe(1)
  })

  it('should remove tag from customTags and activeTags on removeCustomTag', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    act(() => { result.current.toggleTag('Kotlin') })
    act(() => { result.current.removeCustomTag('Kotlin') })
    expect(result.current.filters.customTags).not.toContain('Kotlin')
    expect(result.current.filters.activeTags).not.toContain('Kotlin')
  })
})
