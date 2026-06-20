# Spec technique — dashboard

| Champ | Valeur |
|---|---|
| **Feature** | dashboard |
| **Statut** | Implémenté |
| **Date** | 2026-06-20 |
| **Auteur** | Lin |
| **Version** | 0.3.0 |

---

## Architecture

- `app/page.tsx` — Server Component, orchestre 4 appels API en parallèle via `Promise.all()`
- `components/DashboardClient.tsx` — Client Component, gère les onglets, la barre de recherche, les filtres source/tag et les releases custom async
- `components/FilterPanel.tsx` — Client Component, panneau de filtres (source toggles colorés, tag chips, formulaire repo/tag custom)
- `components/TechCard.tsx` — Client Component, routing dynamique vers 4 types de pages détail, logo simple-icons avec fallback PNG → SVG → avatar → initiales
- Séparation nette Server / Client : le fetch initial est côté serveur, l'interactivité et les releases custom côté client

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/app/page.tsx` | Page principale — Server Component, 4 fetches parallèles |
| `packages/app/src/components/DashboardClient.tsx` | Dashboard interactif — Client Component (5 onglets, recherche, filtres, releases custom) |
| `packages/app/src/components/TechCard.tsx` | Carte individuelle — Client Component (4 sources, logos, routing dynamique) |
| `packages/app/src/components/FilterPanel.tsx` | Panneau de filtres — source toggles, tag chips, ajout repo/tag custom |
| `packages/app/src/hooks/useReadLater.ts` | État "À lire" consommé par DashboardClient |
| `packages/app/src/hooks/useFavorites.ts` | État "Favoris" consommé par DashboardClient |
| `packages/app/src/hooks/useFilters.ts` | Filtres source+tag — toggle sources, tags prédéfinis et custom |
| `packages/app/src/hooks/useWatchedRepos.ts` | Repos surveillés custom — ajout/suppression avec persistance localStorage |
| `packages/app/src/lib/github.ts` | Fonctions appel GitHub API (trending repos) |
| `packages/app/src/lib/devto.ts` | Fonctions appel Dev.to API |
| `packages/app/src/lib/github-releases.ts` | Fonctions appel GitHub Releases API |
| `packages/app/src/lib/hackernews.ts` | Fonctions appel Hacker News via Algolia |
| `packages/app/src/lib/icons.ts` | Résolution logos via simple-icons v16 avec override PNG |
| `packages/app/src/types/index.ts` | Types partagés (TechItem avec 4 sources) |

## Schema BDD

Aucun — pas de base de données pour cette feature.

## Fetch page.tsx

```typescript
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

## API appelées au chargement

### GitHub — repos trending (filtre 14 jours)
```
GET https://api.github.com/search/repositories
  ?q=stars:>1000+pushed:>YYYY-MM-DD&sort=stars&order=desc&per_page=10
Headers: Authorization: Bearer ${GITHUB_TOKEN}
```

### Dev.to — articles récents
```
GET https://dev.to/api/articles
  ?per_page=10&top=7
Headers (optionnel): api-key: ${DEVTO_API_KEY}
```

### GitHub Releases — 12 repos par défaut
```
GET https://api.github.com/repos/{owner}/{repo}/releases?per_page=3  (par repo)
GET https://api.github.com/repos/{owner}/{repo}                       (métadonnées)
Headers: Authorization: Bearer ${GITHUB_TOKEN}
```

### Hacker News — via Algolia
```
GET https://hn.algolia.com/api/v1/search?tags=story&query={q}&hitsPerPage=10
  (6 requêtes parallèles, dédup, max 40 items triés par points)
```

### API interne — releases custom
```
GET /api/releases?repos=owner/repo1,owner/repo2,...
  (Route Handler, validation regex, limite 20 repos)
```

## DashboardClient — onglets

| Id | Label | Contenu |
|---|---|---|
| `news` | News | items sources devto + hackernews |
| `github` | GitHub | items sources github + github-release |
| `all` | Tout | tous les items (initial + custom) |
| `readlater` | À lire | items depuis `useReadLater` (localStorage) |
| `favorites` | Favoris | items depuis `useFavorites` (localStorage) |

## Filtres (useFilters)

```typescript
type SourceFilters = {
  github: boolean
  devto: boolean
  'github-release': boolean
  hackernews: boolean
}

type Filters = {
  sources: SourceFilters
  activeTags: string[]   // tags prédéfinis activés
  customTags: string[]   // tags ajoutés par l'utilisateur
}
```

- `toggleSource(source)` — active/désactive une source
- `toggleTag(tag)` — active/désactive un tag prédéfini
- `addCustomTag(tag)` — ajoute un tag custom (trim, dédup)
- `removeCustomTag(tag)` — supprime du tableau custom ET des actifs

Tags prédéfinis : Python, JavaScript, TypeScript, React, Node.js, Go, Rust, DevOps, IA/ML, Agile, Security, Open Source

## Repos surveillés (useWatchedRepos)

- Persistance localStorage clé `streamline_custom_repos`
- Validation format `owner/repo` via regex `/^[\w.-]+\/[\w.-]+$/`
- `addRepo(repo)` retourne `boolean` (false si invalide ou doublon)
- `removeRepo(repo)` — suppression + sync localStorage
- Repos custom déclenchent un fetch async `GET /api/releases?repos=...`

## Barre de recherche

- Frappe en temps réel : filtre local sur `title`, `description`, `tags` (insensible à la casse)
- Appui sur Entrée : requête étendue vers `GET /api/search?q=` (sans filtre de date)
- Effacement de la saisie : réinitialise les résultats étendus et revient au filtrage local
- Changement d'onglet : vide la recherche en cours

## Types

```typescript
type TechItem = {
  id: string           // "gh-<id>" | "dt-<id>" | "gr-<id>" | "hn-<id>"
  source: 'github' | 'devto' | 'github-release' | 'hackernews'
  title: string
  description: string
  url: string
  tags: string[]
  stars: number
  readTime: number
  publishedAt: string
  ownerAvatar?: string
  coverInitials: string  // obligatoire depuis v0.3.0 (plus optionnel)
}
```

## Tests

- [x] Unitaire : `hooks/useFilters` — 11 cas (sources, tags prédéfinis, custom tags, remove)
- [x] Unitaire : `hooks/useWatchedRepos` — 9 cas (validation, ajout, suppression, localStorage)
- [ ] Unitaire : `lib/github.ts` — mock fetch, vérifie la transformation des données
- [ ] Unitaire : `lib/devto.ts` — mock fetch, vérifie la transformation des données
- [ ] Unitaire : `lib/github-releases.ts` — mock fetch, vérifie transformRelease
- [ ] Unitaire : `lib/hackernews.ts` — mock fetch, dédup, tri par points
- [ ] Intégration : page `/` — vérifie que les 4 sources s'affichent
- [ ] Unitaire : filtrage local — "react" filtre sur titre, description et tags
- [ ] Unitaire : changement d'onglet → réinitialise la recherche
