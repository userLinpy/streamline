'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_read_later'

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

export function useReadLater() {
  const [readLaterItems, setReadLaterItems] = useState<TechItem[]>([])

  useEffect(() => {
    setReadLaterItems(readStorage())
  }, [])

  const addToReadLater = useCallback((item: TechItem) => {
    const current = readStorage()
    if (current.some(i => i.id === item.id)) return
    const next = [...current, item]
    writeStorage(next)
    setReadLaterItems(next)
  }, [])

  const removeFromReadLater = useCallback((id: string) => {
    const next = readStorage().filter(i => i.id !== id)
    writeStorage(next)
    setReadLaterItems(next)
  }, [])

  const isInReadLater = useCallback(
    (id: string) => readLaterItems.some(i => i.id === id),
    [readLaterItems]
  )

  return { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater }
}
