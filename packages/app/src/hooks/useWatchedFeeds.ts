'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'streamline-feeds'

export function useWatchedFeeds() {
  const [feeds, setFeeds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFeeds(JSON.parse(stored) as string[])
    } catch {}
  }, [])

  function addFeed(url: string): boolean {
    const trimmed = url.trim()
    if (!trimmed) return false
    try {
      new URL(trimmed)
    } catch {
      return false
    }
    if (feeds.includes(trimmed)) return false
    const next = [...feeds, trimmed]
    setFeeds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    return true
  }

  function removeFeed(url: string) {
    const next = feeds.filter(f => f !== url)
    setFeeds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  return { feeds, addFeed, removeFeed }
}
