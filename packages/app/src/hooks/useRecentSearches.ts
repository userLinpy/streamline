'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'streamline-searches'
const MAX = 10

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSearches(JSON.parse(stored) as string[])
    } catch {}
  }, [])

  function addSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    setSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function removeSearch(query: string) {
    setSearches(prev => {
      const next = prev.filter(s => s !== query)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { searches, addSearch, removeSearch }
}
