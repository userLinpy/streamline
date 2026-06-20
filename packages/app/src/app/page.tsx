import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'
import { fetchGitHubReleases, DEFAULT_WATCHED_REPOS } from '@/lib/github-releases'
import { fetchHackerNews } from '@/lib/hackernews'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const [githubItems, devtoItems, releaseItems, hnItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
    fetchGitHubReleases(DEFAULT_WATCHED_REPOS),
    fetchHackerNews(),
  ])

  const items = [...devtoItems, ...hnItems, ...githubItems, ...releaseItems]

  return <DashboardClient items={items} />
}
