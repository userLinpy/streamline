'use client'

import { useState, useEffect } from 'react'
import { useStorageAdapter } from './useStorageAdapter'

export const PREDEFINED_TAGS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Go', 'Rust', 'DevOps', 'IA/ML', 'Agile', 'Security', 'Open Source',
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
  sources: { github: true, devto: true, 'github-release': true, hackernews: true, rss: true },
  activeTags: [],
  customTags: [],
}

export function useFilters() {
  const adapter = useStorageAdapter()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  useEffect(() => {
    void adapter.getPreferences().then(setFilters)
  }, [adapter])

  function persist(next: Filters) {
    setFilters(next)
    void adapter.savePreferences(next)
  }

  function toggleSource(source: keyof SourceFilters) {
    persist({ ...filters, sources: { ...filters.sources, [source]: !filters.sources[source] } })
  }

  function toggleTag(tag: string) {
    const exists = filters.activeTags.includes(tag)
    persist({
      ...filters,
      activeTags: exists ? filters.activeTags.filter(t => t !== tag) : [...filters.activeTags, tag],
    })
  }

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || filters.customTags.includes(trimmed)) return
    persist({ ...filters, customTags: [...filters.customTags, trimmed] })
  }

  function removeCustomTag(tag: string) {
    persist({
      ...filters,
      customTags: filters.customTags.filter(t => t !== tag),
      activeTags: filters.activeTags.filter(t => t !== tag),
    })
  }

  return { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag }
}
