'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createUser } from '@/actions/auth'
import { migrateLocalStorageToCloud } from '@/actions/migrate'
import type { LocalStorageSnapshot } from '@/actions/migrate'

function readLocalStorageSnapshot(): LocalStorageSnapshot {
  function r<T>(key: string, fb: T): T {
    try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fb } catch { return fb }
  }
  return {
    favorites: r('streamline_favorites', []),
    readLater: r('streamline_read_later', []),
    customRepos: r('streamline_custom_repos', []),
    feeds: r('streamline-feeds', []),
    history: r('streamline-history', []),
    filters: r('streamline-filters', {}),
    searches: r('streamline-searches', []),
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const confirm = fd.get('confirmPassword') as string

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    const snapshot = readLocalStorageSnapshot()

    startTransition(async () => {
      const result = await createUser({ email, password })
      if (result.error) {
        setError(result.error)
        return
      }

      const signInResult = await signIn('credentials', { email, password, redirect: false })
      if (signInResult?.error) {
        setError('Compte créé mais erreur de connexion. Veuillez vous connecter.')
        router.push('/login')
        return
      }

      const session = await fetch('/api/auth/session').then(r => r.json()) as { user?: { id?: string } }
      if (session?.user?.id) {
        await migrateLocalStorageToCloud(session.user.id, snapshot)
      }

      router.push('/')
      router.refresh()
    })
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

      <button
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium mb-4"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        Continuer avec GitHub
      </button>

      <div className="relative my-4 text-center text-xs text-zinc-400 before:absolute before:inset-0 before:top-1/2 before:border-t before:border-zinc-200 dark:before:border-zinc-700">
        <span className="relative bg-white dark:bg-zinc-950 px-2">ou</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe (min. 8 caractères)"
          required
          minLength={8}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-4 text-xs text-center space-y-2 text-zinc-500">
        <p>
          Déjà un compte ?{' '}
          <Link href="/login" className="underline text-zinc-900 dark:text-white">
            Se connecter
          </Link>
        </p>
        <p>
          <Link href="/" className="underline">
            Continuer sans compte
          </Link>
        </p>
      </div>
    </>
  )
}
