import Link from 'next/link'
import { ArrowLeft, ExternalLink, Clock } from 'lucide-react'
import { formatRelativeDate, formatStars } from '@/lib/utils'
import type { DevToArticleRaw } from '@/lib/devto'
import { AISummary } from '@/components/AISummary'

type DevToArticleDetail = Omit<DevToArticleRaw, 'tag_list'> & {
  body_html: string
  tag_list: string | string[] // detail endpoint returns CSV string, list endpoint returns array
  user: {
    name: string
    username: string
    profile_image: string
  }
}

type Params = { params: Promise<{ id: string }> }

export default async function ArticlePage({ params }: Params) {
  const { id } = await params

  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }

  const res = await fetch(`https://dev.to/api/articles/${id}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
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

  const article: DevToArticleDetail = await res.json()

  const tagList: string[] = Array.isArray(article.tag_list)
    ? article.tag_list
    : typeof article.tag_list === 'string' && article.tag_list
      ? article.tag_list.split(',').map(t => t.trim()).filter(Boolean)
      : []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-8">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
          ⚡ Streamline
        </span>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
      </header>

      <article className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 mt-4 mx-3 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-4">
            ✍ Dev.to
          </span>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
            <span>{article.user.name}</span>
            <span>{formatRelativeDate(article.published_at)}</span>
            <span className="text-amber-600 dark:text-amber-400">
              ★ {formatStars(article.public_reactions_count)}
            </span>
            {article.reading_time_minutes > 0 && (
              <span className="text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                <Clock size={10} />
                {article.reading_time_minutes} min
              </span>
            )}
          </div>
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tagList.map(tag => (
                <span
                  key={tag}
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <AISummary
            title={article.title}
            text={article.body_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)}
          />
        </div>

        {/* Lien vers l'original */}
        <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-3">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 truncate">
            {article.url}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
          >
            <ExternalLink size={11} />
            Lire sur Dev.to
          </a>
        </div>

        {/* Corps */}
        <div
          className="p-6 article-body"
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />
      </article>
    </div>
  )
}
