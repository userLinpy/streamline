import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { marked } from 'marked'
import { formatRelativeDate, formatStars } from '@/lib/utils'

type GitHubRepoDetail = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  pushed_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

type Params = { params: Promise<{ id: string }> }

export default async function RepoPage({ params }: Params) {
  const { id } = await params

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const repoRes = await fetch(`https://api.github.com/repositories/${id}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!repoRes.ok) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-3">Repo introuvable.</p>
          <Link href="/" className="text-indigo-600 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const repo: GitHubRepoDetail = await repoRes.json()

  const readmeRes = await fetch(
    `https://api.github.com/repos/${repo.full_name}/readme`,
    { headers, next: { revalidate: 3600 } }
  )

  let readmeHtml = ''
  if (readmeRes.ok) {
    const readmeData: { content: string } = await readmeRes.json()
    const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')
    readmeHtml = String(await marked.parse(content))
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-extrabold text-indigo-600">⚡ Streamline</span>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100"
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
      </header>

      <article className="max-w-2xl mx-auto bg-white mt-4 mx-3 rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-zinc-100">
          <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 mb-4">
            ★ GitHub
          </span>
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              width={32}
              height={32}
              className="rounded-lg border border-zinc-200"
            />
            <h1 className="text-xl font-bold text-zinc-900">{repo.full_name}</h1>
          </div>
          {repo.description && (
            <p className="text-sm text-zinc-600 mb-3">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500">
            <span>{formatRelativeDate(repo.pushed_at)}</span>
            <span className="text-amber-600">★ {formatStars(repo.stargazers_count)}</span>
            {repo.language && (
              <span className="text-indigo-500">{repo.language}</span>
            )}
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {repo.topics.map(topic => (
                <span key={topic} className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lien vers GitHub */}
        <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between gap-3">
          <span className="text-xs text-green-700 truncate">{repo.html_url}</span>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 shrink-0"
          >
            <ExternalLink size={11} />
            Voir sur GitHub
          </a>
        </div>

        {/* README */}
        {readmeHtml ? (
          <div
            className="p-6 article-body"
            dangerouslySetInnerHTML={{ __html: readmeHtml }}
          />
        ) : (
          <div className="p-6 text-center text-zinc-400 text-sm">
            Pas de README disponible pour ce dépôt.
          </div>
        )}
      </article>
    </div>
  )
}
