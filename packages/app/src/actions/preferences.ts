'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { Filters } from '@/hooks/useFilters'

const DEFAULT_FILTERS: Filters = {
  sources: { github: true, devto: true, 'github-release': true, hackernews: true, rss: true },
  activeTags: [],
  customTags: [],
}

async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getPreferences(): Promise<Filters> {
  const userId = await getUserId()
  if (!userId) return DEFAULT_FILTERS
  const row = await prisma.userPreferences.findUnique({ where: { userId } })
  if (!row) return DEFAULT_FILTERS
  return {
    sources: { ...DEFAULT_FILTERS.sources, ...(row.filterSources as Filters['sources']) },
    activeTags: [],
    customTags: (row.filterTags as string[]) ?? [],
  }
}

export async function savePreferences(prefs: Filters): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  await prisma.userPreferences.upsert({
    where: { userId },
    update: { filterSources: prefs.sources, filterTags: prefs.customTags },
    create: { userId, filterSources: prefs.sources, filterTags: prefs.customTags },
  })
}
