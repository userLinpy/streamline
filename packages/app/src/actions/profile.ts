'use server'

import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { TechItem } from '@/types'

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function updateProfile(data: {
  name?: string
  image?: string | null
}): Promise<{ error?: string }> {
  const userId = await getUserId()
  if (!userId) return { error: 'Non connecté' }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.image !== undefined && { image: data.image }),
    },
  })
  return {}
}

export async function changePassword(data: {
  current: string
  next: string
}): Promise<{ error?: string }> {
  const userId = await getUserId()
  if (!userId) return { error: 'Non connecté' }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.password) return { error: 'Compte OAuth — pas de mot de passe local' }

  const valid = await bcrypt.compare(data.current, user.password)
  if (!valid) return { error: 'Mot de passe actuel incorrect' }

  if (data.next.length < 8) return { error: 'Mot de passe trop court (min 8 caractères)' }

  const hash = await bcrypt.hash(data.next, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hash } })
  return {}
}

export async function revokeAllSessions(): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  })
}

export async function deleteAccount(): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.user.delete({ where: { id: userId } })
}

export async function exportData(): Promise<{
  favorites: TechItem[]
  readLater: TechItem[]
}> {
  const userId = await getUserId()
  if (!userId) return { favorites: [], readLater: [] }

  const [favRows, rlRows] = await Promise.all([
    prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.readLater.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ])

  return {
    favorites: favRows.map(r => r.itemData as TechItem),
    readLater: rlRows.map(r => r.itemData as TechItem),
  }
}
