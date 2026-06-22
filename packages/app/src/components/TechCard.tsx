'use client'

import { memo } from 'react'
import { Bookmark, Star, Clock, Brain } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { TechItem } from '@/types'
import { formatRelativeDate, formatStars } from '@/lib/utils'
import { getIconSlug, getIconData } from '@/lib/icons'
import { trackVisit } from '@/lib/history'
import { SourceIcon } from './SourceIcon'

type Props = {
  item: TechItem
  inReadLater: boolean
  inFavorites: boolean
  onAddToReadLater: (item: TechItem) => void
  onRemoveFromReadLater: (id: string) => void
  onAddFavorite: (item: TechItem) => void
  onRemoveFavorite: (id: string) => void
}

const SOURCE_BADGE: Record<
  TechItem['source'],
  { label: string; gradient: string; textColor: string; borderColor: string; accent: string }
> = {
  github: {
    label: 'GitHub',
    gradient: 'from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    accent: 'bg-green-500',
  },
  devto: {
    label: 'Dev.to',
    gradient: 'from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40',
    textColor: 'text-indigo-700 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    accent: 'bg-indigo-500',
  },
  'github-release': {
    label: 'Release',
    gradient: 'from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-500',
  },
  hackernews: {
    label: 'HN',
    gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    accent: 'bg-orange-500',
  },
  rss: {
    label: 'RSS',
    gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    accent: 'bg-cyan-500',
  },
}

function getDetailPath(item: TechItem): string {
  if (item.source === 'github') {
    return `/repo/${item.id.replace(/^gh-/, '')}`
  }
  if (item.source === 'devto') {
    return `/article/${item.id.replace(/^dt-/, '')}`
  }
  if (item.source === 'github-release') {
    const releaseId = item.id.replace(/^gr-/, '')
    const spaceIdx = item.title.lastIndexOf(' ')
    const fullName = item.title.slice(0, spaceIdx)
    return `/release/${fullName}/${releaseId}`
  }
  if (item.source === 'rss') return item.url
  return `/hn/${item.id.replace(/^hn-/, '')}`
}

export const TechCard = memo(function TechCard({
  item,
  inReadLater,
  inFavorites,
  onAddToReadLater,
  onRemoveFromReadLater,
  onAddFavorite,
  onRemoveFavorite,
}: Props) {
  const detailPath = getDetailPath(item)
  const badge = SOURCE_BADGE[item.source]
  const iconSlug = getIconSlug(item)
  const iconData = iconSlug ? getIconData(iconSlug) : null
  const useOwnerAvatar =
    (item.source === 'github' || item.source === 'github-release') &&
    !!item.ownerAvatar
  const hasAITag = item.tags.some(t => t.toLowerCase() === 'ia/ml')

  const logoContent: React.ReactNode = (() => {
    if (iconData)
      return (
        <div
          dangerouslySetInnerHTML={{ __html: iconData.svg }}
          style={{ color: `#${iconData.hex}`, width: 24, height: 24 }}
        />
      )
    if (useOwnerAvatar)
      return (
        <Image
          src={item.ownerAvatar!}
          alt={item.title}
          width={40}
          height={40}
          className="rounded-lg object-cover"
        />
      )
    if (hasAITag) return <Brain size={22} className="text-orange-400" />
    return null
  })()

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Cover */}
      <div
        className={`relative h-24 bg-gradient-to-br ${badge.gradient} border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center`}
      >
        {/* Accent stripe at top */}
        <div className={`absolute inset-x-0 top-0 h-0.5 ${badge.accent}`} />

        {/* Source badge */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white dark:bg-zinc-900 ${badge.textColor} ${badge.borderColor} flex items-center gap-1`}
        >
          <SourceIcon source={item.source} size={10} />
          {badge.label}
        </span>

        {/* Logo */}
        {logoContent !== null && (
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center overflow-hidden mt-1">
            {logoContent}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={() =>
              inReadLater ? onRemoveFromReadLater(item.id) : onAddToReadLater(item)
            }
            className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm transition-colors ${
              inReadLater
                ? 'bg-amber-400 border-amber-400 text-white'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-amber-500'
            }`}
            title={inReadLater ? 'Retirer de À lire' : 'Lire plus tard'}
          >
            <Bookmark size={12} fill={inReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() =>
              inFavorites ? onRemoveFavorite(item.id) : onAddFavorite(item)
            }
            className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm transition-colors ${
              inFavorites
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500'
            }`}
            title={inFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star size={12} fill={inFavorites ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex-1">
        {detailPath.startsWith('http') ? (
          <a
            href={detailPath}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackVisit({ id: item.id, title: item.title, source: item.source, detailPath })}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-tight block"
          >
            {item.title}
          </a>
        ) : (
          <Link
            href={detailPath}
            onClick={() => trackVisit({ id: item.id, title: item.title, source: item.source, detailPath })}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-tight block"
          >
            {item.title}
          </Link>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {formatRelativeDate(item.publishedAt)}
          </span>
          <div className="flex items-center gap-2">
            {item.stars > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                <Star size={9} fill="currentColor" />
                {formatStars(item.stars)}
              </span>
            )}
            {item.readTime > 0 && (
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                <Clock size={9} />
                {item.readTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
