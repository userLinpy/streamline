import { NextResponse } from 'next/server'
import { fetchGitHubReleases, DEFAULT_WATCHED_REPOS } from '@/lib/github-releases'

export async function GET() {
  const items = await fetchGitHubReleases(DEFAULT_WATCHED_REPOS)
  return NextResponse.json(items)
}
