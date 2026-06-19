import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const [githubItems, devtoItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
  ])

  const items = [...devtoItems, ...githubItems]

  return <DashboardClient items={items} />
}
