import Link from 'next/link'
import { ArrowLeft, ExternalLink, MessageSquare, Star, Zap } from 'lucide-react'
import { AISummary } from '@/components/AISummary'

type HNItemDetail = {
  objectID: string
  title: string
  url: string | null
  story_text: string | null
  author: string
  points: number
  created_at: string
  num_comments: number
}

async function fetchHNItem(id: string): Promise<HNItemDetail | null> {
  try {
    const res = await fetch(`https://hn.algolia.com/api/v1/items/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json() as Promise<HNItemDetail>
  } catch {
    return null
  }
}

export default async function HNItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await fetchHNItem(id)

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">Article introuvable.</p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const hnDiscussionUrl = `https://news.ycombinator.com/item?id=${id}`

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-8">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
          <Zap size={14} />
          Streamline
        </span>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-orange-500 text-lg font-bold shrink-0">▲</span>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 mb-6">
            <span className="flex items-center gap-1">
              <Star size={11} className="text-amber-500" />
              {item.points} points
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {item.num_comments} commentaires
            </span>
            <span>par {item.author}</span>
            <span>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="mb-6">
            <AISummary
              title={item.title}
              text={(item.story_text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)}
            />
          </div>

          {item.story_text && (
            <div
              className="text-sm text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed [&_p]:mb-2 [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: item.story_text }}
            />
          )}

          <div className="flex flex-wrap gap-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ExternalLink size={14} /> Lire l'article
              </a>
            )}
            <a
              href={hnDiscussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <MessageSquare size={14} /> Discussion HN
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
