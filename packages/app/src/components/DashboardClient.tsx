'use client'

import { useState } from 'react'
import type { TechItem } from '@/types'
import { TechCard } from './TechCard'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'

type Tab = 'devto' | 'github' | 'all' | 'readlater' | 'favorites'

type Props = { items: TechItem[] }

export function DashboardClient({ items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('devto')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TechItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const { readLaterItems } = useReadLater()
  const { favorites } = useFavorites()

  const baseItems = (() => {
    if (activeTab === 'devto') return items.filter(i => i.source === 'devto')
    if (activeTab === 'github') return items.filter(i => i.source === 'github')
    if (activeTab === 'readlater') return readLaterItems
    if (activeTab === 'favorites') return favorites
    return items
  })()

  const displayItems =
    searchResults ??
    baseItems.filter(item => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      )
    })

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !query.trim()) return
    setSearching(true)
    setSearchError(false)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('search failed')
      const data: TechItem[] = await res.json()
      setSearchResults(data)
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setSearchResults(null)
      setSearchError(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchResults(null)
    setSearchError(false)
  }

  const tabs: {
    id: Tab
    label: string
    count: number
    activeClass: string
  }[] = [
    {
      id: 'devto',
      label: '✍ Dev.to',
      count: items.filter(i => i.source === 'devto').length,
      activeClass: 'bg-indigo-600 text-white',
    },
    {
      id: 'github',
      label: '★ GitHub',
      count: items.filter(i => i.source === 'github').length,
      activeClass: 'bg-green-600 text-white',
    },
    {
      id: 'all',
      label: '⊞ Tout',
      count: items.length,
      activeClass: 'bg-zinc-600 text-white',
    },
    {
      id: 'readlater',
      label: '🔖 À lire',
      count: readLaterItems.length,
      activeClass: 'bg-amber-500 text-white',
    },
    {
      id: 'favorites',
      label: '⭐ Favoris',
      count: favorites.length,
      activeClass: 'bg-rose-500 text-white',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-extrabold text-indigo-600 shrink-0">
          ⚡ Streamline
        </span>
        <input
          type="search"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher… (Entrée = recherche étendue sans filtre de date)"
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-0"
        />
        {searching && (
          <span className="text-xs text-zinc-400 shrink-0">Recherche…</span>
        )}
      </header>

      {/* Onglets */}
      <div className="bg-white border-b border-zinc-100 px-3 py-2 flex gap-1.5 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              clearSearch()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? tab.activeClass
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-white/30 text-current'
                  : 'bg-zinc-200 text-zinc-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <main className="p-3">
        {searchError && (
          <div className="mb-3 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2">
            Recherche indisponible — les résultats locaux sont affichés
          </div>
        )}

        {items.length === 0 &&
          activeTab !== 'readlater' &&
          activeTab !== 'favorites' && (
            <div className="text-center py-16 text-zinc-400">
              <p className="text-sm">
                Impossible de charger les articles. Réessaie dans quelques
                minutes.
              </p>
            </div>
          )}

        {displayItems.length === 0 &&
        (activeTab === 'readlater' || activeTab === 'favorites') ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-2xl mb-2">
              {activeTab === 'readlater' ? '🔖' : '⭐'}
            </p>
            <p className="text-sm">
              {activeTab === 'readlater'
                ? "Aucun article à lire — clique sur 🔖 dans une carte pour sauvegarder"
                : "Aucun favori — clique sur ⭐ dans une carte pour ajouter aux favoris"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayItems.map(item => (
              <TechCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {searchResults !== null && (
          <div className="mt-4 text-center">
            <button
              onClick={clearSearch}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline"
            >
              ← Retour aux articles récents
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
