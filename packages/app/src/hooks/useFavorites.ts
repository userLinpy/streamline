'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored) as TechItem[])
    } catch {}
  }, [])

  const addFavorite = useCallback((item: TechItem) => {
    setFavorites(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      const next = [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.some(i => i.id === id),
    [favorites]
  )

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
