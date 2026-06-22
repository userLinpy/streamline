'use client'

import { useState, useEffect } from 'react'
import type { HistoryEntry } from '@/lib/history'
import { useStorageAdapter } from './useStorageAdapter'

export function useHistory() {
  const adapter = useStorageAdapter()
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    void adapter.getHistory().then(setHistory)
  }, [adapter])

  function clearHistory() {
    void adapter.clearHistory().then(() => setHistory([]))
  }

  function clearByPeriod(period: 'today' | 'week' | 'month') {
    const cutoffs: Record<string, number> = {
      today: Date.now() - 24 * 60 * 60 * 1000,
      week: Date.now() - 7 * 24 * 60 * 60 * 1000,
      month: Date.now() - 30 * 24 * 60 * 60 * 1000,
    }
    setHistory(prev => prev.filter(e => new Date(e.visitedAt).getTime() < cutoffs[period]))
  }

  return { history, clearHistory, clearByPeriod }
}
