# Spec technique — dashboard

| Champ | Valeur |
|---|---|
| **Feature** | dashboard |
| **Statut** | Implémenté |
| **Date** | 2026-06-20 |
| **Auteur** | Lin |
| **Version** | 0.6.0 |

---

## Architecture

- `app/page.tsx` — Server Component, orchestre 4 appels API en parallèle via `Promise.all()`
- `app/error.tsx` — Error Boundary global App Router (`'use client'`), intercepte les erreurs non gérées des Server Components enfants ; reçoit `error: Error & { digest?: string }` et `reset: () => void` ; affiche un écran d'erreur avec bouton Réessayer et bouton Retour — classes `dark:` ajoutées en v0.4.0
- `components/DashboardClient.tsx` — Client Component, gère les onglets, la barre de recherche, les filtres source/tag et les releases custom async ; header glassmorphism (`backdrop-blur-sm bg-white/90 dark:bg-gray-900/90`) + icône Search intégrée + ThemeToggle en v0.4.0 ; useWatchedFeeds + fetch RSS + useRecentSearches + autocomplete dropdown + bouton ⚙️ + SettingsDrawer ajoutés en v0.5.0
- `components/FilterPanel.tsx` — Client Component, panneau de filtres (source toggles colorés incluant 'rss' cyan, tag chips, formulaire repo/tag custom, section "URL flux RSS") ; classes `dark:` ajoutées en v0.4.0 ; props feedUrls/onAddFeed/onRemoveFeed ajoutées en v0.5.0
- `components/TechCard.tsx` — Client Component, routing dynamique vers 4 types de pages détail, logo simple-icons avec fallback PNG → SVG → avatar → initiales ; redesign v0.4.0 : `rounded-2xl`, cover gradient `bg-gradient-to-br`, bande accent en top, hover `-translate-y-0.5 shadow-lg`, classes `dark:` complètes ; badge 'rss' cyan + `trackVisit()` au clic + `<a target="_blank">` pour URLs externes ajoutés en v0.5.0
- `components/AISummary.tsx` — Client Component (v0.5.0) : bouton "Résumer avec IA" (icône Sparkles), loading state, affichage 3 points clés en violet — appelle `POST /api/summarize` côté serveur
- `components/SettingsDrawer.tsx` — Client Component (v0.5.0) : tiroir droit historique, filtres Auj/Semaine/Mois/Tout, boutons clearByPeriod et clearAll
- `components/ThemeToggle.tsx` — Client Component (v0.4.0) : bouton Lune/Soleil qui toggle `.dark` sur `<html>` et persiste dans `localStorage('streamline-theme')` ; réécriture v0.6.0 avec framer-motion — composant interne `SolarSwitch` animé (SVG soleil/lune, `useMotionValue` + `useTransform`, `pathLength`, durée 0.7s)
- `components/SourceIcon.tsx` — Client Component (v0.6.0) : icône vectorielle par source — simple-icons SVG inline pour github/devto/hackernews (via `getIconData`), lucide `Package` pour github-release, lucide `Rss` pour rss
- Séparation nette Server / Client : le fetch initial est côté serveur, l'interactivité et les releases custom côté client

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/app/page.tsx` | Page principale — Server Component, 4 fetches parallèles |
| `packages/app/src/app/error.tsx` | Error Boundary global — Client Component, gestion des erreurs Server Component non rattrapées |
| `packages/app/src/components/DashboardClient.tsx` | Dashboard interactif — Client Component (5 onglets, recherche, filtres, releases custom, ThemeToggle, header glassmorphism) |
| `packages/app/src/components/TechCard.tsx` | Carte individuelle — Client Component (4 sources, logos, routing dynamique, redesign rounded-2xl + dark mode) |
| `packages/app/src/components/FilterPanel.tsx` | Panneau de filtres — source toggles, tag chips, ajout repo/tag custom (dark mode) |
| `packages/app/src/components/ThemeToggle.tsx` | Bouton Lune/Soleil — toggle classe `.dark` sur `<html>`, persistance `localStorage('streamline-theme')` ; animation framer-motion SolarSwitch (v0.6.0) |
| `packages/app/src/components/SourceIcon.tsx` | Icône source vectorielle — simple-icons inline pour github/devto/hackernews, lucide Package/Rss sinon (v0.6.0) |
| `packages/app/src/hooks/useReadLater.ts` | État "À lire" consommé par DashboardClient |
| `packages/app/src/hooks/useFavorites.ts` | État "Favoris" consommé par DashboardClient |
| `packages/app/src/hooks/useFilters.ts` | Filtres source+tag — toggle sources, tags prédéfinis et custom |
| `packages/app/src/hooks/useWatchedRepos.ts` | Repos surveillés custom — ajout/suppression avec persistance localStorage |
| `packages/app/src/hooks/useWatchedFeeds.ts` | Flux RSS custom — addFeed/removeFeed avec persistance localStorage `streamline-feeds` |
| `packages/app/src/hooks/useHistory.ts` | Lecture historique consultations — clearHistory, clearByPeriod |
| `packages/app/src/hooks/useRecentSearches.ts` | Recherches récentes — max 10, addSearch/removeSearch, localStorage `streamline-searches` |
| `packages/app/src/lib/github.ts` | Fonctions appel GitHub API (trending repos) |
| `packages/app/src/lib/devto.ts` | Fonctions appel Dev.to API |
| `packages/app/src/lib/github-releases.ts` | Fonctions appel GitHub Releases API |
| `packages/app/src/lib/hackernews.ts` | Fonctions appel Hacker News via Algolia |
| `packages/app/src/lib/icons.ts` | Résolution logos via simple-icons v16 avec override PNG |
| `packages/app/src/lib/rss.ts` | `fetchRSSFeed(url)` — parse RSS 2.0 + Atom via fast-xml-parser côté serveur |
| `packages/app/src/lib/history.ts` | `trackVisit()` — pure fonction localStorage, auto-purge 2 mois |
| `packages/app/src/app/api/rss/route.ts` | Route Handler `GET /api/rss?url=...` — fetch + parse flux RSS/Atom côté serveur |
| `packages/app/src/app/api/summarize/route.ts` | Route Handler `POST /api/summarize` — résumé IA via GitHub Models gpt-4o-mini |
| `packages/app/src/components/AISummary.tsx` | Composant client — bouton "Résumer avec IA" (Sparkles), loading state, 3 points violet |
| `packages/app/src/components/SettingsDrawer.tsx` | Tiroir historique — filtres Auj/Semaine/Mois/Tout, clearByPeriod, clearAll |
| `packages/app/src/types/index.ts` | Types partagés (TechItem avec 5 sources dont 'rss') |

## Schema BDD

Aucun — pas de base de données pour cette feature.

## Sécurité (v0.5.0)

- `GITHUB_TOKEN` côté serveur uniquement — utilisé dans `/api/rss` (fetch flux) et `/api/summarize` (GitHub Models)
- `DEVTO_API_KEY` côté serveur uniquement
- Jamais de variable préfixée `NEXT_PUBLIC_` pour les tokens
- `GITHUB_TOKEN` réutilisé pour GitHub Models via header `Authorization: Bearer` sans token dédié supplémentaire

## Route Handlers (v0.5.0)

### GET /api/rss?url=...

Proxy RSS côté serveur — évite les restrictions CORS des flux RSS tiers.

```
GET /api/rss?url=<encoded_url>
  Fetch + parse RSS 2.0 et Atom via fast-xml-parser
  Retourne : TechItem[] (source: 'rss', id: 'rss-<index>', badge 📡 cyan)
```

### POST /api/summarize

Résumé IA côté serveur via GitHub Models.

```
POST /api/summarize
  Body: { content: string }
  Headers: Authorization: Bearer ${GITHUB_TOKEN}
  Endpoint: https://models.inference.ai.azure.com/chat/completions
  Modèle: gpt-4o-mini (gratuit, 150 req/jour avec GITHUB_TOKEN)
  Retourne: { points: string[] }  — 3 points clés
```

## Sources RSS (v0.5.0)

- L'utilisateur saisit une URL de flux RSS dans `FilterPanel` — section "URL flux RSS"
- `useWatchedFeeds` (localStorage `streamline-feeds`) stocke la liste des URLs
- `DashboardClient` fetche chaque flux via `GET /api/rss?url=<url>` au montage et à l'ajout
- Les items RSS ont `source: 'rss'` — badge 📡 cyan dans `TechCard`
- `allItems` dans `DashboardClient` = items initiaux serveur + `rssFeedItems` RSS client

## Historique des consultations (v0.5.0)

- `lib/history.ts` : `trackVisit(item: TechItem)` — pure fonction (pas de hook), écrit dans localStorage clé `streamline-history`, auto-purge items > 2 mois
- `TechCard` appelle `trackVisit(item)` au clic sur le titre (événement `onClick` sur le `<Link>`)
- `useHistory` : hook lecture-seule, expose `history`, `clearHistory()`, `clearByPeriod(period)`
- `SettingsDrawer` : tiroir droit ouvert via bouton ⚙️ dans le header DashboardClient, affiche l'historique avec filtres Auj/Semaine/Mois/Tout

## Auto-complétion barre de recherche (v0.5.0)

- `useRecentSearches` (localStorage `streamline-searches`) — max 10 entrées, FIFO, `addSearch(q)`, `removeSearch(q)`
- Dropdown sous le champ de recherche :
  - Query vide : affiche les recherches récentes
  - Query non vide : affiche tags + titres matchants parmi les items courants
- Fermeture automatique 150ms après blur
- Touche Escape pour fermer immédiatement
- Recherche sauvegardée à l'appui Entrée (via `addSearch`)

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
| `all` | Tout | tous les items (initial + custom + rss) |
| `readlater` | À lire | items depuis `useReadLater` (localStorage) |
| `favorites` | Favoris | items depuis `useFavorites` (localStorage) |

## Filtres (useFilters)

```typescript
type SourceFilters = {
  github: boolean
  devto: boolean
  'github-release': boolean
  hackernews: boolean
  rss: boolean
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
- **Persistance localStorage (v0.4.0)** : clé `streamline-filters`, initialisation au montage depuis localStorage, sauvegarde via `useEffect` à chaque changement — cohérent avec `useReadLater` et `useFavorites`

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
  id: string           // "gh-<id>" | "dt-<id>" | "gr-<id>" | "hn-<id>" | "rss-<index>"
  source: 'github' | 'devto' | 'github-release' | 'hackernews' | 'rss'
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

## LocalStorage — clés utilisées (v0.5.0)

| Clé | Hook | Contenu |
|---|---|---|
| `streamline-theme` | ThemeToggle | `'dark'` ou absent |
| `streamline-filters` | useFilters | objet Filters sérialisé |
| `streamline_custom_repos` | useWatchedRepos | `string[]` repos custom |
| `streamline_read_later` | useReadLater | `TechItem[]` |
| `streamline_favorites` | useFavorites | `TechItem[]` |
| `streamline-feeds` | useWatchedFeeds | `string[]` URLs RSS |
| `streamline-history` | lib/history + useHistory | `TechItem[]` (purge auto 2 mois) |
| `streamline-searches` | useRecentSearches | `string[]` max 10 entrées |

## Icônes et animations (v0.6.0)

- **Remplacement emojis** : tous les emojis de l'UI (★ ⚡ 📦 🔶 ✍ 📡 🔖 ⭐) remplacés par des icônes SVG vectorielles — lucide-react (`Zap`, `Star`, `Bookmark`, `Package`, `Rss`, `Newspaper`, `Brain`) et simple-icons via `SourceIcon`
- **SourceIcon** : composant dédié au mapping source → icône — `getIconData` pour les sources avec simple-icons, fallback lucide pour `github-release` et `rss`
- **ThemeToggle animation** : composant `SolarSwitch` interne (framer-motion `motion.path`, `useMotionValue`, `useTransform`, `pathLength`) — transition soleil↔lune en 0.7s avec morphing des rayons et de la lune

## Dark mode (v0.4.0)

- Mécanisme : classe `.dark` sur `<html>` + `@custom-variant dark (&:is(.dark *))` dans `globals.css` (Tailwind v4 — pas de bibliothèque externe)
- Script inline dans `layout.tsx` avec `suppressHydrationWarning` sur `<html>` : initialise la classe `.dark` depuis `localStorage('streamline-theme')` avant hydration React pour éviter le flash de mauvaise couleur (FOUC)
- Composant `ThemeToggle.tsx` : bouton Lune/Soleil, toggle `.dark` + persiste dans `localStorage('streamline-theme')`
- Overrides `.dark .article-body` dans `globals.css` pour le rendu HTML des articles Dev.to
- Pages détail concernées (dark mode) : `repo/[id]`, `article/[id]`, `hn/[id]`, `release/[...slug]`, `loading.tsx` associés

## Headers sticky unifiés (v0.4.0)

Toutes les pages détail (`repo/[id]`, `article/[id]`, `hn/[id]`, `release/[...slug]`) ont reçu un header sticky unifié (style cohérent avec le header DashboardClient glassmorphism, classes `dark:` incluses).

## Null-safety (v0.3.1)

- `release.author` peut être `null` sur les releases publiées par des bots GitHub — accès protégé par `release.author?.login ?? 'GitHub'` dans `app/release/[...slug]/page.tsx`
- `readmeData.content` peut être absent (repo sans README ou réponse API incomplète) — vérification avant `Buffer.from()` dans `app/repo/[id]/page.tsx`

## Déploiement (v0.4.0)

- `vercel.json` ajouté à la racine du monorepo pnpm : `{ "rootDirectory": "packages/app" }` — indique à Vercel que le projet Next.js est dans `packages/app/` et non à la racine

## Tests

- [x] Unitaire : `hooks/useFilters` — 11 cas (sources, tags prédéfinis, custom tags, remove)
- [x] Unitaire : `hooks/useWatchedRepos` — 9 cas (validation, ajout, suppression, localStorage)
- [ ] Unitaire : `lib/github.ts` — mock fetch, vérifie la transformation des données
- [ ] Unitaire : `lib/devto.ts` — mock fetch, vérifie la transformation des données
- [ ] Unitaire : `lib/github-releases.ts` — mock fetch, vérifie transformRelease
- [ ] Unitaire : `lib/hackernews.ts` — mock fetch, dédup, tri par points
- [ ] Unitaire : `lib/rss.ts` — mock fast-xml-parser, vérifie RSS 2.0 et Atom
- [ ] Unitaire : `lib/history.ts` — trackVisit, auto-purge, write localStorage
- [ ] Unitaire : `hooks/useRecentSearches` — max 10, FIFO, addSearch, removeSearch
- [ ] Unitaire : `hooks/useWatchedFeeds` — addFeed, removeFeed, persistance localStorage
- [ ] Intégration : page `/` — vérifie que les 4 sources s'affichent
- [ ] Unitaire : filtrage local — "react" filtre sur titre, description et tags
- [ ] Unitaire : changement d'onglet → réinitialise la recherche
- [ ] Unitaire : `hooks/useFilters` — persistance localStorage (lecture au montage, écriture à chaque changement)
- [ ] Composant : `ThemeToggle` — toggle `.dark` sur `<html>`, persistance `localStorage('streamline-theme')`, animation SolarSwitch framer-motion
- [ ] Composant : `SourceIcon` — rendu simple-icons pour github/devto/hackernews, lucide Package/Rss pour les autres, null pour source inconnue
- [ ] Composant : `AISummary` — loading state, affichage des 3 points, gestion erreur API
