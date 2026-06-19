'use client'

import { useState, useEffect } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_read_later'

export function useReadLater() {
  const [readLaterItems, setReadLaterItems] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setReadLaterItems(JSON.parse(stored) as TechItem[])
    } catch {
      setReadLaterItems([])
    }
  }, [])

  const addToReadLater = (item: TechItem) => {
    setReadLaterItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      const next = [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const removeFromReadLater = (id: string) => {
    setReadLaterItems(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isInReadLater = (id: string) => readLaterItems.some(i => i.id === id)

  return { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater }
}
