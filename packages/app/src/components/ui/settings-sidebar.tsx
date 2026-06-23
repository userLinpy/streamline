'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Home,
  BarChart3,
  Bell,
  User,
  Shield,
  Download,
  Clock,
  Trash2,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'

export type Section =
  | 'statistiques'
  | 'notifications'
  | 'profile'
  | 'securite'
  | 'donnees'
  | 'historique'
  | 'suppression'

interface NavItem {
  id: Section | 'home'
  label: string
  Icon: LucideIcon
  href?: string
  danger?: boolean
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: 'home', label: 'Accueil', Icon: Home, href: '/' },
      { id: 'statistiques', label: 'Statistiques', Icon: BarChart3 },
      { id: 'notifications', label: 'Notifications', Icon: Bell },
    ],
  },
  {
    label: 'Compte',
    items: [
      { id: 'profile', label: 'Profil', Icon: User },
      { id: 'securite', label: 'Sécurité', Icon: Shield },
      { id: 'donnees', label: 'Données', Icon: Download },
      { id: 'historique', label: 'Historique', Icon: Clock },
    ],
  },
  {
    label: 'Zone critique',
    items: [
      { id: 'suppression', label: 'Suppression', Icon: Trash2, danger: true },
    ],
  },
]

interface Props {
  activeSection: Section
  onSectionChange: (section: Section) => void
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  isAuthenticated: boolean
  userName: string | null
  userEmail: string | null
  userImage: string | null
  onLogout: () => void
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onCollapsedChange,
  isAuthenticated,
  userName,
  userEmail,
  userImage,
  onLogout,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setIsOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const initials = (userName ?? userEmail ?? '?')[0].toUpperCase()

  function handleItemClick(id: Section | 'home') {
    if (id === 'home') return
    onSectionChange(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700 shadow-2xl
          transition-all duration-300 ease-in-out
          w-64 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {!isCollapsed && (
              <span className="text-white font-semibold text-base truncate">Streamline</span>
            )}
          </div>
          <button
            onClick={() => onCollapsedChange(!isCollapsed)}
            aria-label={isCollapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
              {!isCollapsed && group.label ? (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {group.label}
                </p>
              ) : gi > 0 ? (
                <div className="mx-3 mb-2 border-t border-slate-700/60" />
              ) : null}

              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = item.id !== 'home' && activeSection === item.id
                  const Icon = item.Icon

                  const inner = (
                    <span
                      className={`
                        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all duration-200
                        ${isCollapsed ? 'justify-center' : ''}
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : item.danger
                              ? 'text-red-400 hover:bg-red-950/30 hover:text-red-300'
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.danger
                              ? 'text-red-400'
                              : 'text-slate-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                      )}
                    </span>
                  )

                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {inner}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full"
                      title={isCollapsed ? item.label : undefined}
                    >
                      {inner}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user profile + action */}
        <div className="shrink-0 border-t border-slate-700 p-3 space-y-1">
          {isAuthenticated ? (
            <>
              {!isCollapsed && (
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                  {userImage && !imgError ? (
                    <img
                      src={userImage}
                      alt={userName ?? 'Avatar'}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-xs">{initials}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {userName ?? 'Utilisateur'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{userEmail ?? ''}</p>
                  </div>
                </div>
              )}
              <button
                onClick={onLogout}
                title={isCollapsed ? 'Se déconnecter' : undefined}
                className={`
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                  text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white
                  transition-colors duration-200
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <LogOut size={16} className="shrink-0" />
                {!isCollapsed && <span>Se déconnecter</span>}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              title={isCollapsed ? 'Se connecter' : undefined}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white
                transition-colors duration-200
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <User size={16} className="shrink-0" />
              {!isCollapsed && <span>Se connecter</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
