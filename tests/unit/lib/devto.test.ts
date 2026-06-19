import { describe, it, expect } from 'vitest'
import { transformArticle, type DevToArticleRaw } from '@/lib/devto'

const mockArticle: DevToArticleRaw = {
  id: 999,
  title: 'React Server Components expliqués simplement',
  description: 'Un guide clair sur les RSC.',
  url: 'https://dev.to/jane/react-server-components',
  tag_list: ['react', 'nextjs', 'typescript', 'webdev'],
  public_reactions_count: 342,
  reading_time_minutes: 8,
  cover_image: null,
  published_at: '2026-06-18T10:00:00Z',
}

describe('transformArticle', () => {
  it('should prefix id with dt-', () => {
    expect(transformArticle(mockArticle).id).toBe('dt-999')
  })

  it('should set source to devto', () => {
    expect(transformArticle(mockArticle).source).toBe('devto')
  })

  it('should use public_reactions_count as stars', () => {
    expect(transformArticle(mockArticle).stars).toBe(342)
  })

  it('should use reading_time_minutes as readTime', () => {
    expect(transformArticle(mockArticle).readTime).toBe(8)
  })

  it('should map tag_list to tags (max 4)', () => {
    expect(transformArticle(mockArticle).tags).toEqual([
      'react', 'nextjs', 'typescript', 'webdev',
    ])
  })

  it('should truncate tags to 4', () => {
    const article = { ...mockArticle, tag_list: ['a', 'b', 'c', 'd', 'e'] }
    expect(transformArticle(article).tags).toHaveLength(4)
  })

  it('should generate coverInitials from title (uppercase, 1-3 chars)', () => {
    expect(transformArticle(mockArticle).coverInitials).toMatch(/^[A-Z]{1,3}$/)
  })

  it('should not set ownerAvatar', () => {
    expect(transformArticle(mockArticle).ownerAvatar).toBeUndefined()
  })

  it('should use url as url', () => {
    expect(transformArticle(mockArticle).url).toBe(
      'https://dev.to/jane/react-server-components'
    )
  })
})
