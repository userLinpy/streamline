'use client'

import { useState, useEffect } from 'react'
import { useStorageAdapter } from './useStorageAdapter'

const REPO_REGEX = /^[\w.-]+\/[\w.-]+$/

export function useWatchedRepos() {
  const adapter = useStorageAdapter()
  const [customRepos, setCustomRepos] = useState<string[]>([])

  useEffect(() => {
    void adapter.getWatchedRepos().then(setCustomRepos)
  }, [adapter])

  function isValidRepo(repo: string): boolean {
    return REPO_REGEX.test(repo.trim())
  }

  function addRepo(repo: string): boolean {
    const trimmed = repo.trim()
    if (!isValidRepo(trimmed)) return false
    void adapter.addWatchedRepo(trimmed).then(() =>
      adapter.getWatchedRepos().then(setCustomRepos)
    )
    return true
  }

  function removeRepo(repo: string) {
    void adapter.removeWatchedRepo(repo).then(() =>
      adapter.getWatchedRepos().then(setCustomRepos)
    )
  }

  return { customRepos, addRepo, removeRepo, isValidRepo }
}
