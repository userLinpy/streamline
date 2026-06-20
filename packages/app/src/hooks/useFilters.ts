'use client'

import { useState, useEffect } from 'react'

export const PREDEFINED_TAGS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Rust',
  'DevOps',
  'IA/ML',
  'Agile',
  'Security',
  'Open Source',
]

export type SourceFilters = {
  github: boolean
  devto: boolean
  'github-release': boolean
  hackernews: boolean
  rss: boolean
}

export type Filters = {
  sources: SourceFilters
  activeTags: string[]
  customTags: string[]
}

const DEFAULT_FILTERS: Filters = {
  sources: {
    github: true,
    devto: true,
    'github-release': true,
    hackernews: true,
    rss: true,
  },
  activeTags: [],
  customTags: [],
}

const STORAGE_KEY = 'streamline-filters'

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Filters>
        setFilters({
          sources: { ...DEFAULT_FILTERS.sources, ...(parsed.sources ?? {}) },
          activeTags: parsed.activeTags ?? [],
          customTags: parsed.customTags ?? [],
        })
      }
    } catch {}
  }, [])

  function toggleSource(source: keyof SourceFilters) {
    setFilters(prev => {
      const next = { ...prev, sources: { ...prev.sources, [source]: !prev.sources[source] } }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function toggleTag(tag: string) {
    setFilters(prev => {
      const exists = prev.activeTags.includes(tag)
      const next = {
        ...prev,
        activeTags: exists
          ? prev.activeTags.filter(t => t !== tag)
          : [...prev.activeTags, tag],
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    setFilters(prev => {
      if (prev.customTags.includes(trimmed)) return prev
      const next = { ...prev, customTags: [...prev.customTags, trimmed] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function removeCustomTag(tag: string) {
    setFilters(prev => {
      const next = {
        ...prev,
        customTags: prev.customTags.filter(t => t !== tag),
        activeTags: prev.activeTags.filter(t => t !== tag),
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag }
}
