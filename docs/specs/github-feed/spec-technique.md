# Spec technique — github-feed

| Champ | Valeur |
|---|---|
| **Feature** | github-feed |
| **Statut** | Implémenté |
| **Date** | 2026-06-20 |
| **Auteur** | Lin |
| **Version** | 0.3.0 |

---

## Architecture

Deux sous-fonctionnalités distinctes :
1. **GitHub Trending** : `fetchGitHub()` dans `lib/github.ts`, appelée depuis `app/page.tsx`. Page détail `/repo/[id]`.
2. **GitHub Releases** : `fetchGitHubReleases()` dans `lib/github-releases.ts`, appelée depuis `app/page.tsx` et via Route Handler `GET /api/releases` pour les repos custom.

Toutes les clés `GITHUB_TOKEN` restent côté serveur (Server Components + Route Handlers) — voir ADR-002.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/lib/github.ts` | Fetch + transformation GitHub trending (`fetchGitHub`, `transformRepo`, type `GitHubRepoRaw`) |
| `packages/app/src/lib/github-releases.ts` | Fetch + transformation GitHub Releases (`fetchGitHubReleases`, `transformRelease`, `DEFAULT_WATCHED_REPOS`) |
| `packages/app/src/app/repo/[id]/page.tsx` | Page détail repo trending — Server Component |
| `packages/app/src/app/release/[...slug]/page.tsx` | Page détail release — Server Component, rendu notes Markdown via `marked` |
| `packages/app/src/app/api/releases/route.ts` | Route Handler `GET /api/releases?repos=...` — fetch releases custom (validation regex, limite 20) |
| `packages/app/src/types/index.ts` | Type `TechItem` partagé |

## Schema BDD

Aucun.

## API GitHub — feed initial

```
GET https://api.github.com/search/repositories
  ?q=stars:>1000+pushed:>YYYY-MM-DD&sort=stars&order=desc&per_page=10

Headers:
  Authorization: Bearer ${GITHUB_TOKEN}
  Accept: application/vnd.github+json
```

Filtre de date : 14 derniers jours calculés dynamiquement au moment du fetch.

### Réponse (champs utilisés)

```typescript
type GitHubRepoRaw = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  pushed_at: string
  owner: { avatar_url: string; login: string }
}
```

## API GitHub — détail repo

```
GET https://api.github.com/repositories/:id
  next: { revalidate: 3600 }

GET https://api.github.com/repos/:full_name/readme
  next: { revalidate: 3600 }

Headers:
  Authorization: Bearer ${GITHUB_TOKEN}  (si défini)
  Accept: application/vnd.github+json
```

Le contenu du README est encodé en base64. Décodage :
```typescript
const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')
readmeHtml = String(await marked.parse(content))
```

Librairie utilisée : `marked` (markdown → HTML).

## Transformation vers TechItem

```typescript
function transformRepo(repo: GitHubRepoRaw, index: number): TechItem {
  return {
    id: `gh-${repo.id}`,
    title: repo.full_name,
    description: repo.description ?? '',
    url: repo.html_url,
    tags: [repo.language, ...repo.topics].filter(Boolean).slice(0, 5),
    source: 'github',
    stars: repo.stargazers_count,
    readTime: Math.ceil(repo.stargazers_count / 1000),  // estimation approximative
    publishedAt: repo.pushed_at,
    ownerAvatar: repo.owner.avatar_url,
    coverInitials: repo.owner.login.slice(0, 2).toUpperCase(),
  }
}
```

## Page détail `/repo/[id]`

- Server Component avec `params: Promise<{ id: string }>` (Next.js 15+)
- Revalidation ISR : `next: { revalidate: 3600 }`
- Deux fetches séquentiels : repo metadata, puis README (optionnel)
- README manquant : affiche "Pas de README disponible"
- Rendu du README converti : `dangerouslySetInnerHTML={{ __html: readmeHtml }}`
- Classe CSS `.article-body` appliquée au conteneur
- Lien "Voir sur GitHub" (target=_blank, noopener)
- Fallback 404 si repo `!res.ok`

## API GitHub Releases — feed initial

```
# Par repo — 2 appels parallèles
GET https://api.github.com/repos/{owner}/{repo}/releases?per_page=3
  next: { revalidate: 3600 }

GET https://api.github.com/repos/{owner}/{repo}
  next: { revalidate: 3600 }

Headers:
  Authorization: Bearer ${GITHUB_TOKEN}  (si défini, côté serveur uniquement)
  Accept: application/vnd.github+json
```

Pré-releases filtrées (`prerelease: true` exclues).

### Types utilisés

```typescript
type GitHubReleaseRaw = {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string
  prerelease: boolean
}

type GitHubRepoMetaRaw = {
  stargazers_count: number
  language: string | null
  topics: string[]
}
```

### Repos surveillés par défaut (DEFAULT_WATCHED_REPOS — 12 repos)

python/cpython, nodejs/node, microsoft/TypeScript, facebook/react, vercel/next.js, vuejs/core, golang/go, rust-lang/rust, django/django, tiangolo/fastapi, microsoft/vscode, kubernetes/kubernetes

## Transformation vers TechItem (releases)

```typescript
function transformRelease(release, repo, repoMeta): TechItem {
  return {
    id: `gr-${release.id}`,
    source: 'github-release',
    title: `${repo} ${release.tag_name}`,
    description: release.name ?? release.tag_name,
    url: release.html_url,
    tags: [repoMeta.language, ...repoMeta.topics.slice(0, 3)].filter(Boolean),
    stars: repoMeta.stargazers_count,
    readTime: 0,
    publishedAt: release.published_at,
    coverInitials: /* 3 premières initiales des mots du nom de repo */ ,
  }
}
```

## Route Handler — releases custom

```
GET /api/releases?repos=owner/repo1,owner/repo2,...

- Paramètre `repos` obligatoire (400 si absent)
- Validation regex `/^[\w.-]+\/[\w.-]+$/` par repo
- Limite : 20 repos max
- Délègue à fetchGitHubReleases(repos)
```

## Page détail `/release/[...slug]`

- Slug : `[...slug]` permet `owner/repo/tag_name`
- Server Component, revalidation ISR 1h
- Fetch `GET /repos/{owner}/{repo}/releases/tags/{tag}`
- Rendu notes de version Markdown via `marked`
- Fallback si release introuvable

## Tests

- [ ] Mock fetch → vérifie que `transformRepo` produit un `TechItem` valide
- [ ] Mock fetch 401 → retour tableau vide (pas d'exception levée)
- [ ] Mock repo avec `description: null` → `description` est une chaîne vide
- [ ] Mock README absent (404) → `readmeHtml` est vide, affichage du fallback
- [ ] Mock README base64 → contenu décodé et parsé par `marked`
- [ ] `transformRelease` : release avec `prerelease: true` → exclue du résultat
- [ ] `fetchRepoReleases` : réponse non-ok → retour tableau vide (pas d'exception)
- [ ] Route Handler : `repos` absent → 400
- [ ] Route Handler : format invalide → repo ignoré (pas d'erreur 400)
- [ ] Route Handler : limite 20 repos respectée
