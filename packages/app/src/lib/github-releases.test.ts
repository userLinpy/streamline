import { describe, it, expect } from 'vitest'
import { transformRelease } from './github-releases'

const MOCK_RELEASE = {
  id: 12345,
  tag_name: 'v3.14.0',
  name: 'Python 3.14.0',
  body: 'What is new in Python 3.14',
  html_url: 'https://github.com/python/cpython/releases/tag/v3.14.0',
  published_at: '2026-01-15T10:00:00Z',
  prerelease: false,
}

const MOCK_META = {
  stargazers_count: 65000,
  language: 'Python',
  topics: ['python', 'programming-language'],
}

describe('transformRelease', () => {
  it('should set source to github-release', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.source).toBe('github-release')
  })

  it('should set id as gr-{releaseId}', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.id).toBe('gr-12345')
  })

  it('should set title as {fullName} {tag_name}', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.title).toBe('python/cpython v3.14.0')
  })

  it('should set stars from repo metadata stargazers_count', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.stars).toBe(65000)
  })

  it('should include language as first tag', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.tags[0]).toBe('Python')
  })

  it('should include repo topics in tags', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.tags).toContain('python')
  })

  it('should set url to the release html_url', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.url).toBe('https://github.com/python/cpython/releases/tag/v3.14.0')
  })

  it('should set readTime to 0', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.readTime).toBe(0)
  })

  it('should generate coverInitials from repo name', () => {
    const item = transformRelease(MOCK_RELEASE, 'python/cpython', MOCK_META)
    expect(item.coverInitials).toBe('C')
  })
})
