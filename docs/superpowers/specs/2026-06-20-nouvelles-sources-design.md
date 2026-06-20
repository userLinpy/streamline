# Streamline — Extension Sources : GitHub Releases + Hacker News

**Date :** 2026-06-20
**Statut :** Approuvé
**Auteur :** Lin (stagiaire) + Claude Code

---

## Objectif

Étendre Streamline avec deux nouvelles sources de veille informatique — GitHub Releases et Hacker News — accompagnées d'un système de filtres (source + technologie) personnalisable pour permettre à l'utilisateur de configurer sa veille selon son domaine.

## Architecture générale

Approche A — extension directe du pattern existant :
- Un fichier par source dans `lib/`
- Un hook par feature de personnalisation dans `hooks/`
- `TechItem.source` étendu à 4 valeurs
- `page.tsx` orchestre les 4 sources via `Promise.all`
- `DashboardClient` applique les filtres côté client

Compatible avec une future évolution vers PostgreSQL + auth : la couche `lib/` est indépendante du stockage, et les hooks localStorage sont migrables vers des Server Actions sans changer l'interface publique.

---

## Modèle de données

### Extension de `TechItem.source`

```typescript
// packages/app/src/types/index.ts
export type TechItem = {
  id: string
  source: 'github' | 'devto' | 'github-release' | 'hackernews'  // étendu
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

### Préfixes d'identifiants

| Source | Préfixe | Exemple |
|--------|---------|---------|
| GitHub Trending | `gh-` | `gh-12345` |
| Dev.to | `dt-` | `dt-999` |
| GitHub Releases | `gr-` | `gr-67890` |
| Hacker News | `hn-` | `hn-38765432` |

---

## Nouvelles sources

### `lib/github-releases.ts`

**API :** `GET https://api.github.com/repos/{owner}/{repo}/releases?per_page=5`
**Auth :** `GITHUB_TOKEN` (côté serveur, existant)
**Cache :** `revalidate: 3600`

**Liste de repos par défaut (hardcodée) :**
```typescript
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
```

**Mapping API → TechItem :**

| Champ API GitHub | Champ TechItem |
|-----------------|----------------|
| `id` | `id: 'gr-{id}'` |
| `tag_name` | dans `title: '{repo} {tag_name}'` ex: `python/cpython v3.14.0` |
| `body` (200 chars max) | `description` |
| `html_url` | `url` |
| `published_at` | `publishedAt` |
| `author.avatar_url` | `ownerAvatar` |
| initiales du nom de repo | `coverInitials` |
| `0` | `stars` (les releases n'ont pas de compteur distinct) |
| `0` | `readTime` |

**Exports :**
- `DEFAULT_WATCHED_REPOS: string[]`
- `type GitHubReleaseRaw` — type brut de l'API
- `transformRelease(release: GitHubReleaseRaw, repoFullName: string): TechItem`
- `fetchGitHubReleases(repos: string[]): Promise<TechItem[]>`

**Comportement :**
- Appels en `Promise.allSettled` (un repo en erreur ne bloque pas les autres)
- Retourne les 3 releases les plus récentes par repo maximum
- Filtre les pre-releases (`prerelease: true`) — afficher uniquement les releases stables
- Erreur API → `[]` (pas d'exception propagée)

---

### `lib/hackernews.ts`

**API :** `GET https://hn.algolia.com/api/v1/search?tags=story&query={term}&hitsPerPage=15`
**Auth :** aucune (API publique gratuite)
**Cache :** `revalidate: 1800` (30 min — HN est plus dynamique)

**Queries par défaut (parallèles, dédupliquées) :**
```typescript
const HN_QUERIES = [
  'javascript', 'python', 'typescript',
  'devops', 'machine learning', 'open source',
]
```

**Mapping API → TechItem :**

| Champ API HN Algolia | Champ TechItem |
|---------------------|----------------|
| `objectID` | `id: 'hn-{objectID}'` |
| `title` | `title` |
| `points` | `stars` |
| `url` (ou lien HN si null) | `url` |
| `created_at` | `publishedAt` |
| `'{points} pts · {num_comments} commentaires'` | `description` |
| tags extraits du titre + `_tags` filtrés | `tags` (max 4) |
| initiales des 3 premiers mots du titre | `coverInitials` |
| `undefined` | `ownerAvatar` |
| `0` | `readTime` |

**Exports :**
- `type HackerNewsHitRaw` — type brut de l'API Algolia
- `transformHit(hit: HackerNewsHitRaw): TechItem`
- `fetchHackerNews(): Promise<TechItem[]>`

**Comportement :**
- Toutes les queries en `Promise.allSettled`
- Déduplication par `objectID` avant retour
- Filtre les hits sans `url` ET sans `title`
- Trie par `points` décroissant
- Limite à 40 résultats totaux

---

## Système de filtres

### `hooks/useFilters.ts`

**Clé localStorage :** `streamline_filters`

```typescript
type SourceFilters = {
  github: boolean           // GitHub Trending
  devto: boolean            // Dev.to
  'github-release': boolean // GitHub Releases
  hackernews: boolean       // Hacker News
}

type Filters = {
  sources: SourceFilters
  activeTags: string[]    // tags actuellement sélectionnés pour le filtrage
  customTags: string[]    // tags ajoutés par l'utilisateur (persistés séparément)
}
```

**Valeur par défaut :** toutes les sources activées, `activeTags: []`, `customTags: []`

**Exports du hook :**
```typescript
{
  filters: Filters
  toggleSource: (source: keyof SourceFilters) => void
  toggleTag: (tag: string) => void       // active/désactive un tag
  addCustomTag: (tag: string) => void    // ajoute à customTags + active
  removeCustomTag: (tag: string) => void // supprime de customTags + désactive
}
```

**Tags prédéfinis (non éditables par l'utilisateur) :**
```typescript
export const PREDEFINED_TAGS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Go', 'Rust', 'DevOps', 'IA/ML', 'Agile', 'Security', 'Open Source',
]
```

**Logique de filtrage (appliquée dans `DashboardClient`) :**
```
items
  → filter par source activée
  → filter par tag actif (activeTags vide = tout passer)
    (item.tags doit contenir au moins un activeTags — comparaison case-insensitive)
```

---

### `hooks/useWatchedRepos.ts`

**Clé localStorage :** `streamline_watched_repos`

Gère uniquement les repos **ajoutés par l'utilisateur** (les `DEFAULT_WATCHED_REPOS` sont hardcodés dans `lib/github-releases.ts`).

```typescript
{
  customRepos: string[]          // ['JetBrains/kotlin', 'spring-projects/spring-boot']
  addRepo: (repo: string) => void
  removeRepo: (repo: string) => void
  isCustomRepo: (repo: string) => boolean
}
```

**Validation à l'ajout :** format `owner/repo` obligatoire (regex `/^[\w.-]+\/[\w.-]+$/`).

---

## Route Handler `/api/releases`

**Pour les repos personnalisés uniquement** — les repos par défaut sont fetchés server-side dans `page.tsx`.

```
GET /api/releases?repos=JetBrains/kotlin,spring-projects/spring-boot
```

- Paramètre `repos` : liste séparée par virgules, max 10 repos
- Utilise `GITHUB_TOKEN` côté serveur
- Retourne `TechItem[]`
- `cache: 'no-store'` (les releases perso sont moins critiques que le dashboard principal)

---

## Pages de détail

| Source | Route | Contenu |
|--------|-------|---------|
| Dev.to | `/article/[id]` *(existant)* | `body_html` rendu + bouton "Lire sur Dev.to" |
| GitHub Trending | `/repo/[id]` *(existant)* | README Markdown rendu + bouton "Voir sur GitHub" |
| GitHub Releases | `/release/[id]` *(nouveau)* | Notes de release (`body`) rendues en Markdown + bouton "Voir le release sur GitHub" |
| Hacker News | `/hn/[id]` *(nouveau)* | Métadonnées HN (score, auteur, nb commentaires, date, tags) + bouton "Lire l'article →" + bouton "Discussion HN →" |

Le `[id]` pour chaque route est l'identifiant numérique **sans préfixe** (`gr-67890` → route `/release/67890`, `hn-38765432` → route `/hn/38765432`).

---

## Structure des onglets

| Onglet | Sources incluses | Couleur active |
|--------|-----------------|----------------|
| ✍ News | `devto` + `hackernews` | `bg-indigo-600` |
| ★ GitHub | `github` + `github-release` | `bg-green-600` |
| ⊞ Tout | Les 4 sources | `bg-zinc-600` |
| 🔖 À lire | `readLaterItems` (toutes sources) | `bg-amber-500` |
| ⭐ Favoris | `favorites` (toutes sources) | `bg-rose-500` |

---

## Badges source dans `TechCard`

| Source | Badge | Couleur |
|--------|-------|---------|
| `github` | `★ GitHub` | Vert |
| `devto` | `✍ Dev.to` | Indigo |
| `github-release` | `🏷 Release` | Violet |
| `hackernews` | `🔶 HN` | Orange |

---

## Panneau filtres dans `DashboardClient`

Bouton "⚙ Filtres" dans le header → panneau rétractable avec :

1. **Section Sources** — 4 toggles (un par source)
2. **Section Technologies** — chips cliquables (prédéfinis + custom)
3. **Ajout tag custom** — champ texte `[ + Ajouter un langage... ]`
4. **Section Repos suivis** — chips repos par défaut (non supprimables) + repos custom (avec ✕) + champ `[ + Ajouter un repo... ]`

---

## Fichiers créés / modifiés

| Action | Fichier | Rôle |
|--------|---------|------|
| MODIFIER | `packages/app/src/types/index.ts` | Étendre `source` à 4 valeurs |
| CRÉER | `packages/app/src/lib/github-releases.ts` | Fetch + transform releases |
| CRÉER | `packages/app/src/lib/hackernews.ts` | Fetch + transform HN stories |
| CRÉER | `packages/app/src/hooks/useFilters.ts` | État filtres source + tags (localStorage) |
| CRÉER | `packages/app/src/hooks/useWatchedRepos.ts` | Repos personnalisés (localStorage) |
| CRÉER | `packages/app/src/components/FilterPanel.tsx` | UI filtres (toggles, chips, ajout custom) |
| MODIFIER | `packages/app/src/components/DashboardClient.tsx` | Nouveaux onglets, intégration filtres |
| MODIFIER | `packages/app/src/components/TechCard.tsx` | Nouveaux badges source, nouvelles routes détail |
| MODIFIER | `packages/app/src/app/page.tsx` | `Promise.all` sur 4 sources |
| CRÉER | `packages/app/src/app/release/[id]/page.tsx` | Détail release GitHub |
| CRÉER | `packages/app/src/app/hn/[id]/page.tsx` | Détail story HN |
| CRÉER | `packages/app/src/app/api/releases/route.ts` | Releases repos custom |
| CRÉER | `tests/unit/lib/github-releases.test.ts` | Tests `transformRelease` |
| CRÉER | `tests/unit/lib/hackernews.test.ts` | Tests `transformHit` |
| CRÉER | `tests/unit/hooks/useFilters.test.tsx` | Tests hook filtres |
| CRÉER | `tests/unit/hooks/useWatchedRepos.test.tsx` | Tests hook repos |

---

## Tests

Même pattern TDD que le MVP :
- `transformRelease` et `transformHit` sont des fonctions pures → tests unitaires complets
- `useFilters` et `useWatchedRepos` → tests avec `renderHook` + `localStorage.clear()` en `beforeEach`
- Pas de tests pour `FilterPanel` (composant UI)

---

## Hors scope

- Notifications push pour les nouvelles releases
- Fréquence de refresh configurable par l'utilisateur
- Import/export des préférences (repos, tags)
- Support des pre-releases GitHub
- Authentification HN pour voir les upvotes personnels
