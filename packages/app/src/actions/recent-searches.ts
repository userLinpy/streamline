'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const MAX_SEARCHES = 10

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getRecentSearches(): Promise<string[]> {
  const userId = await getUserId()
  if (!userId) return []
  const rows = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: MAX_SEARCHES,
  })
  return rows.map(r => r.query)
}

export async function addRecentSearch(query: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const trimmed = query.trim()
  if (!trimmed) return
  await prisma.recentSearch.deleteMany({ where: { userId, query: trimmed } })
  await prisma.recentSearch.create({ data: { userId, query: trimmed } })
  const old = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: MAX_SEARCHES,
  })
  if (old.length > 0) {
    await prisma.recentSearch.deleteMany({ where: { id: { in: old.map(r => r.id) } } })
  }
}

export async function removeRecentSearch(query: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.recentSearch.deleteMany({ where: { userId, query } })
}
