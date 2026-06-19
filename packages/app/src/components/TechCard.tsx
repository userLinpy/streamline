'use client'

import { Bookmark, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { TechItem } from '@/types'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { formatRelativeDate, formatStars } from '@/lib/utils'

type Props = { item: TechItem }

export function TechCard({ item }: Props) {
  const { isInReadLater, addToReadLater, removeFromReadLater } = useReadLater()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const inReadLater = isInReadLater(item.id)
  const inFavorites = isFavorite(item.id)
  const numericId = item.id.replace(/^(gh|dt)-/, '')
  const detailPath =
    item.source === 'github' ? `/repo/${numericId}` : `/article/${numericId}`
  const isGitHub = item.source === 'github'

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
      {/* Cover */}
      <div
        className={`relative h-20 flex items-center justify-center border-b border-zinc-100 ${
          isGitHub ? 'bg-green-50' : 'bg-indigo-50'
        }`}
      >
        {/* Badge source */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${
            isGitHub
              ? 'text-green-700 border-green-200'
              : 'text-indigo-700 border-indigo-200'
          }`}
        >
          {isGitHub ? '★ GitHub' : '✍ Dev.to'}
        </span>

        {/* Logo / initiales */}
        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 shadow flex items-center justify-center overflow-hidden">
          {item.ownerAvatar ? (
            <Image
              src={item.ownerAvatar}
              alt={item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <span
              className={`text-xs font-bold ${
                isGitHub ? 'text-green-700' : 'text-indigo-700'
              }`}
            >
              {item.coverInitials}
            </span>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() =>
              inReadLater
                ? removeFromReadLater(item.id)
                : addToReadLater(item)
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

      {/* Corps */}
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
            <span className="text-[10px] text-amber-600">
              ★ {formatStars(item.stars)}
            </span>
            {item.readTime > 0 && (
              <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                <Clock size={9} />
                {isGitHub ? '~' : ''}
                {item.readTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
