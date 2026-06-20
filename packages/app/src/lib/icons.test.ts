import { describe, it, expect } from 'vitest'
import { getIconSlug, getIconData } from './icons'
import type { TechItem } from '@/types'

function makeItem(overrides: Partial<TechItem>): TechItem {
  return {
    id: 'test-1',
    source: 'devto',
    title: 'Test article',
    description: '',
    url: 'https://example.com',
    tags: [],
    stars: 0,
    readTime: 0,
    publishedAt: '2026-01-01T00:00:00Z',
    coverInitials: 'TA',
    ...overrides,
  }
}

describe('getIconSlug', () => {
  it('should return python for Python tag', () => {
    const item = makeItem({ tags: ['python', 'web'] })
    expect(getIconSlug(item)).toBe('python')
  })

  it('should return react for react tag', () => {
    const item = makeItem({ tags: ['react'] })
    expect(getIconSlug(item)).toBe('react')
  })

  it('should return openai for ChatGPT in title (case-insensitive)', () => {
    const item = makeItem({ title: 'ChatGPT 5 is here', tags: [] })
    expect(getIconSlug(item)).toBe('openai')
  })

  it('should return anthropic for Claude in title', () => {
    const item = makeItem({ title: 'Claude 4 announcement', tags: [] })
    expect(getIconSlug(item)).toBe('anthropic')
  })

  it('should return google for Gemini in title', () => {
    const item = makeItem({ title: 'Gemini 2.0 update', tags: [] })
    expect(getIconSlug(item)).toBe('google')
  })

  it('should prioritize AI keyword in title over tags', () => {
    const item = makeItem({ title: 'Claude using Python', tags: ['python'] })
    expect(getIconSlug(item)).toBe('anthropic')
  })

  it('should return null when no match', () => {
    const item = makeItem({ title: 'General update', tags: ['general'] })
    expect(getIconSlug(item)).toBeNull()
  })
})

describe('getIconData', () => {
  it('should return svg and hex for python', () => {
    const data = getIconData('python')
    expect(data).not.toBeNull()
    expect(data?.svg).toContain('<svg')
    expect(data?.hex).toMatch(/^[0-9A-Fa-f]{6}$/)
  })

  it('should return null for unknown slug', () => {
    expect(getIconData('this-slug-does-not-exist-xyz')).toBeNull()
  })
})
