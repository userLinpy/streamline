'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { HistoryEntry } from '@/lib/history'

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

const TWO_MONTHS_AGO = () => new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

export async function getHistory(): Promise<HistoryEntry[]> {
  const userId = await getUserId()
  if (!userId) return []
  const rows = await prisma.historyEntry.findMany({
    where: { userId, visitedAt: { gte: TWO_MONTHS_AGO() } },
    orderBy: { visitedAt: 'desc' },
    take: 500,
  })
  return rows.map(r => ({
    id: r.itemId,
    title: r.title,
    source: r.source,
    detailPath: r.detailPath,
    visitedAt: r.visitedAt.toISOString(),
  }))
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.historyEntry.create({
    data: {
      userId,
      itemId: entry.id,
      title: entry.title,
      source: entry.source,
      detailPath: entry.detailPath,
      visitedAt: new Date(entry.visitedAt),
    },
  })
}

export async function clearHistory(): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.historyEntry.deleteMany({ where: { userId } })
}
