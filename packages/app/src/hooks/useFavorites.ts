'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechItem } from '@/types'
import { useStorageAdapter } from './useStorageAdapter'

export function useFavorites() {
  const adapter = useStorageAdapter()
  const [favorites, setFavorites] = useState<TechItem[]>([])

  useEffect(() => {
    void adapter.getFavorites().then(setFavorites)
  }, [adapter])

  const addFavorite = useCallback(
    (item: TechItem) => {
      void adapter.addFavorite(item).then(() => adapter.getFavorites().then(setFavorites))
    },
    [adapter]
  )

  const removeFavorite = useCallback(
    (id: string) => {
      void adapter.removeFavorite(id).then(() => adapter.getFavorites().then(setFavorites))
    },
    [adapter]
  )

  const isFavorite = useCallback(
    (id: string) => favorites.some(i => i.id === id),
    [favorites]
  )

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
