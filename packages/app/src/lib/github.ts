import type { TechItem } from '@/types'

export type GitHubRepoRaw = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  topics: string[]
  language: string | null
  pushed_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

type GitHubReadmeRaw = {
  content: string
  encoding: string
}

type GitHubSearchResponse = {
  items: GitHubRepoRaw[]
}

export function transformRepo(repo: GitHubRepoRaw, readmeWordCount: number): TechItem {
  const parts = repo.name.split(/[-_]/).filter(Boolean)
  const coverInitials =
    parts
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'GH'

  const tags: string[] = []
  if (repo.language) tags.push(repo.language)
  repo.topics.slice(0, 3).forEach(t => tags.push(t))

  return {
    id: `gh-${repo.id}`,
    source: 'github',
    title: repo.full_name,
    description: repo.description ?? 'No description',
    url: repo.html_url,
    tags,
    stars: repo.stargazers_count,
    readTime: readmeWordCount > 0 ? Math.ceil(readmeWordCount / 200) : 0,
    publishedAt: repo.pushed_at,
    ownerAvatar: repo.owner.avatar_url,
    coverInitials,
  }
}

async function fetchReadmeWordCount(fullName: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const data: GitHubReadmeRaw = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return content.split(/\s+/).filter(Boolean).length
  } catch {
    return 0
  }
}

export async function fetchGitHub(): Promise<TechItem[]> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=stars:>500+pushed:>${twoWeeksAgo}&sort=updated&per_page=15`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      console.error('GitHub API error:', res.status)
      return []
    }
    const data: GitHubSearchResponse = await res.json()
    const repos = data.items ?? []
    const wordCounts = await Promise.all(
      repos.map(repo => fetchReadmeWordCount(repo.full_name))
    )
    return repos.map((repo, i) => transformRepo(repo, wordCounts[i] ?? 0))
  } catch (err) {
    console.error('fetchGitHub failed:', err)
    return []
  }
}
