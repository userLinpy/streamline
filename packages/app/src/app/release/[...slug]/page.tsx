import Link from 'next/link'
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react'
import { marked } from 'marked'
import { AISummary } from '@/components/AISummary'

type GitHubReleaseDetail = {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
  author: {
    login: string
    avatar_url: string
  } | null
}

async function fetchRelease(
  owner: string,
  repo: string,
  releaseId: string
): Promise<GitHubReleaseDetail | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return res.json() as Promise<GitHubReleaseDetail>
  } catch {
    return null
  }
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const [owner, repo, releaseId] = slug

  if (!owner || !repo || !releaseId) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">Release introuvable.</p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const fullName = `${owner}/${repo}`
  const release = await fetchRelease(owner, repo, releaseId)

  if (!release) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">
            Release introuvable ou erreur GitHub API.
          </p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const bodyHtml = release.body ? String(await marked(release.body)) : null

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

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{fullName}</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {release.name ?? release.tag_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Tag size={12} className="text-zinc-400 dark:text-zinc-500" />
                <span className="text-sm text-green-700 dark:text-green-400 font-mono">
                  {release.tag_name}
                </span>
                {release.prerelease && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    Pre-release
                  </span>
                )}
              </div>
            </div>
            <a
              href={release.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0"
            >
              <ExternalLink size={14} /> GitHub
            </a>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
            Publié le{' '}
            {new Date(release.published_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            par {release.author?.login ?? 'GitHub'}
          </p>

          <div className="mb-6">
            <AISummary
              title={release.name ?? release.tag_name}
              text={(release.body ?? '').slice(0, 3000)}
            />
          </div>

          {bodyHtml ? (
            <div
              className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:rounded [&_code]:text-zinc-800 dark:[&_code]:text-zinc-200"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500 italic text-sm">
              Aucune description pour cette release.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
