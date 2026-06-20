import Link from 'next/link'
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react'
import { marked } from 'marked'

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
  }
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
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Release introuvable.</p>
      </div>
    )
  }

  const fullName = `${owner}/${repo}`
  const release = await fetchRelease(owner, repo, releaseId)

  if (!release) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Release introuvable ou erreur GitHub API.</p>
      </div>
    )
  }

  const bodyHtml = release.body ? String(await marked(release.body)) : null

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
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">{fullName}</p>
              <h1 className="text-2xl font-bold text-zinc-900">
                {release.name ?? release.tag_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Tag size={12} className="text-zinc-400" />
                <span className="text-sm text-green-700 font-mono">
                  {release.tag_name}
                </span>
                {release.prerelease && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
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

          <p className="text-xs text-zinc-400 mb-6">
            Publié le{' '}
            {new Date(release.published_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            par {release.author.login}
          </p>

          {bodyHtml ? (
            <div
              className="text-sm text-zinc-700 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-indigo-600 [&_a]:underline [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="text-zinc-400 italic text-sm">
              Aucune description pour cette release.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
