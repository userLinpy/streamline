'use client'

import { BellOff, Bell, Check, Trash2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  if (h < 24) return `il y a ${h} h`
  return `il y a ${d} j`
}

export function NotificationsSection() {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotifications()

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <BellOff size={28} className="text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune notification</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Tout lu'}
        </span>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <Check size={12} />
              Tout marquer lu
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} />
            Effacer tout
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            role="button"
            tabIndex={0}
            onClick={() => markRead(notif.id)}
            onKeyDown={e => { if (e.key === 'Enter') markRead(notif.id) }}
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              notif.read
                ? 'bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                : 'bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50'
            }`}
          >
            <Bell
              size={15}
              className={`mt-0.5 shrink-0 ${notif.read ? 'text-zinc-400' : 'text-indigo-500'}`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  notif.read
                    ? 'text-zinc-500 dark:text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-100'
                }`}
              >
                {notif.title}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{notif.body}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{relativeTime(notif.createdAt)}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
