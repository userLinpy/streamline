import { NextResponse } from 'next/server'
import { fetchGitHubReleases } from '@/lib/github-releases'

const REPO_REGEX = /^[\w.-]+\/[\w.-]+$/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reposParam = searchParams.get('repos')

  if (!reposParam) {
    return NextResponse.json({ error: 'repos parameter required' }, { status: 400 })
  }

  const repos = reposParam
    .split(',')
    .map(r => r.trim())
    .filter(r => REPO_REGEX.test(r))
    .slice(0, 20) // limite de sécurité

  if (repos.length === 0) {
    return NextResponse.json([])
  }

  const items = await fetchGitHubReleases(repos)
  return NextResponse.json(items)
}
