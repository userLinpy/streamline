'use client'

import { useState, useEffect, useCallback } from 'react'

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

const KEY = 'streamline-notifications'
const MAX = 50
const CHANGE_EVENT = 'streamline-notifications-changed'

function load(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AppNotification[]) : []
  } catch {
    return []
  }
}

function persist(notifications: AppNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notifications.slice(0, MAX)))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {}
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    setNotifications(load())
    const sync = () => setNotifications(load())
    window.addEventListener(CHANGE_EVENT, sync)
    return () => window.removeEventListener(CHANGE_EVENT, sync)
  }, [])

  const addNotification = useCallback((notif: Pick<AppNotification, 'title' | 'body'>) => {
    const entry: AppNotification = {
      ...notif,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications(prev => {
      const next = [entry, ...prev].slice(0, MAX)
      persist(next)
      return next
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, read: true } : n))
      persist(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      persist(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    persist([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, addNotification, markRead, markAllRead, clearAll, unreadCount }
}
