'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechItem } from '@/types'
import { useStorageAdapter } from './useStorageAdapter'

export function useReadLater() {
  const adapter = useStorageAdapter()
  const [readLaterItems, setReadLaterItems] = useState<TechItem[]>([])

  useEffect(() => {
    void adapter.getReadLater().then(setReadLaterItems)
  }, [adapter])

  const addToReadLater = useCallback(
    (item: TechItem) => {
      void adapter.addReadLater(item).then(() => adapter.getReadLater().then(setReadLaterItems))
    },
    [adapter]
  )

  const removeFromReadLater = useCallback(
    (id: string) => {
      void adapter.removeReadLater(id).then(() => adapter.getReadLater().then(setReadLaterItems))
    },
    [adapter]
  )

  const isInReadLater = useCallback(
    (id: string) => readLaterItems.some(i => i.id === id),
    [readLaterItems]
  )

  return { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater }
}
