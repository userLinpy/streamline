'use client'

import { useState, useEffect } from 'react'
import { useStorageAdapter } from './useStorageAdapter'

export function useRecentSearches() {
  const adapter = useStorageAdapter()
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    void adapter.getRecentSearches().then(setSearches)
  }, [adapter])

  function addSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    void adapter.addRecentSearch(trimmed).then(() =>
      adapter.getRecentSearches().then(setSearches)
    )
  }

  function removeSearch(query: string) {
    void adapter.removeRecentSearch(query).then(() =>
      adapter.getRecentSearches().then(setSearches)
    )
  }

  return { searches, addSearch, removeSearch }
}
