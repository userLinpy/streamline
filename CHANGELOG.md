# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) · Versioning : [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

### Added

- **Dashboard** : `DashboardClient` avec 5 onglets (Dev.to, GitHub, Tout, À lire, Favoris) et barre de recherche intégrée
- **Dashboard** : `app/page.tsx` Server Component avec fetch parallèle GitHub + Dev.to via `Promise.all`
- **Bookmarks** : hook `useReadLater` (localStorage `streamline_read_later`) — gestion liste "À lire plus tard"
- **Bookmarks** : hook `useFavorites` (localStorage `streamline_favorites`) — gestion liste "Favoris"
- **TechCard** : composant carte avec boutons bookmark (🔖) et favori (⭐), avatar GitHub ou initiales Dev.to, stats stars/readTime, lien vers page détail
- **Search** : Route Handler `GET /api/search?q=` — recherche étendue sans filtre de date, appels GitHub + Dev.to en `Promise.allSettled`
- **Dev.to** : page détail article `/article/[id]` — rendu `body_html` avec ISR 1h
- **GitHub** : page détail repo `/repo/[id]` — fetch README (base64 → `marked` → HTML) avec ISR 1h
- **GitHub Releases** : `lib/github-releases.ts` — `fetchGitHubReleases` + `transformRelease` avec 12 repos par défaut (`DEFAULT_WATCHED_REPOS`), fetch parallèle releases + étoiles GitHub
- **Hacker News** : `lib/hackernews.ts` — `fetchHackerNews` via Algolia (6 requêtes, dédup, max 40 items), `transformHit` avec route interne `/hn/{id}`
- **Logos dynamiques** : `lib/icons.ts` — `getIconSlug` + `getIconData` via `simple-icons` v16, avec override PNG `/public/logos/{slug}.png`
- **Filtres** : hook `useFilters` — toggle par source (github/devto/github-release/hackernews) + activation de tags prédéfinis + tags custom
- **Repos surveillés** : hook `useWatchedRepos` — ajout/suppression de repos custom avec validation `owner/repo` et persistance localStorage
- **API** : Route Handler `GET /api/releases?repos=...` — fetch GitHub Releases pour repos custom (validation regex, limite 20)
- **Page détail release** : `/release/[...slug]` — affichage notes de version Markdown via `marked`
- **Page détail HN** : `/hn/[id]` — métadonnées HN + boutons "Lire l'article" et "Discussion HN"
- **FilterPanel** : composant avec source toggles colorés, tag chips, formulaire ajout tag/repo custom
- **TechCard** : mis à jour avec 4 badges sources, routing dynamique vers pages détail, logos simple-icons avec fallback PNG → SVG → avatar → initiales
- **DashboardClient** : mis à jour avec 5 onglets (✍ News, ★ GitHub, ⊞ Tout, 🔖 À lire, ⭐ Favoris), filtres source+tag, releases custom async via `/api/releases`
- **page.tsx** : agrégation 4 sources en parallèle — GitHub Trending, Dev.to, GitHub Releases (12 repos), Hacker News

### Changed

### Fixed

### Removed

### BDD
