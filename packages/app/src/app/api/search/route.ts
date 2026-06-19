import { type NextRequest, NextResponse } from 'next/server'
import type { TechItem } from '@/types'
import { transformRepo, type GitHubRepoRaw } from '@/lib/github'
import { transformArticle, type DevToArticleRaw } from '@/lib/devto'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return NextResponse.json([])

  const [ghResult, dtResult] = await Promise.allSettled([
    searchGitHub(q.trim()),
    searchDevTo(q.trim()),
  ])

  const ghItems = ghResult.status === 'fulfilled' ? ghResult.value : []
  const dtItems = dtResult.status === 'fulfilled' ? dtResult.value : []

  return NextResponse.json([...dtItems, ...ghItems])
}

async function searchGitHub(q: string): Promise<TechItem[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=10`,
    { headers, cache: 'no-store' }
  )
  if (!res.ok) return []
  const data: { items: GitHubRepoRaw[] } = await res.json()
  return (data.items ?? []).map(repo => transformRepo(repo, 0))
}

async function searchDevTo(q: string): Promise<TechItem[]> {
  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }
  const res = await fetch(
    `https://dev.to/api/articles?tag=${encodeURIComponent(q)}&per_page=10`,
    { headers, cache: 'no-store' }
  )
  if (!res.ok) return []
  const articles: DevToArticleRaw[] = await res.json()
  return articles.map(transformArticle)
}
