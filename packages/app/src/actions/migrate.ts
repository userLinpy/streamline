'use server'

import { prisma } from '@/lib/db'
import type { TechItem } from '@/types'
import type { HistoryEntry } from '@/lib/history'
import type { Filters } from '@/hooks/useFilters'

export interface LocalStorageSnapshot {
  favorites: TechItem[]
  readLater: TechItem[]
  customRepos: string[]
  feeds: string[]
  history: HistoryEntry[]
  filters: Partial<Filters>
  searches: string[]
}

export async function migrateLocalStorageToCloud(
  userId: string,
  snapshot: LocalStorageSnapshot
): Promise<void> {
  const ops: Promise<unknown>[] = []

  for (const item of snapshot.favorites) {
    ops.push(
      prisma.favorite.upsert({
        where: { userId_itemId: { userId, itemId: item.id } },
        update: {},
        create: { userId, itemId: item.id, itemData: item },
      })
    )
  }

  for (const item of snapshot.readLater) {
    ops.push(
      prisma.readLater.upsert({
        where: { userId_itemId: { userId, itemId: item.id } },
        update: {},
        create: { userId, itemId: item.id, itemData: item },
      })
    )
  }

  for (const repo of snapshot.customRepos) {
    ops.push(
      prisma.watchedRepo.upsert({
        where: { userId_repo: { userId, repo } },
        update: {},
        create: { userId, repo },
      })
    )
  }

  for (const url of snapshot.feeds) {
    ops.push(
      prisma.watchedFeed.upsert({
        where: { userId_url: { userId, url } },
        update: {},
        create: { userId, url },
      })
    )
  }

  for (const entry of snapshot.history) {
    ops.push(
      prisma.historyEntry.create({
        data: {
          userId,
          itemId: entry.id,
          title: entry.title,
          source: entry.source,
          detailPath: entry.detailPath,
          visitedAt: new Date(entry.visitedAt),
        },
      }).catch(() => {})
    )
  }

  for (const query of snapshot.searches) {
    ops.push(
      prisma.recentSearch.upsert({
        where: { userId_query: { userId, query } },
        update: {},
        create: { userId, query },
      }).catch(() => {})
    )
  }

  if (snapshot.filters) {
    ops.push(
      prisma.userPreferences.upsert({
        where: { userId },
        update: {
          filterSources: snapshot.filters.sources ?? {},
          filterTags: snapshot.filters.customTags ?? [],
        },
        create: {
          userId,
          filterSources: snapshot.filters.sources ?? {},
          filterTags: snapshot.filters.customTags ?? [],
        },
      })
    )
  }

  await Promise.allSettled(ops)
}
