'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getWatchedRepos(): Promise<string[]> {
  const userId = await getUserId()
  if (!userId) return []
  const rows = await prisma.watchedRepo.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
  return rows.map(r => r.repo)
}

export async function addWatchedRepo(repo: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.watchedRepo.upsert({
    where: { userId_repo: { userId, repo } },
    update: {},
    create: { userId, repo },
  })
}

export async function removeWatchedRepo(repo: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.watchedRepo.deleteMany({ where: { userId, repo } })
}
