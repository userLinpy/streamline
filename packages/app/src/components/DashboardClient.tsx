'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, X, Newspaper, Bookmark, Star } from 'lucide-react'
import type { TechItem } from '@/types'
import { TechCard } from './TechCard'
import { FilterPanel } from './FilterPanel'
import { ThemeToggle } from './ThemeToggle'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { useFilters } from '@/hooks/useFilters'
import { useWatchedRepos } from '@/hooks/useWatchedRepos'
import { useWatchedFeeds } from '@/hooks/useWatchedFeeds'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { PREDEFINED_TAGS } from '@/hooks/useFilters'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

type Tab = 'news' | 'readlater' | 'favorites'

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

type Props = { initialItems: TechItem[] }

export function DashboardClient({ initialItems }: Props) {
  const { data: session } = useSession()

  const [activeTab, setActiveTab] = useState<Tab>('news')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TechItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [asyncItems, setAsyncItems] = useState<TechItem[]>([])
  const [customReleases, setCustomReleases] = useState<TechItem[]>([])
  const [rssFeedItems, setRssFeedItems] = useState<TechItem[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const autocompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater } = useReadLater()
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag } = useFilters()
  const { customRepos, addRepo, removeRepo } = useWatchedRepos()
  const { feeds, addFeed, removeFeed } = useWatchedFeeds()
  const { searches, addSearch, removeSearch } = useRecentSearches()

  // Progressive load: Dev.to, HN, and default releases arrive in parallel after GitHub
  useEffect(() => {
    const sources = ['/api/devto', '/api/hackernews', '/api/releases-default']
    sources.forEach(url => {
      fetch(url)
        .then(r => r.json() as Promise<TechItem[]>)
        .then(data => {
          if (Array.isArray(data)) {
            setAsyncItems(prev => {
              const existingIds = new Set(prev.map(i => i.id))
              const fresh = data.filter(i => !existingIds.has(i.id))
              return fresh.length > 0 ? [...prev, ...fresh] : prev
            })
          }
        })
        .catch(() => {})
    })
  }, [])

  // Load releases for custom repos client-side
  useEffect(() => {
    if (customRepos.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomReleases([])
      return
    }
    const reposParam = customRepos.join(',')
    fetch(`/api/releases?repos=${encodeURIComponent(reposParam)}`)
      .then(r => r.json() as Promise<TechItem[]>)
      .then(data => setCustomReleases(data))
      .catch(() => setCustomReleases([]))
  }, [customRepos])

  // Load RSS feeds client-side
  useEffect(() => {
    if (feeds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRssFeedItems([])
      return
    }
    Promise.allSettled(
      feeds.map(url =>
        fetch(`/api/rss?url=${encodeURIComponent(url)}`)
          .then(r => r.json() as Promise<TechItem[]>)
          .then(data => (Array.isArray(data) ? data : []))
          .catch(() => [] as TechItem[])
      )
    ).then(results => {
      const all = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []))
      setRssFeedItems(all)
    })
  }, [feeds])

  const allItems = useMemo(
    () => [...initialItems, ...asyncItems, ...customReleases, ...rssFeedItems],
    [initialItems, asyncItems, customReleases, rssFeedItems]
  )

  // 1. Filter by source
  const filteredBySource = useMemo(
    () => allItems.filter(item => filters.sources[item.source]),
    [allItems, filters.sources]
  )

  // 2. Filter by active tag (OR logic)
  const filteredByTag = useMemo(
    () =>
      filteredBySource.filter(item => {
        if (filters.activeTags.length === 0) return true
        return filters.activeTags.some(activeTag =>
          item.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase())
        )
      }),
    [filteredBySource, filters.activeTags]
  )

  // 3. Filter by tab; HN items older than 2 weeks hidden on news unless searching
  const baseItems = useMemo<TechItem[]>(() => {
    if (activeTab === 'news') {
      if (!query.trim()) {
        // eslint-disable-next-line react-hooks/purity
        const cutoff = Date.now() - TWO_WEEKS_MS
        return filteredByTag.filter(
          i => i.source !== 'hackernews' || new Date(i.publishedAt).getTime() >= cutoff
        )
      }
      return filteredByTag
    }
    if (activeTab === 'readlater') return readLaterItems
    if (activeTab === 'favorites') return favorites
    return filteredByTag
  }, [activeTab, query, filteredByTag, readLaterItems, favorites])

  // 4. Local search filter
  const displayItems = useMemo(
    () =>
      searchResults ??
      baseItems.filter(item => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        )
      }),
    [searchResults, baseItems, query]
  )

  // Autocomplete suggestions
  const allTags = useMemo(
    () => [...PREDEFINED_TAGS, ...filters.customTags],
    [filters.customTags]
  )

  const autocompleteItems = useMemo(() => {
    const result: { type: 'search' | 'tag' | 'title'; value: string; label: string }[] = []
    if (!query.trim()) {
      searches.slice(0, 5).forEach(s => result.push({ type: 'search', value: s, label: s }))
    } else {
      const q = query.toLowerCase()
      allTags
        .filter(t => t.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach(t => result.push({ type: 'tag', value: t, label: t }))
      baseItems
        .filter(i => i.title.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach(i => result.push({ type: 'title', value: i.title, label: i.title }))
    }
    return result
  }, [query, searches, allTags, baseItems])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowAutocomplete(false)
      return
    }
    if (e.key !== 'Enter' || !query.trim()) return
    setShowAutocomplete(false)
    addSearch(query)
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

  const applyAutocomplete = (value: string) => {
    setQuery(value)
    setShowAutocomplete(false)
    setSearchResults(null)
    setSearchError(false)
  }

  const clearSearch = useCallback(() => {
    setQuery('')
    setSearchResults(null)
    setSearchError(false)
  }, [])

  const toggleSearch = useCallback(() => {
    setSearchOpen(prev => {
      const next = !prev
      if (!next) {
        setQuery('')
        setSearchResults(null)
        setSearchError(false)
        setShowAutocomplete(false)
      } else {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      return next
    })
  }, [])

  const tabs: { id: Tab; icon: React.ReactNode; label: string; count: number; activeClass: string }[] = [
    {
      id: 'news',
      icon: <Newspaper size={11} />,
      label: 'News',
      count: allItems.length,
      activeClass: 'bg-indigo-600 text-white shadow-sm',
    },
    {
      id: 'readlater',
      icon: <Bookmark size={11} />,
      label: 'À lire',
      count: readLaterItems.length,
      activeClass: 'bg-amber-500 text-white shadow-sm',
    },
    {
      id: 'favorites',
      icon: <Star size={11} />,
      label: 'Favoris',
      count: favorites.length,
      activeClass: 'bg-rose-500 text-white shadow-sm',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 pr-4 pl-14 lg:pl-4 py-3 flex items-center gap-2 sticky top-0 z-10 shadow-sm">
        {/* Animated search bar — expands from right to left */}
        {/* Outer: flex-1 + justify-end anchors right edge next to controls */}
        <div className="relative flex-1 min-w-0 flex justify-end">
          {/* Inner: max-width transition (0→100%) is CSS-animatable unlike flex-1 */}
          <div
            className={`w-full overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${
              searchOpen
                ? 'max-w-full opacity-100'
                : 'max-w-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { toggleSearch(); return }
                  handleKeyDown(e)
                }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => {
                  autocompleteTimeoutRef.current = setTimeout(() => setShowAutocomplete(false), 150)
                }}
                placeholder="Rechercher… (Entrée = recherche étendue)"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
              />
            </div>
          </div>
          {/* Autocomplete outside overflow-hidden — positioned relative to outer wrapper */}
          {showAutocomplete && autocompleteItems.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden"
              onMouseDown={e => {
                e.preventDefault()
                if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current)
              }}
            >
              {!query.trim() && searches.length > 0 && (
                <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                    Recherches récentes
                  </span>
                </div>
              )}
              {autocompleteItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => applyAutocomplete(item.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-zinc-300 dark:text-zinc-600 shrink-0 text-xs w-4">
                    {item.type === 'search' ? '🕐' : item.type === 'tag' ? '#' : '→'}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate text-xs">{item.label}</span>
                  {item.type === 'search' && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        removeSearch(item.value)
                      }}
                      className="ml-auto text-zinc-300 hover:text-rose-400 dark:text-zinc-600 dark:hover:text-rose-400 shrink-0"
                    >
                      <X size={10} />
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {searching && (
          <span className="text-xs text-zinc-400 shrink-0">Recherche…</span>
        )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Search toggle button */}
          <button
            onClick={toggleSearch}
            title={searchOpen ? 'Fermer la recherche' : 'Rechercher'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              searchOpen
                ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            {searchOpen ? <X size={14} /> : <Search size={14} />}
          </button>

          <ThemeToggle />

          {session?.user ? (
            <Link
              href="/settings?s=profile"
              title={session.user.name ?? 'Mon profil'}
              className="hover:ring-2 hover:ring-indigo-500 rounded-full transition-all"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'Avatar'}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium">
                  {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2 flex gap-1.5 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              clearSearch()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? tab.activeClass
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-white/25 text-current'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onToggleSource={toggleSource}
        onToggleTag={toggleTag}
        onAddCustomTag={addCustomTag}
        onRemoveCustomTag={removeCustomTag}
        customRepos={customRepos}
        onAddRepo={addRepo}
        onRemoveRepo={removeRepo}
        feedUrls={feeds}
        onAddFeed={addFeed}
        onRemoveFeed={removeFeed}
      />

      {/* Content */}
      <main className="p-3">
        {searchError && (
          <div className="mb-3 text-center text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg py-2">
            Recherche indisponible — les résultats locaux sont affichés
          </div>
        )}

        {allItems.length === 0 &&
          activeTab !== 'readlater' &&
          activeTab !== 'favorites' && (
            <div className="text-center py-16 text-zinc-400">
              <p className="text-sm">
                Impossible de charger les articles. Réessaie dans quelques minutes.
              </p>
            </div>
          )}

        {displayItems.length === 0 &&
        (activeTab === 'readlater' || activeTab === 'favorites') ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
            <div className="mb-3 opacity-30">
              {activeTab === 'readlater' ? <Bookmark size={28} /> : <Star size={28} />}
            </div>
            <p className="text-sm">
              {activeTab === 'readlater'
                ? 'Aucun article à lire — clique sur le signet dans une carte pour sauvegarder'
                : 'Aucun favori — clique sur l\'étoile dans une carte pour ajouter aux favoris'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayItems.map(item => (
              <TechCard
                key={item.id}
                item={item}
                inReadLater={isInReadLater(item.id)}
                inFavorites={isFavorite(item.id)}
                onAddToReadLater={addToReadLater}
                onRemoveFromReadLater={removeFromReadLater}
                onAddFavorite={addFavorite}
                onRemoveFavorite={removeFavorite}
              />
            ))}
          </div>
        )}

        {searchResults !== null && (
          <div className="mt-4 text-center">
            <button
              onClick={clearSearch}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline"
            >
              ← Retour aux articles récents
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
