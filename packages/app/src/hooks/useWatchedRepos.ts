'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'streamline_custom_repos'
const REPO_REGEX = /^[\w.-]+\/[\w.-]+$/

export function useWatchedRepos() {
  const [customRepos, setCustomRepos] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCustomRepos(JSON.parse(stored) as string[])
    } catch {
      // ignore
    }
  }, [])

  function isValidRepo(repo: string): boolean {
    return REPO_REGEX.test(repo.trim())
  }

  function addRepo(repo: string): boolean {
    const trimmed = repo.trim()
    if (!isValidRepo(trimmed)) return false
    setCustomRepos(prev => {
      if (prev.includes(trimmed)) return prev
      const next = [...prev, trimmed]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    return true
  }

  function removeRepo(repo: string) {
    setCustomRepos(prev => {
      const next = prev.filter(r => r !== repo)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { customRepos, addRepo, removeRepo, isValidRepo }
}
