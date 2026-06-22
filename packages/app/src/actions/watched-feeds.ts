'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getWatchedFeeds(): Promise<string[]> {
  const userId = await getUserId()
  if (!userId) return []
  const rows = await prisma.watchedFeed.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
  return rows.map(r => r.url)
}

export async function addWatchedFeed(url: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.watchedFeed.upsert({
    where: { userId_url: { userId, url } },
    update: {},
    create: { userId, url },
  })
}

export async function removeWatchedFeed(url: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.watchedFeed.deleteMany({ where: { userId, url } })
}
