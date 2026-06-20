import type { TechItem } from '@/types'

export type HNHit = {
  objectID: string
  title: string
  url: string | null
  story_text: string | null
  author: string
  points: number
  created_at: string
  _tags: string[]
  story_id: number | null
}

type HNSearchResponse = {
  hits: HNHit[]
}

const HN_QUERIES = [
  'python release',
  'javascript framework',
  'typescript',
  'AI LLM ChatGPT Claude Gemini',
  'DevOps kubernetes docker',
  'rust golang',
]

export function transformHit(hit: HNHit): TechItem {
  const words = hit.title.split(/\s+/).filter(Boolean)
  const coverInitials =
    words
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'HN'

  const rawText = hit.story_text?.replace(/<[^>]+>/g, '').slice(0, 200) ?? null
  const description = rawText ?? `Discussion HN par ${hit.author}`

  return {
    id: `hn-${hit.objectID}`,
    source: 'hackernews',
    title: hit.title,
    description,
    url: `/hn/${hit.objectID}`,
    tags: [],
    stars: hit.points,
    readTime: 0,
    publishedAt: hit.created_at,
    coverInitials,
  }
}

export async function fetchHackerNews(): Promise<TechItem[]> {
  try {
    const results = await Promise.all(
      HN_QUERIES.map(q =>
        fetch(
          `https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent(q)}&hitsPerPage=10`,
          { next: { revalidate: 3600 } }
        )
          .then(r => r.json() as Promise<HNSearchResponse>)
          .then(data => data.hits)
          .catch((): HNHit[] => [])
      )
    )

    const seen = new Set<string>()
    const unique: HNHit[] = []
    for (const hit of results.flat()) {
      if (!seen.has(hit.objectID)) {
        seen.add(hit.objectID)
        unique.push(hit)
      }
    }

    return unique
      .sort((a, b) => b.points - a.points)
      .slice(0, 40)
      .map(transformHit)
  } catch (err) {
    console.error('fetchHackerNews failed:', err)
    return []
  }
}
