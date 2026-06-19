# Streamline MVP — Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire Streamline — un tableau de bord de veille tech qui agrège des repos GitHub trending et des articles Dev.to dans une interface unifiée avec 5 onglets, une barre de recherche, et des pages de détail pour lire le contenu dans l'appli.

**Architecture:** Approche B (APIs d'abord, UI ensuite). Server Components Next.js pour le fetch des données via `Promise.all`, Client Components (`DashboardClient`, `TechCard`) pour l'interactivité. État persistant via `localStorage` pour les bookmarks et favoris. Route Handler `/api/search` pour la recherche étendue sans filtre de date.

**Tech Stack:** Next.js 16 App Router, TypeScript 5 strict, Tailwind CSS 4, lucide-react, marked, Vitest 4, React Testing Library

---

## Fichiers créés / modifiés

| Action | Fichier | Rôle |
|--------|---------|------|
| SUPPRIMER | `packages/app/src/app/api/webhooks/` | Webhook Resend inutilisé |
| SUPPRIMER | `packages/shared/lib/supabase.ts` | Supabase inutilisé |
| SUPPRIMER | `packages/shared/lib/prisma.ts` | Prisma inutilisé |
| SUPPRIMER | `packages/shared/lib/email.ts` | Resend inutilisé |
| SUPPRIMER | `packages/shared/lib/crypto.ts` | Crypto inutilisé |
| SUPPRIMER | `prisma/` (dossier racine) | Schéma Prisma inutilisé |
| MODIFIER | `packages/app/package.json` | Supprimer vieux deps, ajouter Tailwind/lucide/marked/zod v4 |
| MODIFIER | `packages/app/next.config.ts` | Autoriser images GitHub, retirer transpilePackages |
| CRÉER | `packages/app/postcss.config.mjs` | Configuration PostCSS Tailwind CSS 4 |
| CRÉER | `packages/app/src/app/globals.css` | Import Tailwind + styles contenu article |
| MODIFIER | `packages/app/src/app/layout.tsx` | Métadonnées Streamline + import globals.css |
| CRÉER | `packages/app/src/types/index.ts` | Type TechItem |
| CRÉER | `packages/app/src/lib/github.ts` | `fetchGitHub()` + `transformRepo()` + types bruts |
| CRÉER | `packages/app/src/lib/devto.ts` | `fetchDevTo()` + `transformArticle()` + types bruts |
| CRÉER | `packages/app/src/lib/utils.ts` | `formatRelativeDate()`, `formatStars()` |
| MODIFIER | `packages/app/src/app/page.tsx` | Server Component — `Promise.all` + `DashboardClient` |
| CRÉER | `packages/app/src/components/TechCard.tsx` | Carte individuelle avec 🔖 et ⭐ |
| CRÉER | `packages/app/src/components/DashboardClient.tsx` | 5 onglets, barre de recherche, grille |
| CRÉER | `packages/app/src/hooks/useReadLater.ts` | localStorage `streamline_read_later` |
| CRÉER | `packages/app/src/hooks/useFavorites.ts` | localStorage `streamline_favorites` |
| CRÉER | `packages/app/src/app/api/search/route.ts` | `GET /api/search?q=` |
| CRÉER | `packages/app/src/app/article/[id]/page.tsx` | Détail article Dev.to |
| CRÉER | `packages/app/src/app/repo/[id]/page.tsx` | Détail repo GitHub (README rendu) |
| MODIFIER | `vitest.config.ts` | Env jsdom + support .tsx + alias `@` |
| CRÉER | `tests/unit/lib/utils.test.ts` | Tests `formatRelativeDate`, `formatStars` |
| CRÉER | `tests/unit/lib/github.test.ts` | Tests `transformRepo` |
| CRÉER | `tests/unit/lib/devto.test.ts` | Tests `transformArticle` |
| CRÉER | `tests/unit/hooks/useReadLater.test.tsx` | Tests hook useReadLater |
| CRÉER | `tests/unit/hooks/useFavorites.test.tsx` | Tests hook useFavorites |

---

## Task 1: Nettoyage du template

**Fichiers:**
- Supprimer: `packages/app/src/app/api/webhooks/` (dossier entier)
- Supprimer: `packages/shared/lib/supabase.ts`, `prisma.ts`, `email.ts`, `crypto.ts`
- Supprimer: `prisma/` (dossier à la racine)
- Modifier: `packages/app/package.json`
- Modifier: `packages/app/next.config.ts`

- [ ] **Étape 1: Supprimer les fichiers inutilisés**

```powershell
# Depuis C:\Stage\streamline
Remove-Item -Recurse -Force "packages\app\src\app\api\webhooks"
Remove-Item -Force "packages\shared\lib\supabase.ts"
Remove-Item -Force "packages\shared\lib\prisma.ts"
Remove-Item -Force "packages\shared\lib\email.ts"
Remove-Item -Force "packages\shared\lib\crypto.ts"
Remove-Item -Recurse -Force "prisma"
```

- [ ] **Étape 2: Remplacer packages/app/package.json**

```json
{
  "name": "@zelian/app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^4.0.0",
    "lucide-react": "^0.511.0",
    "marked": "^14.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@playwright/test": "^1.58.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

- [ ] **Étape 3: Remplacer packages/app/next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Étape 4: Mettre à jour vitest.config.ts pour les dépendances de test**

Remplacer le contenu de `vitest.config.ts` par :

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "packages/app/src"),
    },
  },
});
```

- [ ] **Étape 5: Installer toutes les dépendances**

```powershell
# Depuis C:\Stage\streamline (racine du monorepo)
pnpm install
pnpm add -D -w @testing-library/react @vitejs/plugin-react jsdom
```

Résultat attendu : pas d'erreur, `node_modules` mis à jour.

- [ ] **Étape 6: Vérifier que Next.js démarre**

```powershell
pnpm --filter @zelian/app dev
```

Ouvrir http://localhost:3000. La page "zelian-starter" doit s'afficher. Ctrl+C pour arrêter.

- [ ] **Étape 7: Commit**

```bash
git add packages/app/package.json packages/app/next.config.ts vitest.config.ts
git commit -m "chore: nettoyage template, dépendances Streamline"
```

---

## Task 2: Variables d'environnement

**Fichiers:**
- Créer: `packages/app/.env.local` (jamais commité)
- Modifier: `packages/app/.env.example`

- [ ] **Étape 1: Créer .env.local**

Créer `packages/app/.env.local` avec tes vraies valeurs :

```bash
# GitHub Personal Access Token (requis)
# Créer sur : https://github.com/settings/tokens/new
# Scope requis : "public_repo" (lecture seule)
GITHUB_TOKEN=ghp_REMPLACE_PAR_TON_VRAI_TOKEN

# Clé API Dev.to (optionnelle — l'API fonctionne sans, mais avec rate limit)
# Créer sur : https://dev.to/settings/extensions
DEVTO_API_KEY=
```

⚠️ Ce fichier est dans `.gitignore`. Il ne sera **jamais** commité.

- [ ] **Étape 2: Mettre à jour .env.example**

Remplacer le contenu de `packages/app/.env.example` par :

```bash
# GitHub Personal Access Token (requis)
# Scope : public_repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Clé API Dev.to (optionnelle)
DEVTO_API_KEY=
```

- [ ] **Étape 3: Commit**

```bash
git add packages/app/.env.example
git commit -m "chore: mise à jour .env.example pour Streamline"
```

---

## Task 3: Type TechItem

**Fichiers:**
- Modifier: `packages/app/src/types/index.ts`

- [ ] **Étape 1: Écrire le type TechItem**

Remplacer le contenu de `packages/app/src/types/index.ts` (actuellement vide / .gitkeep) par :

```typescript
export type TechItem = {
  id: string
  source: 'github' | 'devto'
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

- [ ] **Étape 2: Vérifier TypeScript**

```powershell
pnpm --filter @zelian/app typecheck
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/types/index.ts
git commit -m "feat(types): type TechItem"
```

---

## Task 4: Utilitaires + tests

**Fichiers:**
- Créer: `packages/app/src/lib/utils.ts`
- Créer: `tests/unit/lib/utils.test.ts`

Les fonctions utilitaires sont **pures** — elles ne font aucun appel réseau, donc faciles à tester.

- [ ] **Étape 1: Écrire les tests (RED)**

Créer `tests/unit/lib/utils.test.ts` :

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatRelativeDate, formatStars } from '@/lib/utils'

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-19T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it("should return aujourd'hui for today", () => {
    expect(formatRelativeDate('2026-06-19T08:00:00Z')).toBe("aujourd'hui")
  })

  it('should return il y a 1 jour for yesterday', () => {
    expect(formatRelativeDate('2026-06-18T08:00:00Z')).toBe('il y a 1 jour')
  })

  it('should return il y a N jours for a few days ago', () => {
    expect(formatRelativeDate('2026-06-16T08:00:00Z')).toBe('il y a 3 jours')
  })

  it('should return il y a 1 semaine for 7-13 days ago', () => {
    expect(formatRelativeDate('2026-06-12T08:00:00Z')).toBe('il y a 1 semaine')
  })

  it('should return il y a N semaines for older dates', () => {
    expect(formatRelativeDate('2026-06-05T08:00:00Z')).toBe('il y a 2 semaines')
  })
})

describe('formatStars', () => {
  it('should return plain number for < 1000', () => {
    expect(formatStars(342)).toBe('342')
    expect(formatStars(0)).toBe('0')
  })

  it('should return Xk format for >= 1000', () => {
    expect(formatStars(1000)).toBe('1.0k')
    expect(formatStars(12500)).toBe('12.5k')
    expect(formatStars(82300)).toBe('82.3k')
  })
})
```

- [ ] **Étape 2: Lancer les tests — vérifier qu'ils échouent**

```powershell
pnpm test
```

Résultat attendu : FAIL avec `Cannot find module '@/lib/utils'`.

- [ ] **Étape 3: Créer lib/utils.ts**

```typescript
export function formatRelativeDate(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'il y a 1 jour'
  if (days < 7) return `il y a ${days} jours`
  if (days < 14) return 'il y a 1 semaine'
  return `il y a ${Math.floor(days / 7)} semaines`
}

export function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}
```

- [ ] **Étape 4: Lancer les tests — vérifier qu'ils passent**

```powershell
pnpm test
```

Résultat attendu : tous les tests `utils.test.ts` passent en vert.

- [ ] **Étape 5: Commit**

```bash
git add packages/app/src/lib/utils.ts tests/unit/lib/utils.test.ts
git commit -m "feat(lib): formatRelativeDate et formatStars avec tests"
```

---

## Task 5: lib/github.ts (transformateur + fetch)

**Fichiers:**
- Créer: `packages/app/src/lib/github.ts`
- Créer: `tests/unit/lib/github.test.ts`

`transformRepo()` est une **fonction pure** — testable sans réseau. `fetchGitHub()` fait les vrais appels API.

- [ ] **Étape 1: Écrire les tests (RED)**

Créer `tests/unit/lib/github.test.ts` :

```typescript
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
```

- [ ] **Étape 2: Vérifier que les tests échouent**

```powershell
pnpm test tests/unit/lib/github.test.ts
```

Résultat attendu : FAIL — `Cannot find module '@/lib/github'`.

- [ ] **Étape 3: Créer lib/github.ts**

```typescript
import type { TechItem } from '@/types'

export type GitHubRepoRaw = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  topics: string[]
  language: string | null
  pushed_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

type GitHubReadmeRaw = {
  content: string
  encoding: string
}

type GitHubSearchResponse = {
  items: GitHubRepoRaw[]
}

export function transformRepo(repo: GitHubRepoRaw, readmeWordCount: number): TechItem {
  const parts = repo.name.split(/[-_]/).filter(Boolean)
  const coverInitials =
    parts
      .slice(0, 3)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 3) || 'GH'

  const tags: string[] = []
  if (repo.language) tags.push(repo.language)
  repo.topics.slice(0, 3).forEach(t => tags.push(t))

  return {
    id: `gh-${repo.id}`,
    source: 'github',
    title: repo.full_name,
    description: repo.description ?? 'No description',
    url: repo.html_url,
    tags,
    stars: repo.stargazers_count,
    readTime: readmeWordCount > 0 ? Math.ceil(readmeWordCount / 200) : 0,
    publishedAt: repo.pushed_at,
    ownerAvatar: repo.owner.avatar_url,
    coverInitials,
  }
}

async function fetchReadmeWordCount(fullName: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const data: GitHubReadmeRaw = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return content.split(/\s+/).filter(Boolean).length
  } catch {
    return 0
  }
}

export async function fetchGitHub(): Promise<TechItem[]> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=stars:>500+pushed:>${twoWeeksAgo}&sort=updated&per_page=15`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      console.error('GitHub API error:', res.status)
      return []
    }
    const data: GitHubSearchResponse = await res.json()
    const repos = data.items ?? []
    const wordCounts = await Promise.all(
      repos.map(repo => fetchReadmeWordCount(repo.full_name))
    )
    return repos.map((repo, i) => transformRepo(repo, wordCounts[i] ?? 0))
  } catch (err) {
    console.error('fetchGitHub failed:', err)
    return []
  }
}
```

- [ ] **Étape 4: Lancer les tests — vérifier qu'ils passent**

```powershell
pnpm test tests/unit/lib/github.test.ts
```

Résultat attendu : 11 tests passent en vert.

- [ ] **Étape 5: Commit**

```bash
git add packages/app/src/lib/github.ts tests/unit/lib/github.test.ts
git commit -m "feat(lib): fetchGitHub et transformRepo avec tests"
```

---

## Task 6: lib/devto.ts (transformateur + fetch)

**Fichiers:**
- Créer: `packages/app/src/lib/devto.ts`
- Créer: `tests/unit/lib/devto.test.ts`

- [ ] **Étape 1: Écrire les tests (RED)**

Créer `tests/unit/lib/devto.test.ts` :

```typescript
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
```

- [ ] **Étape 2: Vérifier que les tests échouent**

```powershell
pnpm test tests/unit/lib/devto.test.ts
```

Résultat attendu : FAIL — `Cannot find module '@/lib/devto'`.

- [ ] **Étape 3: Créer lib/devto.ts**

```typescript
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
```

- [ ] **Étape 4: Lancer les tests — vérifier qu'ils passent**

```powershell
pnpm test
```

Résultat attendu : tous les tests (utils + github + devto) passent.

- [ ] **Étape 5: Commit**

```bash
git add packages/app/src/lib/devto.ts tests/unit/lib/devto.test.ts
git commit -m "feat(lib): fetchDevTo et transformArticle avec tests"
```

---

## Task 7: Validation des données API (smoke test)

**Fichiers:**
- Modifier: `packages/app/src/app/page.tsx` (version temporaire)

Avant de construire l'interface, on s'assure que les APIs répondent correctement.

- [ ] **Étape 1: Modifier page.tsx pour afficher les données**

```tsx
import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'

export default async function Home() {
  const [githubItems, devtoItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
  ])

  console.log('=== STREAMLINE DATA VALIDATION ===')
  console.log(`GitHub repos: ${githubItems.length}`)
  if (githubItems[0]) {
    console.log('Premier repo GitHub:', JSON.stringify(githubItems[0], null, 2))
  }
  console.log(`Dev.to articles: ${devtoItems.length}`)
  if (devtoItems[0]) {
    console.log('Premier article Dev.to:', JSON.stringify(devtoItems[0], null, 2))
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>Streamline — validation données</h1>
      <p>GitHub repos chargés : <strong>{githubItems.length}</strong></p>
      <p>Articles Dev.to chargés : <strong>{devtoItems.length}</strong></p>
      <p style={{ color: '#666' }}>Regarde le terminal (où tourne pnpm dev) pour voir les données !</p>
    </main>
  )
}
```

- [ ] **Étape 2: Lancer le serveur**

```powershell
pnpm --filter @zelian/app dev
```

- [ ] **Étape 3: Ouvrir http://localhost:3000 et lire le terminal**

Dans le terminal **où tourne pnpm dev**, tu dois voir :

```
=== STREAMLINE DATA VALIDATION ===
GitHub repos: 15
Premier repo GitHub: {
  "id": "gh-123456",
  "source": "github",
  "title": "shadcn-ui/ui",
  ...
}
Dev.to articles: 12
Premier article Dev.to: {
  "id": "dt-999",
  "source": "devto",
  ...
}
```

Si `GitHub repos: 0` → vérifie que `GITHUB_TOKEN` est bien dans `packages/app/.env.local` et qu'il n'est pas expiré.

- [ ] **Étape 4: Arrêter le serveur**

Ctrl+C dans le terminal où tourne pnpm dev.

---

## Task 8: Tailwind CSS 4 + layout

**Fichiers:**
- Créer: `packages/app/postcss.config.mjs`
- Créer: `packages/app/src/app/globals.css`
- Modifier: `packages/app/src/app/layout.tsx`

- [ ] **Étape 1: Créer postcss.config.mjs**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Étape 2: Créer globals.css**

```css
@import "tailwindcss";

/* Styles pour le contenu rendu (article Dev.to + README GitHub) */
.article-body {
  font-size: 0.875rem;
  line-height: 1.75;
  color: #374151;
}
.article-body h1,
.article-body h2,
.article-body h3,
.article-body h4 {
  font-weight: 700;
  color: #18181b;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}
.article-body h1 { font-size: 1.25rem; border-bottom: 1px solid #e4e4e7; padding-bottom: 0.5rem; }
.article-body h2 { font-size: 1.1rem; }
.article-body h3 { font-size: 1rem; }
.article-body p { margin-bottom: 0.875rem; }
.article-body ul,
.article-body ol { padding-left: 1.5rem; margin-bottom: 0.875rem; }
.article-body li { margin-bottom: 0.25rem; }
.article-body pre {
  background: #1e1e2e;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.article-body code {
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  color: #a6e3a1;
}
.article-body p code,
.article-body li code {
  background: #f4f4f5;
  color: #dc2626;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}
.article-body img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}
.article-body a { color: #4f46e5; text-decoration: underline; }
.article-body blockquote {
  border-left: 3px solid #c7d2fe;
  padding-left: 1rem;
  color: #52525b;
  margin: 1rem 0;
}
```

- [ ] **Étape 3: Modifier layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Streamline — Veille tech',
  description:
    'Agrège les repos GitHub trending et les articles Dev.to dans un tableau de bord unifié',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-zinc-50 min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Étape 4: Tester que Tailwind fonctionne**

```powershell
pnpm --filter @zelian/app dev
```

Ouvrir http://localhost:3000. Le fond de page doit être légèrement gris (zinc-50). Ctrl+C.

- [ ] **Étape 5: Commit**

```bash
git add packages/app/postcss.config.mjs packages/app/src/app/globals.css packages/app/src/app/layout.tsx
git commit -m "feat(style): Tailwind CSS 4 + styles article"
```

---

## Task 9: Hooks useReadLater et useFavorites (+ tests)

**Fichiers:**
- Créer: `packages/app/src/hooks/useReadLater.ts`
- Créer: `packages/app/src/hooks/useFavorites.ts`
- Créer: `tests/unit/hooks/useReadLater.test.tsx`
- Créer: `tests/unit/hooks/useFavorites.test.tsx`

- [ ] **Étape 1: Écrire les tests useReadLater (RED)**

Créer `tests/unit/hooks/useReadLater.test.tsx` :

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReadLater } from '@/hooks/useReadLater'
import type { TechItem } from '@/types'

const mockItem: TechItem = {
  id: 'dt-1',
  source: 'devto',
  title: 'Test article',
  description: 'A test',
  url: 'https://dev.to/test',
  tags: ['react'],
  stars: 10,
  readTime: 5,
  publishedAt: '2026-06-18T10:00:00Z',
  coverInitials: 'TA',
}

describe('useReadLater', () => {
  beforeEach(() => localStorage.clear())

  it('should start with empty list', () => {
    const { result } = renderHook(() => useReadLater())
    expect(result.current.readLaterItems).toEqual([])
  })

  it('should add an item', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.readLaterItems).toHaveLength(1)
  })

  it('should detect item in list after adding', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.isInReadLater('dt-1')).toBe(true)
  })

  it('should return false for item not in list', () => {
    const { result } = renderHook(() => useReadLater())
    expect(result.current.isInReadLater('dt-999')).toBe(false)
  })

  it('should not duplicate items', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    act(() => result.current.addToReadLater(mockItem))
    expect(result.current.readLaterItems).toHaveLength(1)
  })

  it('should remove an item', () => {
    const { result } = renderHook(() => useReadLater())
    act(() => result.current.addToReadLater(mockItem))
    act(() => result.current.removeFromReadLater('dt-1'))
    expect(result.current.readLaterItems).toHaveLength(0)
    expect(result.current.isInReadLater('dt-1')).toBe(false)
  })
})
```

- [ ] **Étape 2: Écrire les tests useFavorites (RED)**

Créer `tests/unit/hooks/useFavorites.test.tsx` :

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '@/hooks/useFavorites'
import type { TechItem } from '@/types'

const mockItem: TechItem = {
  id: 'gh-1',
  source: 'github',
  title: 'shadcn/ui',
  description: 'UI components',
  url: 'https://github.com/shadcn/ui',
  tags: ['typescript'],
  stars: 80000,
  readTime: 0,
  publishedAt: '2026-06-17T10:00:00Z',
  ownerAvatar: 'https://avatars.githubusercontent.com/u/1',
  coverInitials: 'SU',
}

describe('useFavorites', () => {
  beforeEach(() => localStorage.clear())

  it('should start with empty list', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(mockItem))
    expect(result.current.favorites).toHaveLength(1)
  })

  it('should detect favorite status', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(mockItem))
    expect(result.current.isFavorite('gh-1')).toBe(true)
    expect(result.current.isFavorite('gh-999')).toBe(false)
  })

  it('should not duplicate favorites', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(mockItem))
    act(() => result.current.addFavorite(mockItem))
    expect(result.current.favorites).toHaveLength(1)
  })

  it('should remove a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(mockItem))
    act(() => result.current.removeFavorite('gh-1'))
    expect(result.current.favorites).toHaveLength(0)
    expect(result.current.isFavorite('gh-1')).toBe(false)
  })
})
```

- [ ] **Étape 3: Lancer les tests — vérifier qu'ils échouent**

```powershell
pnpm test tests/unit/hooks/
```

Résultat attendu : FAIL — `Cannot find module '@/hooks/useReadLater'`.

- [ ] **Étape 4: Créer useReadLater.ts**

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_read_later'

export function useReadLater() {
  const [readLaterItems, setReadLaterItems] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setReadLaterItems(JSON.parse(stored) as TechItem[])
    } catch {
      setReadLaterItems([])
    }
  }, [])

  const addToReadLater = (item: TechItem) => {
    setReadLaterItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      const next = [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const removeFromReadLater = (id: string) => {
    setReadLaterItems(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isInReadLater = (id: string) => readLaterItems.some(i => i.id === id)

  return { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater }
}
```

- [ ] **Étape 5: Créer useFavorites.ts**

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored) as TechItem[])
    } catch {
      setFavorites([])
    }
  }, [])

  const addFavorite = (item: TechItem) => {
    setFavorites(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      const next = [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (id: string) => favorites.some(i => i.id === id)

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
```

- [ ] **Étape 6: Lancer les tests — vérifier qu'ils passent**

```powershell
pnpm test
```

Résultat attendu : tous les tests (utils, github, devto, useReadLater, useFavorites) passent.

- [ ] **Étape 7: Commit**

```bash
git add packages/app/src/hooks/ tests/unit/hooks/
git commit -m "feat(hooks): useReadLater et useFavorites avec tests"
```

---

## Task 10: Composant TechCard

**Fichiers:**
- Créer: `packages/app/src/components/TechCard.tsx`

- [ ] **Étape 1: Créer TechCard.tsx**

```tsx
'use client'

import { Bookmark, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { TechItem } from '@/types'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'
import { formatRelativeDate, formatStars } from '@/lib/utils'

type Props = { item: TechItem }

export function TechCard({ item }: Props) {
  const { isInReadLater, addToReadLater, removeFromReadLater } = useReadLater()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const inReadLater = isInReadLater(item.id)
  const inFavorites = isFavorite(item.id)
  const numericId = item.id.replace(/^(gh|dt)-/, '')
  const detailPath =
    item.source === 'github' ? `/repo/${numericId}` : `/article/${numericId}`
  const isGitHub = item.source === 'github'

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
      {/* Cover */}
      <div
        className={`relative h-20 flex items-center justify-center border-b border-zinc-100 ${
          isGitHub ? 'bg-green-50' : 'bg-indigo-50'
        }`}
      >
        {/* Badge source */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${
            isGitHub
              ? 'text-green-700 border-green-200'
              : 'text-indigo-700 border-indigo-200'
          }`}
        >
          {isGitHub ? '★ GitHub' : '✍ Dev.to'}
        </span>

        {/* Logo / initiales */}
        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 shadow flex items-center justify-center overflow-hidden">
          {item.ownerAvatar ? (
            <Image
              src={item.ownerAvatar}
              alt={item.title}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <span
              className={`text-xs font-bold ${
                isGitHub ? 'text-green-700' : 'text-indigo-700'
              }`}
            >
              {item.coverInitials}
            </span>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() =>
              inReadLater
                ? removeFromReadLater(item.id)
                : addToReadLater(item)
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
            <span className="text-[10px] text-amber-600">
              ★ {formatStars(item.stars)}
            </span>
            {item.readTime > 0 && (
              <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                <Clock size={9} />
                {isGitHub ? '~' : ''}
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

- [ ] **Étape 2: Vérifier les types**

```powershell
pnpm --filter @zelian/app typecheck
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/components/TechCard.tsx
git commit -m "feat(components): TechCard avec actions bookmark et favori"
```

---

## Task 11: Composant DashboardClient

**Fichiers:**
- Créer: `packages/app/src/components/DashboardClient.tsx`

- [ ] **Étape 1: Créer DashboardClient.tsx**

```tsx
'use client'

import { useState } from 'react'
import type { TechItem } from '@/types'
import { TechCard } from './TechCard'
import { useReadLater } from '@/hooks/useReadLater'
import { useFavorites } from '@/hooks/useFavorites'

type Tab = 'devto' | 'github' | 'all' | 'readlater' | 'favorites'

type Props = { items: TechItem[] }

export function DashboardClient({ items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('devto')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TechItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const { readLaterItems } = useReadLater()
  const { favorites } = useFavorites()

  const baseItems = (() => {
    if (activeTab === 'devto') return items.filter(i => i.source === 'devto')
    if (activeTab === 'github') return items.filter(i => i.source === 'github')
    if (activeTab === 'readlater') return readLaterItems
    if (activeTab === 'favorites') return favorites
    return items
  })()

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
      id: 'devto',
      label: '✍ Dev.to',
      count: items.filter(i => i.source === 'devto').length,
      activeClass: 'bg-indigo-600 text-white',
    },
    {
      id: 'github',
      label: '★ GitHub',
      count: items.filter(i => i.source === 'github').length,
      activeClass: 'bg-green-600 text-white',
    },
    {
      id: 'all',
      label: '⊞ Tout',
      count: items.length,
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
          placeholder="Rechercher… (Entrée = recherche étendue sans filtre de date)"
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

      {/* Contenu */}
      <main className="p-3">
        {searchError && (
          <div className="mb-3 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2">
            Recherche indisponible — les résultats locaux sont affichés
          </div>
        )}

        {items.length === 0 &&
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
                ? "Aucun article à lire — clique sur 🔖 dans une carte pour sauvegarder"
                : "Aucun favori — clique sur ⭐ dans une carte pour ajouter aux favoris"}
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

- [ ] **Étape 2: Vérifier les types**

```powershell
pnpm --filter @zelian/app typecheck
```

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/components/DashboardClient.tsx
git commit -m "feat(components): DashboardClient avec 5 onglets et barre de recherche"
```

---

## Task 12: Page principale (Server Component)

**Fichiers:**
- Modifier: `packages/app/src/app/page.tsx`

- [ ] **Étape 1: Remplacer page.tsx par la version finale**

```tsx
import { fetchGitHub } from '@/lib/github'
import { fetchDevTo } from '@/lib/devto'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const [githubItems, devtoItems] = await Promise.all([
    fetchGitHub(),
    fetchDevTo(),
  ])

  const items = [...devtoItems, ...githubItems]

  return <DashboardClient items={items} />
}
```

- [ ] **Étape 2: Lancer et tester**

```powershell
pnpm --filter @zelian/app dev
```

Vérifier sur http://localhost:3000 :
- Le header "⚡ Streamline" avec la barre de recherche
- Les 5 onglets avec compteurs
- La grille de cartes dans l'onglet Dev.to (par défaut)
- Onglet GitHub → cartes de repos avec avatar owner
- 🔖 sur une carte → carte apparaît dans l'onglet "À lire"
- ⭐ sur une carte → carte apparaît dans l'onglet "Favoris"
- Recherche en tapant → filtre en temps réel

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/app/page.tsx
git commit -m "feat(page): dashboard principal"
```

---

## Task 13: Route Handler /api/search

**Fichiers:**
- Créer: `packages/app/src/app/api/search/route.ts`

- [ ] **Étape 1: Créer route.ts**

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import type { TechItem } from '@/types'
import { transformRepo, type GitHubRepoRaw } from '@/lib/github'
import { transformArticle, type DevToArticleRaw } from '@/lib/devto'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return NextResponse.json([])

  const [ghResult, dtResult] = await Promise.allSettled([
    searchGitHub(q.trim()),
    searchDevTo(q.trim()),
  ])

  const ghItems = ghResult.status === 'fulfilled' ? ghResult.value : []
  const dtItems = dtResult.status === 'fulfilled' ? dtResult.value : []

  return NextResponse.json([...dtItems, ...ghItems])
}

async function searchGitHub(q: string): Promise<TechItem[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=10`,
    { headers, cache: 'no-store' }
  )
  if (!res.ok) return []
  const data: { items: GitHubRepoRaw[] } = await res.json()
  return (data.items ?? []).map(repo => transformRepo(repo, 0))
}

async function searchDevTo(q: string): Promise<TechItem[]> {
  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }
  const res = await fetch(
    `https://dev.to/api/articles?tag=${encodeURIComponent(q)}&per_page=10`,
    { headers, cache: 'no-store' }
  )
  if (!res.ok) return []
  const articles: DevToArticleRaw[] = await res.json()
  return articles.map(transformArticle)
}
```

- [ ] **Étape 2: Tester la recherche étendue**

Sur le dashboard, taper "react" dans la barre de recherche puis appuyer sur **Entrée**. De nouveaux résultats apparaissent (peuvent inclure des articles plus anciens que 14 jours). Le bouton "← Retour aux articles récents" s'affiche.

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/app/api/search/
git commit -m "feat(api): Route Handler GET /api/search sans filtre de date"
```

---

## Task 14: Page de détail article Dev.to

**Fichiers:**
- Créer: `packages/app/src/app/article/[id]/page.tsx`

- [ ] **Étape 1: Créer le dossier et page.tsx**

```tsx
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Clock } from 'lucide-react'
import { formatRelativeDate, formatStars } from '@/lib/utils'
import type { DevToArticleRaw } from '@/lib/devto'

type DevToArticleDetail = DevToArticleRaw & {
  body_html: string
  user: {
    name: string
    username: string
    profile_image: string
  }
}

type Params = { params: Promise<{ id: string }> }

export default async function ArticlePage({ params }: Params) {
  const { id } = await params

  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }

  const res = await fetch(`https://dev.to/api/articles/${id}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-3">Article introuvable.</p>
          <Link href="/" className="text-indigo-600 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const article: DevToArticleDetail = await res.json()

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-extrabold text-indigo-600">⚡ Streamline</span>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100"
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
      </header>

      <article className="max-w-2xl mx-auto bg-white mt-4 mx-3 rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-zinc-100">
          <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 mb-4">
            ✍ Dev.to
          </span>
          <h1 className="text-xl font-bold text-zinc-900 leading-snug mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500">
            <span>{article.user.name}</span>
            <span>{formatRelativeDate(article.published_at)}</span>
            <span className="text-amber-600">★ {formatStars(article.public_reactions_count)}</span>
            {article.reading_time_minutes > 0 && (
              <span className="text-indigo-500 flex items-center gap-1">
                <Clock size={10} />
                {article.reading_time_minutes} min
              </span>
            )}
          </div>
          {article.tag_list.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {article.tag_list.map(tag => (
                <span key={tag} className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lien vers l'original */}
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-3">
          <span className="text-xs text-indigo-600 truncate">{article.url}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shrink-0"
          >
            <ExternalLink size={11} />
            Lire sur Dev.to
          </a>
        </div>

        {/* Corps */}
        <div
          className="p-6 article-body"
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />
      </article>
    </div>
  )
}
```

- [ ] **Étape 2: Tester**

```powershell
pnpm --filter @zelian/app dev
```

Cliquer le titre d'un article Dev.to → page `/article/{id}` avec le contenu HTML. Le bouton "Lire sur Dev.to" s'ouvre dans un nouvel onglet.

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/app/article/
git commit -m "feat(page): détail article Dev.to"
```

---

## Task 15: Page de détail repo GitHub

**Fichiers:**
- Créer: `packages/app/src/app/repo/[id]/page.tsx`

- [ ] **Étape 1: Créer le dossier et page.tsx**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { marked } from 'marked'
import { formatRelativeDate, formatStars } from '@/lib/utils'

type GitHubRepoDetail = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  pushed_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

type Params = { params: Promise<{ id: string }> }

export default async function RepoPage({ params }: Params) {
  const { id } = await params

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const repoRes = await fetch(`https://api.github.com/repositories/${id}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!repoRes.ok) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-3">Repo introuvable.</p>
          <Link href="/" className="text-indigo-600 text-sm hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const repo: GitHubRepoDetail = await repoRes.json()

  const readmeRes = await fetch(
    `https://api.github.com/repos/${repo.full_name}/readme`,
    { headers, next: { revalidate: 3600 } }
  )

  let readmeHtml = ''
  if (readmeRes.ok) {
    const readmeData: { content: string } = await readmeRes.json()
    const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')
    readmeHtml = String(await marked.parse(content))
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <span className="text-sm font-extrabold text-indigo-600">⚡ Streamline</span>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100"
        >
          <ArrowLeft size={12} />
          Retour
        </Link>
      </header>

      <article className="max-w-2xl mx-auto bg-white mt-4 mx-3 rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-zinc-100">
          <span className="inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 mb-4">
            ★ GitHub
          </span>
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              width={32}
              height={32}
              className="rounded-lg border border-zinc-200"
            />
            <h1 className="text-xl font-bold text-zinc-900">{repo.full_name}</h1>
          </div>
          {repo.description && (
            <p className="text-sm text-zinc-600 mb-3">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500">
            <span>{formatRelativeDate(repo.pushed_at)}</span>
            <span className="text-amber-600">★ {formatStars(repo.stargazers_count)}</span>
            {repo.language && (
              <span className="text-indigo-500">{repo.language}</span>
            )}
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {repo.topics.map(topic => (
                <span key={topic} className="bg-zinc-100 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lien vers GitHub */}
        <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between gap-3">
          <span className="text-xs text-green-700 truncate">{repo.html_url}</span>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 shrink-0"
          >
            <ExternalLink size={11} />
            Voir sur GitHub
          </a>
        </div>

        {/* README */}
        {readmeHtml ? (
          <div
            className="p-6 article-body"
            dangerouslySetInnerHTML={{ __html: readmeHtml }}
          />
        ) : (
          <div className="p-6 text-center text-zinc-400 text-sm">
            Pas de README disponible pour ce dépôt.
          </div>
        )}
      </article>
    </div>
  )
}
```

- [ ] **Étape 2: Tester**

Sur le dashboard (onglet GitHub), cliquer le titre d'un repo → page `/repo/{id}` avec le README rendu. Le bouton "Voir sur GitHub" s'ouvre dans un nouvel onglet.

- [ ] **Étape 3: Commit**

```bash
git add packages/app/src/app/repo/
git commit -m "feat(page): détail repo GitHub avec README"
```

---

## Task 16: Vérification finale

- [ ] **Étape 1: Lancer tous les tests**

```powershell
pnpm test
```

Résultat attendu : tous les tests passent (utils, github, devto, useReadLater, useFavorites).

- [ ] **Étape 2: TypeCheck complet**

```powershell
pnpm --filter @zelian/app typecheck
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 3: Build de production**

```powershell
pnpm --filter @zelian/app build
```

Résultat attendu : build réussi sans erreur.

- [ ] **Étape 4: Parcours complet dans le navigateur**

```powershell
pnpm --filter @zelian/app dev
```

Tester sur http://localhost:3000 :
- [ ] Onglet Dev.to → articles récents (≤ 14 jours)
- [ ] Onglet GitHub → repos récents avec avatars
- [ ] Onglet Tout → mélange des deux
- [ ] 🔖 sur une carte → apparaît dans "À lire"
- [ ] ⭐ sur une carte → apparaît dans "Favoris"
- [ ] Refresher la page → bookmarks et favoris préservés (localStorage)
- [ ] Taper dans la barre → filtre local en temps réel
- [ ] Taper + Entrée → recherche étendue (résultats de toutes les dates)
- [ ] Cliquer titre d'un article Dev.to → page détail avec HTML
- [ ] Cliquer titre d'un repo GitHub → page détail avec README

- [ ] **Étape 5: Commit final**

```bash
git add -A
git commit -m "feat: Streamline MVP — veille tech GitHub + Dev.to"
```

---

## Référence rapide

| Commande | Action |
|----------|--------|
| `pnpm --filter @zelian/app dev` | Démarrer le serveur de dev |
| `pnpm test` | Lancer tous les tests unitaires |
| `pnpm --filter @zelian/app typecheck` | Vérifier les types TypeScript |
| `pnpm --filter @zelian/app build` | Build de production |

## Dépannage courant

| Problème | Solution |
|---------|----------|
| `GitHub repos: 0` | Vérifie `GITHUB_TOKEN` dans `packages/app/.env.local` |
| `Dev.to articles: 0` | API publique — pas de clé nécessaire. Vérifie ta connexion internet |
| Erreur d'image Next.js | Le domaine `avatars.githubusercontent.com` est déjà dans `next.config.ts` (Task 1) |
| Erreur TypeScript `@/` | L'alias `@` → `packages/app/src` est dans `vitest.config.ts` et `packages/app/tsconfig.json` |
| Tests en erreur jsdom | Vérifie que `@testing-library/react` et `@vitejs/plugin-react` sont installés à la racine |
