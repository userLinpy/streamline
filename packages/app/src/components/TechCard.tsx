'use client'

import { Bookmark, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { TechItem } from '@/types'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { formatRelativeDate, formatStars } from '@/lib/utils'
import { getIconSlug, getIconData } from '@/lib/icons'

type Props = { item: TechItem }

const SOURCE_BADGE: Record<
  TechItem['source'],
  { label: string; bg: string; textColor: string; borderColor: string }
> = {
  github: {
    label: '★ GitHub',
    bg: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  devto: {
    label: '✍ Dev.to',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  'github-release': {
    label: '📦 Release',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  hackernews: {
    label: '🔶 HN',
    bg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
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
    // title = 'owner/repo v1.2.3' — extract owner/repo (before last space)
    const spaceIdx = item.title.lastIndexOf(' ')
    const fullName = item.title.slice(0, spaceIdx)
    return `/release/${fullName}/${releaseId}`
  }
  // hackernews
  return `/hn/${item.id.replace(/^hn-/, '')}`
}

export function TechCard({ item }: Props) {
  const { isInReadLater, addToReadLater, removeFromReadLater } = useReadLater()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [pngError, setPngError] = useState(false)

  const inReadLater = isInReadLater(item.id)
  const inFavorites = isFavorite(item.id)
  const detailPath = getDetailPath(item)
  const badge = SOURCE_BADGE[item.source]
  const iconSlug = getIconSlug(item)
  const iconData = iconSlug ? getIconData(iconSlug) : null
  const pngSrc = iconSlug ? `/logos/${iconSlug}.png` : null
  const useOwnerAvatar =
    (item.source === 'github' || item.source === 'github-release') &&
    !!item.ownerAvatar

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
      {/* Cover */}
      <div
        className={`relative h-20 flex items-center justify-center border-b border-zinc-100 ${badge.bg}`}
      >
        {/* Source badge */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${badge.textColor} ${badge.borderColor}`}
        >
          {badge.label}
        </span>

        {/* Logo: PNG override → SVG simple-icons → ownerAvatar → coverInitials */}
        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 shadow flex items-center justify-center overflow-hidden">
          {pngSrc && !pngError ? (
            <Image
              src={pngSrc}
              alt={iconSlug ?? item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
              onError={() => setPngError(true)}
            />
          ) : iconData ? (
            <div
              dangerouslySetInnerHTML={{ __html: iconData.svg }}
              style={{ color: `#${iconData.hex}`, width: 24, height: 24 }}
            />
          ) : useOwnerAvatar ? (
            <Image
              src={item.ownerAvatar!}
              alt={item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <span className={`text-xs font-bold ${badge.textColor}`}>
              {item.coverInitials}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() =>
              inReadLater ? removeFromReadLater(item.id) : addToReadLater(item)
            }
            className={`w-7 h-7 rounded-md flex items-center justify-center border shadow-sm transition-colors ${
              inReadLater
                ? 'bg-amber-400 border-amber-400 text-white'
                : 'bg-white border-zinc-200 text-zinc-400 hover:text-amber-500'
            }`}
            title={inReadLater ? 'Retirer de À lire' : 'Lire plus tard'}
          >
            <Bookmark size={12} fill={inReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() =>
              inFavorites ? removeFavorite(item.id) : addFavorite(item)
            }
            className={`w-7 h-7 rounded-md flex items-center justify-center border shadow-sm transition-colors ${
              inFavorites
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-zinc-200 text-zinc-400 hover:text-rose-500'
            }`}
            title={inFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star size={12} fill={inFavorites ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex-1">
        <Link
          href={detailPath}
          className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 line-clamp-2 leading-tight block"
        >
          {item.title}
        </Link>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-zinc-50">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            {formatRelativeDate(item.publishedAt)}
          </span>
          <div className="flex items-center gap-2">
            {item.stars > 0 && (
              <span className="text-[10px] text-amber-600">
                ★ {formatStars(item.stars)}
              </span>
            )}
            {item.readTime > 0 && (
              <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                <Clock size={9} />
                {item.readTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
