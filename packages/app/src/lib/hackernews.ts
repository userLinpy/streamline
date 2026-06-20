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

// Maps title keywords to canonical tag names (matching PREDEFINED_TAGS in useFilters)
const KEYWORD_TO_TAG: Array<[RegExp, string]> = [
  [/\bpython\b/i, 'Python'],
  [/\bjavascript\b|\bjs\b/i, 'JavaScript'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\breact\b/i, 'React'],
  [/\bnode\.?js\b/i, 'Node.js'],
  [/\bgolang\b|\bgo\b/i, 'Go'],
  [/\brust\b/i, 'Rust'],
  [/\bdevops\b|\bkubernetes\b|\bk8s\b|\bdocker\b/i, 'DevOps'],
  [/\b(ai|llm|machine.?learning|neural|gpt|claude|gemini)\b/i, 'IA/ML'],
  [/\bsecurity\b|\bcybersecurity\b/i, 'Security'],
  [/open.?source/i, 'Open Source'],
]

function extractTechTags(title: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const [pattern, tag] of KEYWORD_TO_TAG) {
    if (pattern.test(title) && !seen.has(tag)) {
      seen.add(tag)
      result.push(tag)
    }
  }
  return result
}

export function transformHit(hit: HNHit): TechItem {
  const words = hit.title.split(/\s+/).filter(Boolean)
  const coverInitials =
    words
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'HN'

  const plainText = hit.story_text?.replace(/<[^>]+>/g, '') ?? null
  const description = plainText?.slice(0, 200) ?? `Discussion HN par ${hit.author}`

  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0
  const readTime = wordCount > 0 ? Math.max(1, Math.round(wordCount / 200)) : 0

  return {
    id: `hn-${hit.objectID}`,
    source: 'hackernews',
    title: hit.title,
    description,
    url: `/hn/${hit.objectID}`,
    tags: extractTechTags(hit.title),
    stars: hit.points,
    readTime,
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
