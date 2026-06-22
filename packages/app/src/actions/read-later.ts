'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { TechItem } from '@/types'

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getReadLater(): Promise<TechItem[]> {
  const userId = await getUserId()
  if (!userId) return []
  const rows = await prisma.readLater.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(r => r.itemData as TechItem)
}

export async function addReadLater(item: TechItem): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.readLater.upsert({
    where: { userId_itemId: { userId, itemId: item.id } },
    update: {},
    create: { userId, itemId: item.id, itemData: item },
  })
}

export async function removeReadLater(itemId: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.readLater.deleteMany({ where: { userId, itemId } })
}
