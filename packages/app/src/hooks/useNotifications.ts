'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  href?: string
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
  // Ref so mutation callbacks always read the latest state without stale closures
  const ref = useRef<AppNotification[]>([])

  useEffect(() => {
    const loaded = load()
    ref.current = loaded
    setNotifications(loaded)
    const sync = () => {
      const next = load()
      ref.current = next
      setNotifications(next)
    }
    window.addEventListener(CHANGE_EVENT, sync)
    return () => window.removeEventListener(CHANGE_EVENT, sync)
  }, [])

  const addNotification = useCallback((notif: Pick<AppNotification, 'title' | 'body' | 'href'>) => {
    const entry: AppNotification = {
      id: String(Date.now()),
      title: notif.title,
      body: notif.body,
      createdAt: new Date().toISOString(),
      read: false,
      ...(notif.href !== undefined ? { href: notif.href } : {}),
    }
    const next = [entry, ...ref.current].slice(0, MAX)
    ref.current = next
    setNotifications(next)
    persist(next)
  }, [])

  const markRead = useCallback((id: string) => {
    const next = ref.current.map(n => (n.id === id ? { ...n, read: true } : n))
    ref.current = next
    setNotifications(next)
    persist(next)
  }, [])

  const markAllRead = useCallback(() => {
    const next = ref.current.map(n => ({ ...n, read: true }))
    ref.current = next
    setNotifications(next)
    persist(next)
  }, [])

  const clearAll = useCallback(() => {
    ref.current = []
    setNotifications([])
    persist([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, addNotification, markRead, markAllRead, clearAll, unreadCount }
}
