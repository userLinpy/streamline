import type { TechItem } from '@/types'

export type DevToArticleRaw = {
  id: number
  title: string
  description: string
  url: string
  tag_list: string[]
  public_reactions_count: number
  reading_time_minutes: number
  cover_image: string | null
  published_at: string
}

export function transformArticle(article: DevToArticleRaw): TechItem {
  const words = article.title.split(/\s+/).filter(Boolean)
  const coverInitials =
    words
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'DT'

  return {
    id: `dt-${article.id}`,
    source: 'devto',
    title: article.title,
    description: article.description,
    url: article.url,
    tags: article.tag_list.slice(0, 4),
    stars: article.public_reactions_count,
    readTime: article.reading_time_minutes,
    publishedAt: article.published_at,
    coverInitials,
  }
}

export async function fetchDevTo(): Promise<TechItem[]> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }

  try {
    const res = await fetch('https://dev.to/api/articles?per_page=15&top=14', {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      console.error('Dev.to API error:', res.status)
      return []
    }
    const articles: DevToArticleRaw[] = await res.json()
    return articles
      .filter(a => new Date(a.published_at) >= twoWeeksAgo)
      .map(transformArticle)
  } catch (err) {
    console.error('fetchDevTo failed:', err)
    return []
  }
}
