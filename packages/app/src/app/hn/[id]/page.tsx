import Link from 'next/link'
import { ArrowLeft, ExternalLink, MessageSquare, Star } from 'lucide-react'

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
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Article introuvable.</p>
      </div>
    )
  }

  const hnDiscussionUrl = `https://news.ycombinator.com/item?id=${id}`

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto p-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-orange-500 text-lg font-bold shrink-0">▲</span>
            <h1 className="text-xl font-bold text-zinc-900">{item.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-6">
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

          {item.story_text && (
            <div
              className="text-sm text-zinc-700 mb-6 leading-relaxed [&_p]:mb-2 [&_a]:text-indigo-600 [&_a]:underline"
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
              className="flex items-center gap-1.5 text-sm bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors border border-zinc-200"
            >
              <MessageSquare size={14} /> Discussion HN
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
