import { fetchGitHub } from '@/lib/github'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const githubItems = await fetchGitHub()
  return <DashboardClient initialItems={githubItems} />
}
