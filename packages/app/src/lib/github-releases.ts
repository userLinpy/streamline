import type { TechItem } from '@/types'

export type GitHubReleaseRaw = {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
}

export type GitHubRepoMetaRaw = {
  stargazers_count: number
  language: string | null
  topics: string[]
}

export const DEFAULT_WATCHED_REPOS = [
  'python/cpython',
  'nodejs/node',
  'microsoft/TypeScript',
  'facebook/react',
  'vercel/next.js',
  'vuejs/core',
  'golang/go',
  'rust-lang/rust',
  'django/django',
  'tiangolo/fastapi',
  'microsoft/vscode',
  'kubernetes/kubernetes',
]

export function transformRelease(
  release: GitHubReleaseRaw,
  repo: string,
  repoMeta: GitHubRepoMetaRaw
): TechItem {
  const repoName = repo.split('/')[1] ?? repo
  const repoNameParts = repoName.split(/[-_]/).filter(Boolean)
  const coverInitials =
    repoNameParts
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'GR'

  const tags: string[] = []
  if (repoMeta.language) tags.push(repoMeta.language)
  repoMeta.topics.slice(0, 3).forEach(t => tags.push(t))

  return {
    id: `gr-${release.id}`,
    source: 'github-release',
    title: `${repo} ${release.tag_name}`,
    description: release.name ?? release.tag_name,
    url: release.html_url,
    tags,
    stars: repoMeta.stargazers_count,
    readTime: 0,
    publishedAt: release.published_at,
    coverInitials,
  }
}

async function fetchRepoReleases(
  repo: string,
  headers: HeadersInit
): Promise<TechItem[]> {
  try {
    const [releasesRes, metaRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/releases?per_page=3`, {
        headers,
        next: { revalidate: 3600 },
      } as RequestInit),
      fetch(`https://api.github.com/repos/${repo}`, {
        headers,
        next: { revalidate: 3600 },
      } as RequestInit),
    ])
    if (!releasesRes.ok || !metaRes.ok) return []
    const releases: GitHubReleaseRaw[] = await releasesRes.json()
    const meta: GitHubRepoMetaRaw = await metaRes.json()
    return releases
      .filter(r => !r.prerelease)
      .map(r => transformRelease(r, repo, meta))
  } catch {
    return []
  }
}

export async function fetchGitHubReleases(
  repos: string[] = DEFAULT_WATCHED_REPOS
): Promise<TechItem[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const results = await Promise.all(repos.map(r => fetchRepoReleases(r, headers)))
    return results.flat()
  } catch (err) {
    console.error('fetchGitHubReleases failed:', err)
    return []
  }
}
