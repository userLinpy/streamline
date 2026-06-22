'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_favorites'

function readStorage(): TechItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TechItem[]) : []
  } catch {
    return []
  }
}

function writeStorage(items: TechItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<TechItem[]>([])

  useEffect(() => {
    setFavorites(readStorage())
  }, [])

  const addFavorite = useCallback((item: TechItem) => {
    const current = readStorage()
    if (current.some(i => i.id === item.id)) return
    const next = [...current, item]
    writeStorage(next)
    setFavorites(next)
  }, [])

  const removeFavorite = useCallback((id: string) => {
    const next = readStorage().filter(i => i.id !== id)
    writeStorage(next)
    setFavorites(next)
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.some(i => i.id === id),
    [favorites]
  )

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
