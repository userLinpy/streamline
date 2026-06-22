'use client'

import { X, Plus, Rss } from 'lucide-react'
import { useState } from 'react'
import type { Filters, SourceFilters } from '@/hooks/useFilters'
import { PREDEFINED_TAGS } from '@/hooks/useFilters'
import { SourceIcon } from './SourceIcon'

type Props = {
  filters: Filters
  onToggleSource: (source: keyof SourceFilters) => void
  onToggleTag: (tag: string) => void
  onAddCustomTag: (tag: string) => void
  onRemoveCustomTag: (tag: string) => void
  customRepos: string[]
  onAddRepo: (repo: string) => boolean
  onRemoveRepo: (repo: string) => void
  feedUrls: string[]
  onAddFeed: (url: string) => boolean
  onRemoveFeed: (url: string) => void
}

const SOURCE_LABELS: Record<keyof SourceFilters, string> = {
  github: 'GitHub',
  devto: 'Dev.to',
  'github-release': 'Releases',
  hackernews: 'Hacker News',
  rss: 'RSS',
}

const SOURCE_ACTIVE_CLASS: Record<keyof SourceFilters, string> = {
  github: 'bg-green-600 text-white border-transparent',
  devto: 'bg-indigo-600 text-white border-transparent',
  'github-release': 'bg-purple-600 text-white border-transparent',
  hackernews: 'bg-orange-500 text-white border-transparent',
  rss: 'bg-cyan-600 text-white border-transparent',
}

export function FilterPanel({
  filters,
  onToggleSource,
  onToggleTag,
  onAddCustomTag,
  onRemoveCustomTag,
  customRepos,
  onAddRepo,
  onRemoveRepo,
  feedUrls,
  onAddFeed,
  onRemoveFeed,
}: Props) {
  const [newTag, setNewTag] = useState('')
  const [newRepo, setNewRepo] = useState('')
  const [repoError, setRepoError] = useState(false)
  const [newFeed, setNewFeed] = useState('')
  const [feedError, setFeedError] = useState(false)

  const allTags = [...PREDEFINED_TAGS, ...filters.customTags]

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5 space-y-2">
      {/* Source toggles */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(SOURCE_LABELS) as Array<keyof SourceFilters>).map(source => (
          <button
            key={source}
            onClick={() => onToggleSource(source)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
              filters.sources[source]
                ? SOURCE_ACTIVE_CLASS[source]
                : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
            }`}
          >
            <SourceIcon source={source} size={11} />
            {SOURCE_LABELS[source]}
          </button>
        ))}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {allTags.map(tag => {
          const isCustom = filters.customTags.includes(tag)
          const isActive = filters.activeTags.includes(tag)
          return (
            <div key={tag} className="flex items-center">
              <button
                onClick={() => onToggleTag(tag)}
                className={`text-xs px-2 py-0.5 border transition-colors ${
                  isCustom ? 'rounded-l-full' : 'rounded-full'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {tag}
              </button>
              {isCustom && (
                <button
                  onClick={() => onRemoveCustomTag(tag)}
                  className={`text-xs px-1 py-0.5 rounded-r-full border-y border-r transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:text-rose-500'
                  }`}
                  title="Supprimer ce tag"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          )
        })}

        {/* Add custom tag */}
        <form
          onSubmit={e => {
            e.preventDefault()
            if (newTag.trim()) {
              onAddCustomTag(newTag)
              setNewTag('')
            }
          }}
          className="flex items-center"
        >
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="+ tag"
            className="text-xs w-16 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-l-full focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:focus:ring-indigo-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400"
          />
          <button
            type="submit"
            className="text-xs px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-r-full hover:bg-zinc-300 dark:hover:bg-zinc-600 border border-l-0 border-zinc-200 dark:border-zinc-700"
            title="Ajouter ce tag"
          >
            <Plus size={8} />
          </button>
        </form>
      </div>

      {/* Custom repos */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {customRepos.map(repo => (
          <span
            key={repo}
            className="flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700"
          >
            {repo}
            <button
              onClick={() => onRemoveRepo(repo)}
              className="text-zinc-400 dark:text-zinc-500 hover:text-rose-500 ml-0.5"
              title="Supprimer ce repo"
            >
              <X size={8} />
            </button>
          </span>
        ))}

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!newRepo.trim()) return
            const ok = onAddRepo(newRepo)
            if (ok) {
              setNewRepo('')
              setRepoError(false)
            } else {
              setRepoError(true)
            }
          }}
          className="flex items-center gap-1"
        >
          <input
            value={newRepo}
            onChange={e => {
              setNewRepo(e.target.value)
              setRepoError(false)
            }}
            placeholder="owner/repo"
            className={`text-xs w-28 px-1.5 py-0.5 border rounded-full focus:outline-none focus:ring-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 ${
              repoError
                ? 'border-rose-300 focus:ring-rose-300'
                : 'border-zinc-200 dark:border-zinc-700 focus:ring-indigo-300 dark:focus:ring-indigo-700'
            }`}
          />
          <button
            type="submit"
            className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/60"
            title="Ajouter ce repo"
          >
            <Plus size={8} />
          </button>
        </form>

        {repoError && (
          <span className="text-xs text-rose-500">Format attendu : owner/repo</span>
        )}
      </div>

      {/* RSS feeds */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {feedUrls.map(url => {
          let label = url
          try { label = new URL(url).hostname } catch {}
          return (
            <span
              key={url}
              className="flex items-center gap-1 text-xs bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800"
              title={url}
            >
              <Rss size={10} className="shrink-0" />
              {label}
              <button
                onClick={() => onRemoveFeed(url)}
                className="text-cyan-400 dark:text-cyan-500 hover:text-rose-500 ml-0.5"
                title="Supprimer ce flux RSS"
              >
                <X size={8} />
              </button>
            </span>
          )
        })}

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!newFeed.trim()) return
            const ok = onAddFeed(newFeed)
            if (ok) {
              setNewFeed('')
              setFeedError(false)
            } else {
              setFeedError(true)
            }
          }}
          className="flex items-center gap-1"
        >
          <input
            value={newFeed}
            onChange={e => {
              setNewFeed(e.target.value)
              setFeedError(false)
            }}
            placeholder="URL flux RSS"
            className={`text-xs w-32 px-1.5 py-0.5 border rounded-full focus:outline-none focus:ring-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 ${
              feedError
                ? 'border-rose-300 focus:ring-rose-300'
                : 'border-zinc-200 dark:border-zinc-700 focus:ring-cyan-300 dark:focus:ring-cyan-700'
            }`}
          />
          <button
            type="submit"
            className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 rounded-full border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-900/60"
            title="Ajouter ce flux RSS"
          >
            <Plus size={8} />
          </button>
        </form>

        {feedError && (
          <span className="text-xs text-rose-500">URL invalide</span>
        )}
      </div>
    </div>
  )
}
