import { describe, it, expect } from 'vitest'
import { transformHit } from '@/lib/hackernews'
import type { HNHit } from '@/lib/hackernews'

const MOCK_HIT: HNHit = {
  objectID: '38765432',
  title: 'Python 3.14 released',
  url: 'https://python.org/news',
  story_text: null,
  author: 'testuser',
  points: 450,
  created_at: '2026-01-15T10:00:00Z',
  _tags: ['story'],
  story_id: null,
}

const MOCK_HIT_WITH_TEXT: HNHit = {
  objectID: '38765433',
  title: 'Ask HN: Best resources for learning Rust?',
  url: null,
  story_text: '<p>Looking for resources to learn Rust in 2026</p>',
  author: 'rustlearner',
  points: 230,
  created_at: '2026-01-16T08:00:00Z',
  _tags: ['story', 'ask_hn'],
  story_id: null,
}

describe('transformHit', () => {
  it('should set source to hackernews', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.source).toBe('hackernews')
  })

  it('should set id as hn-{objectID}', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.id).toBe('hn-38765432')
  })

  it('should set url to internal /hn/{id} page', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.url).toBe('/hn/38765432')
  })

  it('should set stars from points', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.stars).toBe(450)
  })

  it('should set readTime to 0 when no story_text', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.readTime).toBe(0)
  })

  it('should estimate readTime from story_text word count', () => {
    const item = transformHit(MOCK_HIT_WITH_TEXT)
    expect(item.readTime).toBeGreaterThanOrEqual(1)
  })

  it('should extract tech tags from title', () => {
    const item = transformHit(MOCK_HIT) // 'Python 3.14 released'
    expect(item.tags).toContain('Python')
  })

  it('should extract Rust tag from Ask HN title', () => {
    const item = transformHit(MOCK_HIT_WITH_TEXT) // 'Ask HN: Best resources for learning Rust?'
    expect(item.tags).toContain('Rust')
  })

  it('should return empty tags for titles with no known tech keywords', () => {
    const hit = { ...MOCK_HIT, title: 'Why remote work is the future' }
    const item = transformHit(hit)
    expect(item.tags).toHaveLength(0)
  })

  it('should generate coverInitials from first 3 title words', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.coverInitials).toBe('P3R')
  })

  it('should set description from story_text when present', () => {
    const item = transformHit(MOCK_HIT_WITH_TEXT)
    expect(item.description).toContain('Looking for resources')
  })

  it('should set description as fallback when no story_text', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.description).toContain('testuser')
  })
})
