export type TechItem = {
  id: string
  source: 'github' | 'devto' | 'github-release' | 'hackernews' | 'rss'
  title: string
  description: string
  url: string
  tags: string[]
  stars: number
  readTime: number
  publishedAt: string
  ownerAvatar?: string
  coverInitials: string
}
