# Nouvelles Sources Streamline — Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter GitHub Releases et Hacker News comme nouvelles sources dans Streamline, avec filtres par source et tag, pages de détail dédiées, et logos dynamiques via `simple-icons`.

**Architecture:** Extension directe des patterns existants (Approach A) — un fichier `lib/` par source, hooks dédiés pour les filtres et les repos surveillés, composant `FilterPanel`, mise à jour de `TechCard` / `DashboardClient` / `page.tsx`. Vitest 4 est configuré en Task 1 (non présent dans le projet actuel).

**Tech Stack:** Next.js 16 App Router, TypeScript 5 strict, Tailwind CSS 4, Vitest 4, `simple-icons` npm, Hacker News Algolia API (sans auth), GitHub REST API (GITHUB_TOKEN côté serveur uniquement)

---

## Structure des fichiers

```
packages/app/
├── vitest.config.ts                              ← CRÉER (Task 1)
├── src/
│   ├── types/index.ts                            ← MODIFIER source: +github-release +hackernews (Task 2)
│   ├── lib/
│   │   ├── icons.ts                              ← CRÉER (Task 3)
│   │   ├── icons.test.ts                         ← CRÉER (Task 3)
│   │   ├── github-releases.ts                    ← CRÉER (Task 4)
│   │   ├── github-releases.test.ts               ← CRÉER (Task 4)
│   │   ├── hackernews.ts                         ← CRÉER (Task 5)
│   │   └── hackernews.test.ts                    ← CRÉER (Task 5)
│   ├── hooks/
│   │   ├── useFilters.ts                         ← CRÉER (Task 6)
│   │   ├── useFilters.test.ts                    ← CRÉER (Task 6)
│   │   ├── useWatchedRepos.ts                    ← CRÉER (Task 7)
│   │   └── useWatchedRepos.test.ts               ← CRÉER (Task 7)
│   ├── app/
│   │   ├── api/releases/route.ts                 ← CRÉER (Task 8)
│   │   ├── release/[...slug]/page.tsx            ← CRÉER (Task 9)
│   │   ├── hn/[id]/page.tsx                      ← CRÉER (Task 10)
│   │   └── page.tsx                              ← MODIFIER (Task 14)
│   └── components/
│       ├── FilterPanel.tsx                       ← CRÉER (Task 11)
│       ├── TechCard.tsx                          ← MODIFIER (Task 12)
│       └── DashboardClient.tsx                   ← MODIFIER (Task 13)
└── package.json                                  ← MODIFIER scripts (Task 1)
```

---

### Task 1: Setup Vitest

**Files:**
- Create: `packages/app/vitest.config.ts`
- Modify: `packages/app/package.json`

- [ ] **Step 1: Installer les dépendances de test**

Depuis `C:\Stage\streamline` :

```bash
pnpm --filter @zelian/app add -D vitest@^4.0.0 @vitejs/plugin-react @testing-library/react happy-dom
```

Expected: packages installed, no errors.

- [ ] **Step 2: Créer `packages/app/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Ajouter le script `test` dans `packages/app/package.json`**

Contenu actuel du bloc `scripts` :
```json
"scripts": {
  "dev": "next dev --turbopack --port 3000",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test"
}
```

Contenu cible :
```json
"scripts": {
  "dev": "next dev --turbopack --port 3000",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Vérifier que Vitest tourne (aucun test pour l'instant = OK)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test
```

Expected: `No test files found` ou exit 0 (pas d'erreur de config).

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/vitest.config.ts packages/app/package.json pnpm-lock.yaml && git commit -m "chore(test): setup Vitest 4 + happy-dom pour les tests unitaires"
```

---

### Task 2: Étendre TechItem.source + installer simple-icons

**Files:**
- Modify: `packages/app/src/types/index.ts`

- [ ] **Step 1: Installer simple-icons**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app add simple-icons
```

Expected: `simple-icons` ajouté dans `dependencies`.

- [ ] **Step 2: Modifier `packages/app/src/types/index.ts`**

Contenu cible complet :

```typescript
export type TechItem = {
  id: string
  source: 'github' | 'devto' | 'github-release' | 'hackernews'
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
```

- [ ] **Step 3: Vérifier le typecheck (des erreurs sont attendues sur TechCard.tsx et DashboardClient.tsx — elles seront corrigées dans les tâches suivantes)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | head -20
```

Expected: erreurs sur les fichiers existants à cause de la comparaison `item.source === 'github'` — c'est normal, les tâches 12 et 13 les corrigeront.

- [ ] **Step 4: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/types/index.ts packages/app/package.json pnpm-lock.yaml && git commit -m "feat(types): étendre TechItem.source pour github-release et hackernews"
```

---

### Task 3: lib/icons.ts (TDD)

**Files:**
- Create: `packages/app/src/lib/icons.test.ts`
- Create: `packages/app/src/lib/icons.ts`

- [ ] **Step 1: Écrire le test en premier (RED)**

Créer `packages/app/src/lib/icons.test.ts` :

```typescript
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
```

- [ ] **Step 2: Vérifier que le test échoue (module inexistant)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -10
```

Expected: FAIL — cannot find module `./icons`.

- [ ] **Step 3: Implémenter `packages/app/src/lib/icons.ts`**

```typescript
import {
  siPython,
  siJavascript,
  siTypescript,
  siReact,
  siNodedotjs,
  siGo,
  siRust,
  siDocker,
  siKubernetes,
  siDjango,
  siFastapi,
  siVuedotjs,
  siAngular,
  siNextdotjs,
  siGit,
  siGithub,
  siLinux,
  siAmazonwebservices,
  siGooglecloud,
  siMicrosoftazure,
  siOpenai,
  siAnthropic,
  siGoogle,
  siMeta,
  siMicrosoft,
  siPostgresql,
  siMongodb,
  siRedis,
  siGraphql,
  siTailwindcss,
} from 'simple-icons'
import type { TechItem } from '@/types'

type IconEntry = { svg: string; hex: string }

const ICON_REGISTRY: Record<string, IconEntry> = {
  python: { svg: siPython.svg, hex: siPython.hex },
  javascript: { svg: siJavascript.svg, hex: siJavascript.hex },
  typescript: { svg: siTypescript.svg, hex: siTypescript.hex },
  react: { svg: siReact.svg, hex: siReact.hex },
  nodejs: { svg: siNodedotjs.svg, hex: siNodedotjs.hex },
  go: { svg: siGo.svg, hex: siGo.hex },
  rust: { svg: siRust.svg, hex: siRust.hex },
  docker: { svg: siDocker.svg, hex: siDocker.hex },
  kubernetes: { svg: siKubernetes.svg, hex: siKubernetes.hex },
  django: { svg: siDjango.svg, hex: siDjango.hex },
  fastapi: { svg: siFastapi.svg, hex: siFastapi.hex },
  vue: { svg: siVuedotjs.svg, hex: siVuedotjs.hex },
  angular: { svg: siAngular.svg, hex: siAngular.hex },
  nextjs: { svg: siNextdotjs.svg, hex: siNextdotjs.hex },
  git: { svg: siGit.svg, hex: siGit.hex },
  github: { svg: siGithub.svg, hex: siGithub.hex },
  linux: { svg: siLinux.svg, hex: siLinux.hex },
  aws: { svg: siAmazonwebservices.svg, hex: siAmazonwebservices.hex },
  gcp: { svg: siGooglecloud.svg, hex: siGooglecloud.hex },
  azure: { svg: siMicrosoftazure.svg, hex: siMicrosoftazure.hex },
  openai: { svg: siOpenai.svg, hex: siOpenai.hex },
  anthropic: { svg: siAnthropic.svg, hex: siAnthropic.hex },
  google: { svg: siGoogle.svg, hex: siGoogle.hex },
  meta: { svg: siMeta.svg, hex: siMeta.hex },
  microsoft: { svg: siMicrosoft.svg, hex: siMicrosoft.hex },
  postgresql: { svg: siPostgresql.svg, hex: siPostgresql.hex },
  mongodb: { svg: siMongodb.svg, hex: siMongodb.hex },
  redis: { svg: siRedis.svg, hex: siRedis.hex },
  graphql: { svg: siGraphql.svg, hex: siGraphql.hex },
  tailwindcss: { svg: siTailwindcss.svg, hex: siTailwindcss.hex },
}

const TECH_ICON_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  react: 'react',
  reactjs: 'react',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  node: 'nodejs',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  django: 'django',
  fastapi: 'fastapi',
  vue: 'vue',
  vuejs: 'vue',
  angular: 'angular',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  git: 'git',
  github: 'github',
  linux: 'linux',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  redis: 'redis',
  graphql: 'graphql',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
}

const AI_KEYWORD_MAP: Record<string, string> = {
  chatgpt: 'openai',
  openai: 'openai',
  'gpt-4': 'openai',
  'gpt-3': 'openai',
  claude: 'anthropic',
  anthropic: 'anthropic',
  gemini: 'google',
  copilot: 'microsoft',
  llama: 'meta',
}

export function getIconSlug(item: TechItem): string | null {
  const titleLower = item.title.toLowerCase()
  for (const [keyword, slug] of Object.entries(AI_KEYWORD_MAP)) {
    if (titleLower.includes(keyword)) return slug
  }
  for (const tag of item.tags) {
    const slug = TECH_ICON_MAP[tag.toLowerCase()]
    if (slug) return slug
  }
  return null
}

export function getIconData(slug: string): IconEntry | null {
  return ICON_REGISTRY[slug] ?? null
}
```

- [ ] **Step 4: Vérifier que les tests passent (GREEN)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -15
```

Expected: `9 tests passed`.

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/lib/icons.ts packages/app/src/lib/icons.test.ts && git commit -m "feat(icons): getIconSlug + getIconData via simple-icons avec tests"
```

---

### Task 4: lib/github-releases.ts (TDD)

**Files:**
- Create: `packages/app/src/lib/github-releases.test.ts`
- Create: `packages/app/src/lib/github-releases.ts`

- [ ] **Step 1: Écrire le test en premier (RED)**

Créer `packages/app/src/lib/github-releases.test.ts` :

```typescript
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
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -10
```

Expected: FAIL — cannot find module `./github-releases`.

- [ ] **Step 3: Implémenter `packages/app/src/lib/github-releases.ts`**

```typescript
import type { TechItem } from '@/types'

export type GitHubReleaseRaw = {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
}

export type GitHubRepoMetaRaw = {
  stargazers_count: number
  language: string | null
  topics: string[]
}

export const DEFAULT_WATCHED_REPOS = [
  'python/cpython',
  'nodejs/node',
  'microsoft/TypeScript',
  'facebook/react',
  'vercel/next.js',
  'vuejs/core',
  'golang/go',
  'rust-lang/rust',
  'django/django',
  'tiangolo/fastapi',
  'microsoft/vscode',
  'kubernetes/kubernetes',
]

export function transformRelease(
  release: GitHubReleaseRaw,
  repo: string,
  repoMeta: GitHubRepoMetaRaw
): TechItem {
  const repoName = repo.split('/')[1] ?? repo
  const repoNameParts = repoName.split(/[-_]/).filter(Boolean)
  const coverInitials =
    repoNameParts
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'GR'

  const tags: string[] = []
  if (repoMeta.language) tags.push(repoMeta.language)
  repoMeta.topics.slice(0, 3).forEach(t => tags.push(t))

  return {
    id: `gr-${release.id}`,
    source: 'github-release',
    title: `${repo} ${release.tag_name}`,
    description: release.name ?? release.tag_name,
    url: release.html_url,
    tags,
    stars: repoMeta.stargazers_count,
    readTime: 0,
    publishedAt: release.published_at,
    coverInitials,
  }
}

async function fetchRepoReleases(
  repo: string,
  headers: HeadersInit
): Promise<TechItem[]> {
  try {
    const [releasesRes, metaRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/releases?per_page=3`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/repos/${repo}`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ])
    if (!releasesRes.ok || !metaRes.ok) return []
    const releases: GitHubReleaseRaw[] = await releasesRes.json()
    const meta: GitHubRepoMetaRaw = await metaRes.json()
    return releases
      .filter(r => !r.prerelease)
      .map(r => transformRelease(r, repo, meta))
  } catch {
    return []
  }
}

export async function fetchGitHubReleases(
  repos: string[] = DEFAULT_WATCHED_REPOS
): Promise<TechItem[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const results = await Promise.all(repos.map(r => fetchRepoReleases(r, headers)))
    return results.flat()
  } catch (err) {
    console.error('fetchGitHubReleases failed:', err)
    return []
  }
}
```

- [ ] **Step 4: Vérifier que les tests passent (GREEN)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -15
```

Expected: `~18 tests passed` (9 icons + 9 releases).

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/lib/github-releases.ts packages/app/src/lib/github-releases.test.ts && git commit -m "feat(github-releases): transformRelease + fetchGitHubReleases avec tests TDD"
```

---

### Task 5: lib/hackernews.ts (TDD)

**Files:**
- Create: `packages/app/src/lib/hackernews.test.ts`
- Create: `packages/app/src/lib/hackernews.ts`

- [ ] **Step 1: Écrire le test en premier (RED)**

Créer `packages/app/src/lib/hackernews.test.ts` :

```typescript
import { describe, it, expect } from 'vitest'
import { transformHit } from './hackernews'

const MOCK_HIT = {
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

const MOCK_HIT_WITH_TEXT = {
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

  it('should set readTime to 0', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.readTime).toBe(0)
  })

  it('should generate coverInitials from first 3 title words', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.coverInitials).toBe('P3R')
  })

  it('should set description from story_text when url is null', () => {
    const item = transformHit(MOCK_HIT_WITH_TEXT)
    expect(item.description).toContain('Looking for resources')
  })

  it('should set description as fallback when no story_text', () => {
    const item = transformHit(MOCK_HIT)
    expect(item.description).toContain('testuser')
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -10
```

Expected: FAIL — cannot find module `./hackernews`.

- [ ] **Step 3: Implémenter `packages/app/src/lib/hackernews.ts`**

```typescript
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
```

- [ ] **Step 4: Vérifier que les tests passent (GREEN)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -15
```

Expected: `~26 tests passed`.

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/lib/hackernews.ts packages/app/src/lib/hackernews.test.ts && git commit -m "feat(hackernews): transformHit + fetchHackerNews via Algolia avec tests TDD"
```

---

### Task 6: hooks/useFilters.ts (TDD)

**Files:**
- Create: `packages/app/src/hooks/useFilters.test.ts`
- Create: `packages/app/src/hooks/useFilters.ts`

- [ ] **Step 1: Écrire le test en premier (RED)**

Créer `packages/app/src/hooks/useFilters.test.ts` :

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilters } from './useFilters'

describe('useFilters', () => {
  it('should start with all sources enabled', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.sources.github).toBe(true)
    expect(result.current.filters.sources.devto).toBe(true)
    expect(result.current.filters.sources['github-release']).toBe(true)
    expect(result.current.filters.sources.hackernews).toBe(true)
  })

  it('should start with no active tags', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.activeTags).toEqual([])
  })

  it('should start with no custom tags', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.customTags).toEqual([])
  })

  it('should disable a source when toggleSource called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleSource('github') })
    expect(result.current.filters.sources.github).toBe(false)
  })

  it('should re-enable a source on second toggleSource call', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleSource('github') })
    act(() => { result.current.toggleSource('github') })
    expect(result.current.filters.sources.github).toBe(true)
  })

  it('should activate a tag when toggleTag called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleTag('Python') })
    expect(result.current.filters.activeTags).toContain('Python')
  })

  it('should deactivate an active tag on second toggleTag call', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.toggleTag('Python') })
    act(() => { result.current.toggleTag('Python') })
    expect(result.current.filters.activeTags).not.toContain('Python')
  })

  it('should add a tag to customTags when addCustomTag called', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    expect(result.current.filters.customTags).toContain('Kotlin')
  })

  it('should trim whitespace in addCustomTag', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('  Kotlin  ') })
    expect(result.current.filters.customTags).toContain('Kotlin')
  })

  it('should ignore duplicate custom tags', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    act(() => { result.current.addCustomTag('Kotlin') })
    expect(result.current.filters.customTags.filter(t => t === 'Kotlin').length).toBe(1)
  })

  it('should remove tag from customTags and activeTags on removeCustomTag', () => {
    const { result } = renderHook(() => useFilters())
    act(() => { result.current.addCustomTag('Kotlin') })
    act(() => { result.current.toggleTag('Kotlin') })
    act(() => { result.current.removeCustomTag('Kotlin') })
    expect(result.current.filters.customTags).not.toContain('Kotlin')
    expect(result.current.filters.activeTags).not.toContain('Kotlin')
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -10
```

Expected: FAIL — cannot find module `./useFilters`.

- [ ] **Step 3: Implémenter `packages/app/src/hooks/useFilters.ts`**

```typescript
'use client'

import { useState } from 'react'

export const PREDEFINED_TAGS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Rust',
  'DevOps',
  'IA/ML',
  'Agile',
  'Security',
  'Open Source',
]

export type SourceFilters = {
  github: boolean
  devto: boolean
  'github-release': boolean
  hackernews: boolean
}

export type Filters = {
  sources: SourceFilters
  activeTags: string[]
  customTags: string[]
}

const DEFAULT_FILTERS: Filters = {
  sources: {
    github: true,
    devto: true,
    'github-release': true,
    hackernews: true,
  },
  activeTags: [],
  customTags: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  function toggleSource(source: keyof SourceFilters) {
    setFilters(prev => ({
      ...prev,
      sources: { ...prev.sources, [source]: !prev.sources[source] },
    }))
  }

  function toggleTag(tag: string) {
    setFilters(prev => {
      const exists = prev.activeTags.includes(tag)
      return {
        ...prev,
        activeTags: exists
          ? prev.activeTags.filter(t => t !== tag)
          : [...prev.activeTags, tag],
      }
    })
  }

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    setFilters(prev => {
      if (prev.customTags.includes(trimmed)) return prev
      return { ...prev, customTags: [...prev.customTags, trimmed] }
    })
  }

  function removeCustomTag(tag: string) {
    setFilters(prev => ({
      ...prev,
      customTags: prev.customTags.filter(t => t !== tag),
      activeTags: prev.activeTags.filter(t => t !== tag),
    }))
  }

  return { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag }
}
```

- [ ] **Step 4: Vérifier que les tests passent (GREEN)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -15
```

Expected: `~37 tests passed`.

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/hooks/useFilters.ts packages/app/src/hooks/useFilters.test.ts && git commit -m "feat(filters): hook useFilters avec source toggles + tag activations — tests TDD"
```

---

### Task 7: hooks/useWatchedRepos.ts (TDD)

**Files:**
- Create: `packages/app/src/hooks/useWatchedRepos.test.ts`
- Create: `packages/app/src/hooks/useWatchedRepos.ts`

- [ ] **Step 1: Écrire le test en premier (RED)**

Créer `packages/app/src/hooks/useWatchedRepos.test.ts` :

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWatchedRepos } from './useWatchedRepos'

beforeEach(() => {
  localStorage.clear()
})

describe('useWatchedRepos', () => {
  it('should start with empty custom repos', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.customRepos).toEqual([])
  })

  it('should validate format owner/repo as true', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.isValidRepo('facebook/react')).toBe(true)
    expect(result.current.isValidRepo('owner-name/repo.name')).toBe(true)
  })

  it('should reject invalid formats', () => {
    const { result } = renderHook(() => useWatchedRepos())
    expect(result.current.isValidRepo('notarepo')).toBe(false)
    expect(result.current.isValidRepo('')).toBe(false)
    expect(result.current.isValidRepo('has spaces/repo')).toBe(false)
    expect(result.current.isValidRepo('/noslug')).toBe(false)
  })

  it('should add a valid repo and return true', () => {
    const { result } = renderHook(() => useWatchedRepos())
    let returnValue = false
    act(() => { returnValue = result.current.addRepo('facebook/react') })
    expect(returnValue).toBe(true)
    expect(result.current.customRepos).toContain('facebook/react')
  })

  it('should reject invalid repo and return false', () => {
    const { result } = renderHook(() => useWatchedRepos())
    let returnValue = true
    act(() => { returnValue = result.current.addRepo('invalid') })
    expect(returnValue).toBe(false)
    expect(result.current.customRepos).toEqual([])
  })

  it('should ignore duplicate repos', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    act(() => { result.current.addRepo('facebook/react') })
    expect(result.current.customRepos.filter(r => r === 'facebook/react').length).toBe(1)
  })

  it('should remove a repo', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    act(() => { result.current.removeRepo('facebook/react') })
    expect(result.current.customRepos).not.toContain('facebook/react')
  })

  it('should persist repos to localStorage on add', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    const stored = JSON.parse(localStorage.getItem('streamline_custom_repos') ?? '[]') as string[]
    expect(stored).toContain('facebook/react')
  })

  it('should persist removal to localStorage', () => {
    const { result } = renderHook(() => useWatchedRepos())
    act(() => { result.current.addRepo('facebook/react') })
    act(() => { result.current.removeRepo('facebook/react') })
    const stored = JSON.parse(localStorage.getItem('streamline_custom_repos') ?? '[]') as string[]
    expect(stored).not.toContain('facebook/react')
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -10
```

Expected: FAIL — cannot find module `./useWatchedRepos`.

- [ ] **Step 3: Implémenter `packages/app/src/hooks/useWatchedRepos.ts`**

```typescript
'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'streamline_custom_repos'
const REPO_REGEX = /^[\w.-]+\/[\w.-]+$/

export function useWatchedRepos() {
  const [customRepos, setCustomRepos] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCustomRepos(JSON.parse(stored) as string[])
    } catch {
      // ignore
    }
  }, [])

  function isValidRepo(repo: string): boolean {
    return REPO_REGEX.test(repo.trim())
  }

  function addRepo(repo: string): boolean {
    const trimmed = repo.trim()
    if (!isValidRepo(trimmed)) return false
    setCustomRepos(prev => {
      if (prev.includes(trimmed)) return prev
      const next = [...prev, trimmed]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    return true
  }

  function removeRepo(repo: string) {
    setCustomRepos(prev => {
      const next = prev.filter(r => r !== repo)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { customRepos, addRepo, removeRepo, isValidRepo }
}
```

- [ ] **Step 4: Vérifier que les tests passent (GREEN)**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -15
```

Expected: `~46 tests passed`.

- [ ] **Step 5: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/hooks/useWatchedRepos.ts packages/app/src/hooks/useWatchedRepos.test.ts && git commit -m "feat(repos): hook useWatchedRepos avec validation + persistance localStorage — tests TDD"
```

---

### Task 8: Route Handler GET /api/releases

**Files:**
- Create: `packages/app/src/app/api/releases/route.ts`

- [ ] **Step 1: Créer le répertoire et le fichier route**

Créer `packages/app/src/app/api/releases/route.ts` :

```typescript
import { NextResponse } from 'next/server'
import { fetchGitHubReleases } from '@/lib/github-releases'

const REPO_REGEX = /^[\w.-]+\/[\w.-]+$/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reposParam = searchParams.get('repos')

  if (!reposParam) {
    return NextResponse.json({ error: 'repos parameter required' }, { status: 400 })
  }

  const repos = reposParam
    .split(',')
    .map(r => r.trim())
    .filter(r => REPO_REGEX.test(r))
    .slice(0, 20) // limite de sécurité

  if (repos.length === 0) {
    return NextResponse.json([])
  }

  const items = await fetchGitHubReleases(repos)
  return NextResponse.json(items)
}
```

- [ ] **Step 2: Vérifier que le typecheck passe sur ce fichier**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "api/releases"
```

Expected: aucune erreur sur `api/releases/route.ts`.

- [ ] **Step 3: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/app/api/releases/route.ts && git commit -m "feat(api): Route Handler GET /api/releases pour repos custom"
```

---

### Task 9: Page /release/[...slug]/page.tsx

**Files:**
- Create: `packages/app/src/app/release/[...slug]/page.tsx`

- [ ] **Step 1: Créer le répertoire et la page**

Créer `packages/app/src/app/release/[...slug]/page.tsx` :

```typescript
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react'
import { marked } from 'marked'

type GitHubReleaseDetail = {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
  author: {
    login: string
    avatar_url: string
  }
}

async function fetchRelease(
  owner: string,
  repo: string,
  releaseId: string
): Promise<GitHubReleaseDetail | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return res.json() as Promise<GitHubReleaseDetail>
  } catch {
    return null
  }
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const [owner, repo, releaseId] = slug

  if (!owner || !repo || !releaseId) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Release introuvable.</p>
      </div>
    )
  }

  const fullName = `${owner}/${repo}`
  const release = await fetchRelease(owner, repo, releaseId)

  if (!release) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Release introuvable ou erreur GitHub API.</p>
      </div>
    )
  }

  const bodyHtml = release.body ? String(await marked(release.body)) : null

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto p-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">{fullName}</p>
              <h1 className="text-2xl font-bold text-zinc-900">
                {release.name ?? release.tag_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Tag size={12} className="text-zinc-400" />
                <span className="text-sm text-green-700 font-mono">
                  {release.tag_name}
                </span>
                {release.prerelease && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Pre-release
                  </span>
                )}
              </div>
            </div>
            <a
              href={release.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0"
            >
              <ExternalLink size={14} /> GitHub
            </a>
          </div>

          <p className="text-xs text-zinc-400 mb-6">
            Publié le{' '}
            {new Date(release.published_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            par {release.author.login}
          </p>

          {bodyHtml ? (
            <div
              className="text-sm text-zinc-700 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-indigo-600 [&_a]:underline [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="text-zinc-400 italic text-sm">
              Aucune description pour cette release.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le typecheck**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "release"
```

Expected: aucune erreur sur le fichier release.

- [ ] **Step 3: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/app/release && git commit -m "feat(page): détail release GitHub avec notes de version Markdown"
```

---

### Task 10: Page /hn/[id]/page.tsx

**Files:**
- Create: `packages/app/src/app/hn/[id]/page.tsx`

- [ ] **Step 1: Créer le répertoire et la page**

Créer `packages/app/src/app/hn/[id]/page.tsx` :

```typescript
import Link from 'next/link'
import { ArrowLeft, ExternalLink, MessageSquare, Star } from 'lucide-react'

type HNItemDetail = {
  objectID: string
  title: string
  url: string | null
  story_text: string | null
  author: string
  points: number
  created_at: string
  num_comments: number
}

async function fetchHNItem(id: string): Promise<HNItemDetail | null> {
  try {
    const res = await fetch(`https://hn.algolia.com/api/v1/items/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json() as Promise<HNItemDetail>
  } catch {
    return null
  }
}

export default async function HNItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await fetchHNItem(id)

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-zinc-500">Article introuvable.</p>
      </div>
    )
  }

  const hnDiscussionUrl = `https://news.ycombinator.com/item?id=${id}`

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto p-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
        >
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-orange-500 text-lg font-bold shrink-0">▲</span>
            <h1 className="text-xl font-bold text-zinc-900">{item.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-6">
            <span className="flex items-center gap-1">
              <Star size={11} className="text-amber-500" />
              {item.points} points
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {item.num_comments} commentaires
            </span>
            <span>par {item.author}</span>
            <span>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {item.story_text && (
            <div
              className="text-sm text-zinc-700 mb-6 leading-relaxed [&_p]:mb-2 [&_a]:text-indigo-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: item.story_text }}
            />
          )}

          <div className="flex flex-wrap gap-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ExternalLink size={14} /> Lire l'article
              </a>
            )}
            <a
              href={hnDiscussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors border border-zinc-200"
            >
              <MessageSquare size={14} /> Discussion HN
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le typecheck**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "hn/"
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/app/hn && git commit -m "feat(page): détail article Hacker News avec métadonnées et liens"
```

---

### Task 11: Component FilterPanel.tsx

**Files:**
- Create: `packages/app/src/components/FilterPanel.tsx`

- [ ] **Step 1: Créer `packages/app/src/components/FilterPanel.tsx`**

```typescript
'use client'

import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Filters, SourceFilters } from '@/hooks/useFilters'
import { PREDEFINED_TAGS } from '@/hooks/useFilters'

type Props = {
  filters: Filters
  onToggleSource: (source: keyof SourceFilters) => void
  onToggleTag: (tag: string) => void
  onAddCustomTag: (tag: string) => void
  onRemoveCustomTag: (tag: string) => void
  customRepos: string[]
  onAddRepo: (repo: string) => boolean
  onRemoveRepo: (repo: string) => void
}

const SOURCE_LABELS: Record<keyof SourceFilters, string> = {
  github: '★ GitHub',
  devto: '✍ Dev.to',
  'github-release': '📦 Releases',
  hackernews: '🔶 Hacker News',
}

const SOURCE_ACTIVE_CLASS: Record<keyof SourceFilters, string> = {
  github: 'bg-green-600 text-white border-transparent',
  devto: 'bg-indigo-600 text-white border-transparent',
  'github-release': 'bg-purple-600 text-white border-transparent',
  hackernews: 'bg-orange-500 text-white border-transparent',
}

export function FilterPanel({
  filters,
  onToggleSource,
  onToggleTag,
  onAddCustomTag,
  onRemoveCustomTag,
  customRepos,
  onAddRepo,
  onRemoveRepo,
}: Props) {
  const [newTag, setNewTag] = useState('')
  const [newRepo, setNewRepo] = useState('')
  const [repoError, setRepoError] = useState(false)

  const allTags = [...PREDEFINED_TAGS, ...filters.customTags]

  return (
    <div className="bg-white border-b border-zinc-100 px-3 py-2.5 space-y-2">
      {/* Source toggles */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(SOURCE_LABELS) as Array<keyof SourceFilters>).map(source => (
          <button
            key={source}
            onClick={() => onToggleSource(source)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filters.sources[source]
                ? SOURCE_ACTIVE_CLASS[source]
                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {SOURCE_LABELS[source]}
          </button>
        ))}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {allTags.map(tag => {
          const isCustom = filters.customTags.includes(tag)
          const isActive = filters.activeTags.includes(tag)
          return (
            <div key={tag} className="flex items-center">
              <button
                onClick={() => onToggleTag(tag)}
                className={`text-xs px-2 py-0.5 border transition-colors ${
                  isCustom ? 'rounded-l-full' : 'rounded-full'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:border-indigo-300'
                }`}
              >
                {tag}
              </button>
              {isCustom && (
                <button
                  onClick={() => onRemoveCustomTag(tag)}
                  className={`text-xs px-1 py-0.5 rounded-r-full border-y border-r transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:text-rose-500'
                  }`}
                  title="Supprimer ce tag"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          )
        })}

        {/* Add custom tag */}
        <form
          onSubmit={e => {
            e.preventDefault()
            if (newTag.trim()) {
              onAddCustomTag(newTag)
              setNewTag('')
            }
          }}
          className="flex items-center"
        >
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="+ tag"
            className="text-xs w-16 px-1.5 py-0.5 border border-zinc-200 rounded-l-full focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-zinc-50"
          />
          <button
            type="submit"
            className="text-xs px-1.5 py-0.5 bg-zinc-200 rounded-r-full hover:bg-zinc-300 border border-l-0 border-zinc-200"
            title="Ajouter ce tag"
          >
            <Plus size={8} />
          </button>
        </form>
      </div>

      {/* Custom repos */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {customRepos.map(repo => (
          <span
            key={repo}
            className="flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200"
          >
            {repo}
            <button
              onClick={() => onRemoveRepo(repo)}
              className="text-zinc-400 hover:text-rose-500 ml-0.5"
              title="Supprimer ce repo"
            >
              <X size={8} />
            </button>
          </span>
        ))}

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!newRepo.trim()) return
            const ok = onAddRepo(newRepo)
            if (ok) {
              setNewRepo('')
              setRepoError(false)
            } else {
              setRepoError(true)
            }
          }}
          className="flex items-center gap-1"
        >
          <input
            value={newRepo}
            onChange={e => {
              setNewRepo(e.target.value)
              setRepoError(false)
            }}
            placeholder="owner/repo"
            className={`text-xs w-28 px-1.5 py-0.5 border rounded-full focus:outline-none focus:ring-1 bg-zinc-50 ${
              repoError
                ? 'border-rose-300 focus:ring-rose-300'
                : 'border-zinc-200 focus:ring-indigo-300'
            }`}
          />
          <button
            type="submit"
            className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200 hover:bg-green-200"
            title="Ajouter ce repo"
          >
            <Plus size={8} />
          </button>
        </form>

        {repoError && (
          <span className="text-xs text-rose-500">Format attendu : owner/repo</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le typecheck sur FilterPanel**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "FilterPanel"
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/components/FilterPanel.tsx && git commit -m "feat(ui): composant FilterPanel — source toggles + tag chips + gestion repos custom"
```

---

### Task 12: Mettre à jour TechCard.tsx

**Files:**
- Modify: `packages/app/src/components/TechCard.tsx`

- [ ] **Step 1: Réécrire `packages/app/src/components/TechCard.tsx`**

Contenu complet (remplace tout le fichier) :

```typescript
'use client'

import { Bookmark, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { TechItem } from '@/types'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { formatRelativeDate, formatStars } from '@/lib/utils'
import { getIconSlug, getIconData } from '@/lib/icons'

type Props = { item: TechItem }

const SOURCE_BADGE: Record<
  TechItem['source'],
  { label: string; bg: string; textColor: string; borderColor: string }
> = {
  github: {
    label: '★ GitHub',
    bg: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  devto: {
    label: '✍ Dev.to',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  'github-release': {
    label: '📦 Release',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  hackernews: {
    label: '🔶 HN',
    bg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
}

function getDetailPath(item: TechItem): string {
  if (item.source === 'github') {
    return `/repo/${item.id.replace(/^gh-/, '')}`
  }
  if (item.source === 'devto') {
    return `/article/${item.id.replace(/^dt-/, '')}`
  }
  if (item.source === 'github-release') {
    const releaseId = item.id.replace(/^gr-/, '')
    // title = 'owner/repo v1.2.3' — extraire owner/repo (avant le dernier espace)
    const spaceIdx = item.title.lastIndexOf(' ')
    const fullName = item.title.slice(0, spaceIdx)
    return `/release/${fullName}/${releaseId}`
  }
  // hackernews
  return `/hn/${item.id.replace(/^hn-/, '')}`
}

export function TechCard({ item }: Props) {
  const { isInReadLater, addToReadLater, removeFromReadLater } = useReadLater()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [pngError, setPngError] = useState(false)

  const inReadLater = isInReadLater(item.id)
  const inFavorites = isFavorite(item.id)
  const detailPath = getDetailPath(item)
  const badge = SOURCE_BADGE[item.source]
  const iconSlug = getIconSlug(item)
  const iconData = iconSlug ? getIconData(iconSlug) : null
  const pngSrc = iconSlug ? `/logos/${iconSlug}.png` : null
  const useOwnerAvatar =
    (item.source === 'github' || item.source === 'github-release') &&
    !!item.ownerAvatar

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
      {/* Cover */}
      <div
        className={`relative h-20 flex items-center justify-center border-b border-zinc-100 ${badge.bg}`}
      >
        {/* Badge source */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${badge.textColor} ${badge.borderColor}`}
        >
          {badge.label}
        </span>

        {/* Logo : PNG override → SVG simple-icons → ownerAvatar → coverInitials */}
        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 shadow flex items-center justify-center overflow-hidden">
          {pngSrc && !pngError ? (
            <Image
              src={pngSrc}
              alt={iconSlug ?? item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
              onError={() => setPngError(true)}
            />
          ) : iconData ? (
            <div
              dangerouslySetInnerHTML={{ __html: iconData.svg }}
              style={{ color: `#${iconData.hex}`, width: 24, height: 24 }}
            />
          ) : useOwnerAvatar ? (
            <Image
              src={item.ownerAvatar!}
              alt={item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <span className={`text-xs font-bold ${badge.textColor}`}>
              {item.coverInitials}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() =>
              inReadLater ? removeFromReadLater(item.id) : addToReadLater(item)
            }
            className={`w-7 h-7 rounded-md flex items-center justify-center border shadow-sm transition-colors ${
              inReadLater
                ? 'bg-amber-400 border-amber-400 text-white'
                : 'bg-white border-zinc-200 text-zinc-400 hover:text-amber-500'
            }`}
            title={inReadLater ? 'Retirer de À lire' : 'Lire plus tard'}
          >
            <Bookmark size={12} fill={inReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() =>
              inFavorites ? removeFavorite(item.id) : addFavorite(item)
            }
            className={`w-7 h-7 rounded-md flex items-center justify-center border shadow-sm transition-colors ${
              inFavorites
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-zinc-200 text-zinc-400 hover:text-rose-500'
            }`}
            title={inFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star size={12} fill={inFavorites ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="p-3 flex-1">
        <Link
          href={detailPath}
          className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 line-clamp-2 leading-tight block"
        >
          {item.title}
        </Link>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-zinc-50">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            {formatRelativeDate(item.publishedAt)}
          </span>
          <div className="flex items-center gap-2">
            {item.stars > 0 && (
              <span className="text-[10px] text-amber-600">
                ★ {formatStars(item.stars)}
              </span>
            )}
            {item.readTime > 0 && (
              <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                <Clock size={9} />
                {item.readTime} min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le typecheck**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "TechCard"
```

Expected: aucune erreur sur TechCard.tsx.

- [ ] **Step 3: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/components/TechCard.tsx && git commit -m "feat(ui): TechCard — 4 badges sources, routing dynamique, logos simple-icons avec PNG override"
```

---

### Task 13: Mettre à jour DashboardClient.tsx

**Files:**
- Modify: `packages/app/src/components/DashboardClient.tsx`

- [ ] **Step 1: Réécrire `packages/app/src/components/DashboardClient.tsx`**

Contenu complet (remplace tout le fichier) :

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { TechItem } from '@/types'
import { TechCard } from './TechCard'
import { FilterPanel } from './FilterPanel'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { useFilters } from '@/hooks/useFilters'
import { useWatchedRepos } from '@/hooks/useWatchedRepos'

type Tab = 'news' | 'github' | 'all' | 'readlater' | 'favorites'

type Props = { items: TechItem[] }

export function DashboardClient({ items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('news')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TechItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [customReleases, setCustomReleases] = useState<TechItem[]>([])

  const { readLaterItems } = useReadLater()
  const { favorites } = useFavorites()
  const { filters, toggleSource, toggleTag, addCustomTag, removeCustomTag } = useFilters()
  const { customRepos, addRepo, removeRepo } = useWatchedRepos()

  // Charger les releases des repos custom côté client
  useEffect(() => {
    if (customRepos.length === 0) {
      setCustomReleases([])
      return
    }
    const reposParam = customRepos.join(',')
    fetch(`/api/releases?repos=${encodeURIComponent(reposParam)}`)
      .then(r => r.json() as Promise<TechItem[]>)
      .then(data => setCustomReleases(data))
      .catch(() => setCustomReleases([]))
  }, [customRepos])

  const allItems = [...items, ...customReleases]

  // 1. Filtrer par source (toggles)
  const filteredBySource = allItems.filter(item => filters.sources[item.source])

  // 2. Filtrer par tag actif (OR logique, case-insensitive)
  const filteredByTag = filteredBySource.filter(item => {
    if (filters.activeTags.length === 0) return true
    return filters.activeTags.some(activeTag =>
      item.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase())
    )
  })

  // 3. Filtrer par onglet
  const baseItems: TechItem[] = (() => {
    if (activeTab === 'news') {
      return filteredByTag.filter(
        i => i.source === 'devto' || i.source === 'hackernews'
      )
    }
    if (activeTab === 'github') {
      return filteredByTag.filter(
        i => i.source === 'github' || i.source === 'github-release'
      )
    }
    if (activeTab === 'readlater') return readLaterItems
    if (activeTab === 'favorites') return favorites
    return filteredByTag
  })()

  // 4. Filtrer par recherche locale
  const displayItems =
    searchResults ??
    baseItems.filter(item => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      )
    })

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !query.trim()) return
    setSearching(true)
    setSearchError(false)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('search failed')
      const data: TechItem[] = await res.json()
      setSearchResults(data)
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setSearchResults(null)
      setSearchError(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchResults(null)
    setSearchError(false)
  }

  const tabs: {
    id: Tab
    label: string
    count: number
    activeClass: string
  }[] = [
    {
      id: 'news',
      label: '✍ News',
      count: allItems.filter(i => i.source === 'devto' || i.source === 'hackernews')
        .length,
      activeClass: 'bg-indigo-600 text-white',
    },
    {
      id: 'github',
      label: '★ GitHub',
      count: allItems.filter(
        i => i.source === 'github' || i.source === 'github-release'
      ).length,
      activeClass: 'bg-green-600 text-white',
    },
    {
      id: 'all',
      label: '⊞ Tout',
      count: allItems.length,
      activeClass: 'bg-zinc-600 text-white',
    },
    {
      id: 'readlater',
      label: '🔖 À lire',
      count: readLaterItems.length,
      activeClass: 'bg-amber-500 text-white',
    },
    {
      id: 'favorites',
      label: '⭐ Favoris',
      count: favorites.length,
      activeClass: 'bg-rose-500 text-white',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-extrabold text-indigo-600 shrink-0">
          ⚡ Streamline
        </span>
        <input
          type="search"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher… (Entrée = recherche étendue)"
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-0"
        />
        {searching && (
          <span className="text-xs text-zinc-400 shrink-0">Recherche…</span>
        )}
      </header>

      {/* Onglets */}
      <div className="bg-white border-b border-zinc-100 px-3 py-2 flex gap-1.5 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              clearSearch()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? tab.activeClass
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-white/30 text-current'
                  : 'bg-zinc-200 text-zinc-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <FilterPanel
        filters={filters}
        onToggleSource={toggleSource}
        onToggleTag={toggleTag}
        onAddCustomTag={addCustomTag}
        onRemoveCustomTag={removeCustomTag}
        customRepos={customRepos}
        onAddRepo={addRepo}
        onRemoveRepo={removeRepo}
      />

      {/* Contenu */}
      <main className="p-3">
        {searchError && (
          <div className="mb-3 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2">
            Recherche indisponible — les résultats locaux sont affichés
          </div>
        )}

        {allItems.length === 0 &&
          activeTab !== 'readlater' &&
          activeTab !== 'favorites' && (
            <div className="text-center py-16 text-zinc-400">
              <p className="text-sm">
                Impossible de charger les articles. Réessaie dans quelques
                minutes.
              </p>
            </div>
          )}

        {displayItems.length === 0 &&
        (activeTab === 'readlater' || activeTab === 'favorites') ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-2xl mb-2">
              {activeTab === 'readlater' ? '🔖' : '⭐'}
            </p>
            <p className="text-sm">
              {activeTab === 'readlater'
                ? 'Aucun article à lire — clique sur 🔖 dans une carte pour sauvegarder'
                : 'Aucun favori — clique sur ⭐ dans une carte pour ajouter aux favoris'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayItems.map(item => (
              <TechCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {searchResults !== null && (
          <div className="mt-4 text-center">
            <button
              onClick={clearSearch}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline"
            >
              ← Retour aux articles récents
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier le typecheck**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1 | grep "DashboardClient"
```

Expected: aucune erreur sur DashboardClient.tsx.

- [ ] **Step 3: Vérifier que tous les tests passent toujours**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -5
```

Expected: tous les tests passent.

- [ ] **Step 4: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/components/DashboardClient.tsx && git commit -m "feat(ui): DashboardClient — 4 onglets, filtres source+tag, releases custom async"
```

---

### Task 14: Mettre à jour page.tsx

**Files:**
- Modify: `packages/app/src/app/page.tsx`

- [ ] **Step 1: Réécrire `packages/app/src/app/page.tsx`**

Contenu complet (remplace tout le fichier) :

```typescript
import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'
import { fetchGitHubReleases, DEFAULT_WATCHED_REPOS } from '@/lib/github-releases'
import { fetchHackerNews } from '@/lib/hackernews'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const [githubItems, devtoItems, releaseItems, hnItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
    fetchGitHubReleases(DEFAULT_WATCHED_REPOS),
    fetchHackerNews(),
  ])

  const items = [...devtoItems, ...hnItems, ...githubItems, ...releaseItems]

  return <DashboardClient items={items} />
}
```

- [ ] **Step 2: Vérifier le typecheck complet du projet**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck 2>&1
```

Expected: **aucune erreur TypeScript** sur l'ensemble du projet.

- [ ] **Step 3: Vérifier que tous les tests passent**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test 2>&1 | tail -5
```

Expected: tous les tests passent (pas de régression).

- [ ] **Step 4: Commit**

```bash
cd C:\Stage\streamline && git add packages/app/src/app/page.tsx && git commit -m "feat(page): agrégation 4 sources — GitHub Trending, Dev.to, GitHub Releases, Hacker News"
```

---

### Task 15: Vérification finale

**Files:** aucun fichier modifié — validation uniquement.

- [ ] **Step 1: Typecheck complet**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app typecheck
```

Expected: exit code 0, aucune erreur.

- [ ] **Step 2: Tous les tests passent**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app test
```

Expected: tous les tests passent (minimum 46 tests).

- [ ] **Step 3: Build production**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app build 2>&1 | tail -20
```

Expected: build terminé sans erreur. Si des warnings Next.js apparaissent (ex: image domains), les noter mais ne pas bloquer.

- [ ] **Step 4: Démarrer le dev server et vérifier manuellement**

```bash
cd C:\Stage\streamline && pnpm --filter @zelian/app dev
```

Vérifications manuelles à faire dans le navigateur sur `http://localhost:3000` :

- [ ] L'onglet "✍ News" affiche des articles Dev.to ET des histoires Hacker News
- [ ] L'onglet "★ GitHub" affiche des repos trending ET des releases
- [ ] Les badges de source (★ GitHub, ✍ Dev.to, 📦 Release, 🔶 HN) sont présents et distincts
- [ ] Cliquer sur une carte Dev.to → page `/article/[id]`
- [ ] Cliquer sur une carte GitHub trending → page `/repo/[id]`
- [ ] Cliquer sur une carte GitHub Release → page `/release/owner/repo/id`
- [ ] Cliquer sur une carte Hacker News → page `/hn/[id]`
- [ ] La page HN affiche titre, points, auteur et les boutons "Lire l'article" / "Discussion HN"
- [ ] Le FilterPanel est visible avec les 4 toggles de source
- [ ] Désactiver "🔶 Hacker News" → les cartes HN disparaissent
- [ ] Activer le tag "Python" → seules les cartes avec le tag Python s'affichent
- [ ] Ajouter un tag custom "Kotlin" → le tag apparaît dans le panel
- [ ] Ajouter un repo custom "JetBrains/kotlin" → il apparaît dans le panel et des releases se chargent
- [ ] Les logos (icônes tech) s'affichent sur les cartes quand un langage reconnu est dans les tags

- [ ] **Step 5: Commit final**

```bash
cd C:\Stage\streamline && git add -A && git commit -m "chore: vérification finale — typecheck + tests + build OK"
```

---

## Self-Review

### 1. Couverture de la spec

| Exigence spec | Tâche | Couvert ? |
|---|---|---|
| `source: 'github-release' \| 'hackernews'` dans TechItem | Task 2 | ✅ |
| `lib/github-releases.ts` — transformRelease + fetchGitHubReleases | Task 4 | ✅ |
| DEFAULT_WATCHED_REPOS (12 repos) | Task 4 | ✅ |
| `lib/hackernews.ts` — transformHit + fetchHackerNews | Task 5 | ✅ |
| 6 requêtes Algolia, dedup, max 40 résultats | Task 5 | ✅ |
| `lib/icons.ts` — getIconSlug + getIconData + TECH_ICON_MAP + AI_KEYWORD_MAP | Task 3 | ✅ |
| PNG override `/public/logos/{slug}.png` | Task 12 | ✅ |
| `hooks/useFilters.ts` — toggleSource, toggleTag, addCustomTag, removeCustomTag | Task 6 | ✅ |
| PREDEFINED_TAGS (12 tags) | Task 6 | ✅ |
| `hooks/useWatchedRepos.ts` — addRepo, removeRepo, validation regex | Task 7 | ✅ |
| Route Handler GET `/api/releases` | Task 8 | ✅ |
| Page `/release/[...slug]` (catch-all) | Task 9 | ✅ |
| Page `/hn/[id]` — métadonnées + deux boutons | Task 10 | ✅ |
| `FilterPanel.tsx` — source toggles + tag chips + repos | Task 11 | ✅ |
| TechCard — 4 badges, routing dynamique, logo system | Task 12 | ✅ |
| DashboardClient — onglet news/github, FilterPanel, customReleases | Task 13 | ✅ |
| page.tsx — Promise.all sur 4 sources | Task 14 | ✅ |
| GITHUB_TOKEN côté serveur uniquement (jamais NEXT_PUBLIC_) | Tasks 4, 9 | ✅ |
| url HN = `/hn/{objectID}` (interne, pas externe) | Task 5 | ✅ |

### 2. Scan des placeholders

Aucun "TBD", "TODO" ou "à compléter" dans le plan.

### 3. Cohérence des types

- `TechItem.source` étendu en Task 2 → utilisé partout dans Tasks 3–14
- `getDetailPath` dans Task 12 gère les 4 sources : `gh-` → `/repo/`, `dt-` → `/article/`, `gr-` → `/release/owner/repo/id`, `hn-` → `/hn/id`
- `FilterPanel` reçoit `filters: Filters` et `onToggleSource: (source: keyof SourceFilters) => void` — types définis en Task 6 et réexportés
- `useWatchedRepos.addRepo` retourne `boolean` — utilisé dans FilterPanel Task 11
