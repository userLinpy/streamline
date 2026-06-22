'use client'

import { useState, useEffect } from 'react'
import { useStorageAdapter } from './useStorageAdapter'

export function useWatchedFeeds() {
  const adapter = useStorageAdapter()
  const [feeds, setFeeds] = useState<string[]>([])

  useEffect(() => {
    void adapter.getWatchedFeeds().then(setFeeds)
  }, [adapter])

  function addFeed(url: string): boolean {
    const trimmed = url.trim()
    if (!trimmed) return false
    try { new URL(trimmed) } catch { return false }
    void adapter.addWatchedFeed(trimmed).then(() =>
      adapter.getWatchedFeeds().then(setFeeds)
    )
    return true
  }

  function removeFeed(url: string) {
    void adapter.removeWatchedFeed(url).then(() =>
      adapter.getWatchedFeeds().then(setFeeds)
    )
  }

  return { feeds, addFeed, removeFeed }
}
