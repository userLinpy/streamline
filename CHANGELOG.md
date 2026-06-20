# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) · Versioning : [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

### Added

- **Sources RSS** : `useWatchedFeeds` (localStorage `streamline-feeds`) + Route Handler `GET /api/rss?url=...` (parse RSS 2.0 + Atom via fast-xml-parser côté serveur) + intégration dans `DashboardClient` (`allItems` inclut `rssFeedItems`) + badge 📡 cyan dans `TechCard` + section "URL flux RSS" dans `FilterPanel`
- **Résumé IA** : composant `AISummary` (bouton Sparkles, loading state, 3 points violet) + Route Handler `POST /api/summarize` (GitHub Models `gpt-4o-mini`, endpoint `https://models.inference.ai.azure.com`, `GITHUB_TOKEN` serveur uniquement, gratuit 150 req/jour) — intégré dans `repo/[id]`, `article/[id]`, `hn/[id]`, `release/[...slug]`
- **Historique consultations** : `lib/history.ts` (`trackVisit()` pure fonction localStorage `streamline-history`, auto-purge 2 mois) + `useHistory` hook lecture + `SettingsDrawer` (tiroir droit, filtres Auj/Semaine/Mois/Tout, clearByPeriod, clearAll) + bouton ⚙️ dans header `DashboardClient` + `trackVisit()` appelé au clic de chaque `TechCard`
- **Auto-complétion recherche** : `useRecentSearches` (localStorage `streamline-searches`, max 10, FIFO) + dropdown sous barre de recherche (recherches récentes si query vide, tags + titres matchants si query non vide) + fermeture 150ms après blur + Escape pour fermer + sauvegarde recherche à l'appui Entrée
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

### Added

- **Dark mode** : composant `ThemeToggle` (bouton Lune/Soleil, toggle `.dark` sur `<html>`, persistance `localStorage('streamline-theme')`)
- **Dark mode** : `@custom-variant dark (&:is(.dark *))` dans `globals.css` (Tailwind v4, sans bibliothèque externe) + overrides `.dark .article-body`
- **Dark mode** : script inline dans `layout.tsx` avec `suppressHydrationWarning` pour initialiser le thème depuis localStorage avant hydration React (anti-FOUC)
- **Dark mode** : classes `dark:` ajoutées sur tous les composants (`DashboardClient`, `TechCard`, `FilterPanel`, `error.tsx`) et toutes les pages détail (`repo/[id]`, `article/[id]`, `hn/[id]`, `release/[...slug]`) et leurs `loading.tsx`
- **Déploiement** : `vercel.json` ajouté à la racine du monorepo avec `{ "rootDirectory": "packages/app" }`

### Changed

- **TechCard** : redesign complet — `rounded-2xl`, cover avec `bg-gradient-to-br`, bande de couleur accent en top, hover `-translate-y-0.5 shadow-lg`
- **DashboardClient** : header glassmorphism (`backdrop-blur-sm bg-white/90`), icône Search dans la barre de recherche, intégration ThemeToggle
- **useFilters** : persistance localStorage clé `streamline-filters` — initialisation au montage, sauvegarde à chaque changement (cohérent avec `useReadLater`/`useFavorites`)
- **Pages détail** (`repo/[id]`, `article/[id]`, `hn/[id]`, `release/[...slug]`) : header sticky unifié
- **loading.tsx** (dashboard) : redesign skeleton

### Fixed

- **Error boundary** : création de `app/error.tsx` — les erreurs Server Component non gérées affichent désormais un écran d'erreur au lieu de crasher le worker jest-worker Next.js
- **Release page** : `release.author` peut être `null` (releases de bots) — accès protégé par `?.login ?? 'GitHub'`
- **Repo page** : `readmeData.content` peut être absent — vérification avant `Buffer.from()`

### Removed

### BDD
