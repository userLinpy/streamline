import { vi } from 'vitest'
import { localStorageAdapter } from '@/lib/storage/local'

vi.mock('./useStorageAdapter', () => ({
  useStorageAdapter: () => localStorageAdapter,
}))

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWatchedRepos } from './useWatchedRepos'

beforeEach(() => {
  localStorage.clear()
})

describe('useWatchedRepos', () => {
  it('should start with empty custom repos', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.customRepos).toEqual([])
  })

  it('should validate format owner/repo as true', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.isValidRepo('facebook/react')).toBe(true)
    expect(result.current.isValidRepo('owner-name/repo.name')).toBe(true)
  })

  it('should reject invalid formats', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.isValidRepo('notarepo')).toBe(false)
    expect(result.current.isValidRepo('')).toBe(false)
    expect(result.current.isValidRepo('has spaces/repo')).toBe(false)
    expect(result.current.isValidRepo('/noslug')).toBe(false)
  })

  it('should add a valid repo and return true', async () => {
    const { result } = renderHook(() => useWatchedRepos())
    let returnValue = false
    await act(async () => { returnValue = result.current.addRepo('facebook/react') })
    expect(returnValue).toBe(true)
    await waitFor(() => expect(result.current.customRepos).toContain('facebook/react'))
  })

  it('should reject invalid repo and return false', () => {
    const { result } = renderHook(() => useWatchedRepos())
    let returnValue = true
    act(() => { returnValue = result.current.addRepo('invalid') })
    expect(returnValue).toBe(false)
    expect(result.current.customRepos).toEqual([])
  })

  it('should ignore duplicate repos', async () => {
    const { result } = renderHook(() => useWatchedRepos())
    await act(async () => { result.current.addRepo('facebook/react') })
    await act(async () => { result.current.addRepo('facebook/react') })
    await waitFor(() =>
      expect(result.current.customRepos.filter(r => r === 'facebook/react').length).toBe(1)
    )
  })

  it('should remove a repo', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    act(() => { result.current.removeRepo('facebook/react') })
    expect(result.current.customRepos).not.toContain('facebook/react')
  })

  it('should persist repos to localStorage on add', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    const stored = JSON.parse(localStorage.getItem('streamline_custom_repos') ?? '[]') as string[]
    expect(stored).toContain('facebook/react')
  })

  it('should persist removal to localStorage', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    act(() => { result.current.removeRepo('facebook/react') })
    const stored = JSON.parse(localStorage.getItem('streamline_custom_repos') ?? '[]') as string[]
    expect(stored).not.toContain('facebook/react')
  })
})
