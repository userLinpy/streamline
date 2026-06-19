import { describe, it, expect } from 'vitest'
import { transformRepo, type GitHubRepoRaw } from '@/lib/github'

const mockRepo: GitHubRepoRaw = {
  id: 12345,
  name: 'my-awesome-lib',
  full_name: 'shadcn-ui/my-awesome-lib',
  description: 'A great UI library',
  html_url: 'https://github.com/shadcn-ui/my-awesome-lib',
  stargazers_count: 5200,
  topics: ['typescript', 'react', 'ui'],
  language: 'TypeScript',
  pushed_at: '2026-06-18T10:00:00Z',
  owner: {
    avatar_url: 'https://avatars.githubusercontent.com/u/139895814',
    login: 'shadcn-ui',
  },
}

describe('transformRepo', () => {
  it('should prefix id with gh-', () => {
    expect(transformRepo(mockRepo, 0).id).toBe('gh-12345')
  })

  it('should set source to github', () => {
    expect(transformRepo(mockRepo, 0).source).toBe('github')
  })

  it('should use full_name as title', () => {
    expect(transformRepo(mockRepo, 0).title).toBe('shadcn-ui/my-awesome-lib')
  })

  it('should include language as first tag', () => {
    expect(transformRepo(mockRepo, 0).tags[0]).toBe('TypeScript')
  })

  it('should set readTime to 0 when wordCount is 0', () => {
    expect(transformRepo(mockRepo, 0).readTime).toBe(0)
  })

  it('should estimate readTime from wordCount at 200 wpm', () => {
    expect(transformRepo(mockRepo, 600).readTime).toBe(3)
  })

  it('should round up readTime', () => {
    expect(transformRepo(mockRepo, 210).readTime).toBe(2)
  })

  it('should set ownerAvatar', () => {
    expect(transformRepo(mockRepo, 0).ownerAvatar).toBe(
      'https://avatars.githubusercontent.com/u/139895814'
    )
  })

  it('should generate coverInitials (uppercase, 1-3 chars)', () => {
    expect(transformRepo(mockRepo, 0).coverInitials).toMatch(/^[A-Z]{1,3}$/)
  })

  it('should replace null description with fallback', () => {
    expect(transformRepo({ ...mockRepo, description: null }, 0).description).toBe(
      'No description'
    )
  })

  it('should skip language tag when language is null', () => {
    const result = transformRepo({ ...mockRepo, language: null }, 0)
    expect(result.tags).not.toContain('TypeScript')
    expect(result.tags[0]).toBe('typescript')
  })
})
