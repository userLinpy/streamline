'use client'

import { useSession } from 'next-auth/react'
import { localStorageAdapter } from '@/lib/storage/local'
import { cloudAdapter } from '@/lib/storage/cloud'
import type { StorageAdapter } from '@/lib/storage/adapter'

export function useStorageAdapter(): StorageAdapter {
  const { data: session } = useSession()
  return session?.user ? cloudAdapter : localStorageAdapter
}
