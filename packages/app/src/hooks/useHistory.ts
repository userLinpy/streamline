'use client'

import { useState, useEffect } from 'react'
import type { HistoryEntry } from '@/lib/history'

const STORAGE_KEY = 'streamline-history'
const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const all = JSON.parse(stored) as HistoryEntry[]
      const cutoff = Date.now() - TWO_MONTHS_MS
      setHistory(all.filter(e => new Date(e.visitedAt).getTime() > cutoff))
    } catch {}
  }, [])

  function clearHistory() {
    setHistory([])
    try {
      localStorage.setItem(STORAGE_KEY, '[]')
    } catch {}
  }

  function clearByPeriod(period: 'today' | 'week' | 'month') {
    const cutoffs: Record<string, number> = {
      today: Date.now() - 24 * 60 * 60 * 1000,
      week: Date.now() - 7 * 24 * 60 * 60 * 1000,
      month: Date.now() - 30 * 24 * 60 * 60 * 1000,
    }
    setHistory(prev => {
      const kept = prev.filter(e => new Date(e.visitedAt).getTime() < cutoffs[period])
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kept))
      } catch {}
      return kept
    })
  }

  return { history, clearHistory, clearByPeriod }
}
