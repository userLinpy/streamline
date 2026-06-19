import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'

export default async function Home() {
  const [githubItems, devtoItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
  ])

  console.log('=== STREAMLINE DATA VALIDATION ===')
  console.log(`GitHub repos: ${githubItems.length}`)
  if (githubItems[0]) {
    console.log('Premier repo GitHub:', JSON.stringify(githubItems[0], null, 2))
  }
  console.log(`Dev.to articles: ${devtoItems.length}`)
  if (devtoItems[0]) {
    console.log('Premier article Dev.to:', JSON.stringify(devtoItems[0], null, 2))
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>Streamline — validation données</h1>
      <p>GitHub repos chargés : <strong>{githubItems.length}</strong></p>
      <p>Articles Dev.to chargés : <strong>{devtoItems.length}</strong></p>
      <p style={{ color: '#666' }}>Regarde le terminal pour voir les données !</p>
    </main>
  )
}
