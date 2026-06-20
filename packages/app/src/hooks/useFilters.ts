'use client'

import { useState } from 'react'

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
  },
  activeTags: [],
  customTags: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  function toggleSource(source: keyof SourceFilters) {
    setFilters(prev => ({
      ...prev,
      sources: { ...prev.sources, [source]: !prev.sources[source] },
    }))
  }

  function toggleTag(tag: string) {
    setFilters(prev => {
      const exists = prev.activeTags.includes(tag)
      return {
        ...prev,
        activeTags: exists
          ? prev.activeTags.filter(t => t !== tag)
          : [...prev.activeTags, tag],
      }
    })
  }

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    setFilters(prev => {
      if (prev.customTags.includes(trimmed)) return prev
      return { ...prev, customTags: [...prev.customTags, trimmed] }
    })
  }

  function removeCustomTag(tag: string) {
    setFilters(prev => ({
      ...prev,
      customTags: prev.customTags.filter(t => t !== tag),
      activeTags: prev.activeTags.filter(t => t !== tag),
    }))
  }

  return { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag }
}
