'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  User,
  Shield,
  Clock,
  Download,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  History,
} from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import { formatRelativeDate } from '@/lib/utils'
import { SourceIcon } from '@/components/SourceIcon'
import {
  updateProfile,
  changePassword,
  revokeAllSessions,
  deleteAccount,
  exportData,
} from '@/actions/profile'
import type { TechItem } from '@/types'

type Tab = 'profile' | 'security' | 'history' | 'data' | 'danger'
type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Auj.' },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'all', label: 'Tout' },
]

const TABS: { id: Tab; Icon: (props: { size?: number; className?: string }) => React.ReactNode; label: string }[] = [
  { id: 'profile', Icon: User, label: 'Profil' },
  { id: 'security', Icon: Shield, label: 'Sécurité' },
  { id: 'history', Icon: Clock, label: 'Historique' },
  { id: 'data', Icon: Download, label: 'Données' },
  { id: 'danger', Icon: AlertTriangle, label: 'Danger' },
]

interface Props {
  userId: string
  name: string | null
  email: string | null
  image: string | null
  hasPassword: boolean
}

export function SettingsClient({ name, email, image, hasPassword }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile tab state
  const [imgUrl, setImgUrl] = useState(image ?? '')
  const [imgError, setImgError] = useState(false)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // History tab state
  const { history, clearHistory, clearByPeriod } = useHistory()
  const [period, setPeriod] = useState<Period>('all')

  const now = useMemo(() => Date.now(), [])
  const cutoffs: Record<Period, number> = {
    today: now - 24 * 60 * 60 * 1000,
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    all: 0,
  }
  const filteredHistory =
    period === 'all'
      ? history
      : history.filter(e => new Date(e.visitedAt).getTime() > cutoffs[period])

  function flash(type: 'success' | 'error', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile({
        name: (fd.get('name') as string) || undefined,
        image: imgUrl || null,
      })
      if (result.error) flash('error', result.error)
      else {
        flash('success', 'Profil mis à jour')
        router.refresh()
      }
    })
  }

  function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next = fd.get('next') as string
    const confirm = fd.get('confirm') as string
    if (next !== confirm) {
      flash('error', 'Les mots de passe ne correspondent pas')
      return
    }
    startTransition(async () => {
      const result = await changePassword({
        current: fd.get('current') as string,
        next,
      })
      if (result.error) flash('error', result.error)
      else {
        flash('success', 'Mot de passe modifié')
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  function handleRevokeAll() {
    startTransition(async () => {
      await revokeAllSessions()
      await signOut({ callbackUrl: '/login' })
    })
  }

  async function handleExport() {
    const data = await exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `streamline-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete() {
    if (deleteConfirm !== 'SUPPRIMER') return
    startTransition(async () => {
      await deleteAccount()
      await signOut({ callbackUrl: '/' })
    })
  }

  const initials = (name ?? email ?? '?')[0].toUpperCase()

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:text-zinc-200'

  const btnPrimaryClass =
    'px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50'

  const btnSecondaryClass =
    'px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Paramètres</h1>
      </div>

      {/* Feedback */}
      {msg && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
        {TABS.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        {/* ── PROFIL ─────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfile} className="space-y-5">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Profil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              {imgUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xl font-semibold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-zinc-500 mb-1">URL de la photo</label>
                <input
                  value={imgUrl}
                  onChange={e => {
                    setImgUrl(e.target.value)
                    setImgError(false)
                  }}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Pseudo</label>
              <input
                name="name"
                defaultValue={name ?? ''}
                placeholder="Ton nom"
                className={inputClass}
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Email</label>
              <input
                value={email ?? ''}
                disabled
                readOnly
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              />
            </div>

            <button type="submit" disabled={isPending} className={btnPrimaryClass}>
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        )}

        {/* ── SÉCURITÉ ───────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sécurité</h2>

            {hasPassword ? (
              <form onSubmit={handlePassword} className="space-y-4">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Changer le mot de passe
                </h3>
                <input
                  name="current"
                  type="password"
                  placeholder="Mot de passe actuel"
                  required
                  className={inputClass}
                />
                <input
                  name="next"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  required
                  minLength={8}
                  className={inputClass}
                />
                <input
                  name="confirm"
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  required
                  className={inputClass}
                />
                <button type="submit" disabled={isPending} className={btnPrimaryClass}>
                  {isPending ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-zinc-500">
                Tu es connecté via GitHub OAuth — aucun mot de passe local.
              </p>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                Sessions actives
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Déconnecte tous tes appareils — tu devras te reconnecter.
              </p>
              <button onClick={handleRevokeAll} disabled={isPending} className={btnSecondaryClass}>
                Déconnecter tous les appareils
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORIQUE ─────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History size={14} className="text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Historique
              </h2>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-bold">
                {history.length}
              </span>
            </div>

            {/* Period filter */}
            <div className="flex gap-1 mb-4">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`flex-1 text-xs py-1 rounded-lg transition-colors font-medium ${
                    period === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
                <Clock size={28} className="opacity-30" />
                <p className="text-xs">Aucun article consulté</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/50 -mx-6">
                {filteredHistory.map((entry, i) => {
                  const isExternal = entry.detailPath.startsWith('http')
                  const inner = (
                    <div className="flex items-start gap-2.5 px-6 py-3">
                      <span className="shrink-0 mt-0.5 w-4 flex items-center justify-center">
                        <SourceIcon source={entry.source as TechItem['source']} size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                          {entry.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {formatRelativeDate(entry.visitedAt)}
                        </p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={`${entry.id}-${i}`}>
                      {isExternal ? (
                        <a
                          href={entry.detailPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link
                          href={entry.detailPath}
                          className="block hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {history.length > 0 && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-3 space-y-1">
                {period !== 'all' && filteredHistory.length > 0 && (
                  <button
                    onClick={() => clearByPeriod(period as 'today' | 'week' | 'month')}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-rose-500 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={11} />
                    Effacer cette période
                  </button>
                )}
                <button
                  onClick={clearHistory}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                  <Trash2 size={11} />
                  Effacer tout l&apos;historique
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── DONNÉES ────────────────────────────────────────────────── */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Données</h2>
            <p className="text-xs text-zinc-500">
              Télécharge tes favoris et articles à lire au format JSON.
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download size={14} />
              Exporter mes données (JSON)
            </button>
          </div>
        )}

        {/* ── ZONE DANGER ────────────────────────────────────────────── */}
        {activeTab === 'danger' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-red-600">Zone danger</h2>
            <p className="text-xs text-zinc-500">
              La suppression est <strong>irréversible</strong> — toutes tes données seront
              effacées.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/40 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={14} />
              Supprimer mon compte
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Supprimer le compte
              </h3>
              <p className="text-sm text-zinc-500 mb-4">
                Tape <strong>SUPPRIMER</strong> pour confirmer.
              </p>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className={`${inputClass} mb-4`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== 'SUPPRIMER' || isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
