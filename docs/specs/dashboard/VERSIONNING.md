# Versioning — dashboard

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1.0 | 2026-06-17 | Lin | Création initiale de la spec |
| 0.2.0 | 2026-06-19 | Lin | MVP : DashboardClient (5 onglets Dev.to/GitHub/Tout/À lire/Favoris), barre de recherche intégrée (filtrage local temps réel + recherche étendue via Entrée), Server Component page.tsx avec Promise.all |
| 0.3.0 | 2026-06-20 | Lin | Nouvelles sources : GitHub Releases + Hacker News — 4 fetches parallèles dans page.tsx, FilterPanel (source toggles + tags), useFilters (4 sources + custom tags), useWatchedRepos (repos custom localStorage + /api/releases), TechCard mis à jour (4 sources, routing dynamique, logos simple-icons), DashboardClient refondu (onglets News/GitHub/Tout/À lire/Favoris, releases custom async) |
| 0.3.1 | 2026-06-20 | Lin | Bugfixes : error boundary global app/error.tsx (Server Component errors), null safety release.author sur releases de bots, null safety readmeData.content avant Buffer.from() |
| 0.4.0 | 2026-06-20 | Lin | Dark mode : ThemeToggle, @custom-variant Tailwind v4, script anti-FOUC dans layout.tsx, classes dark: sur tous les composants et pages détail. Persistence useFilters en localStorage (streamline-filters). Redesign TechCard (rounded-2xl, gradient, hover). Header glassmorphism DashboardClient. vercel.json rootDirectory monorepo. Headers sticky unifiés sur pages détail. |
| 0.5.0 | 2026-06-20 | Lin | Nouvelles features : sources RSS personnalisées (useWatchedFeeds + /api/rss + badge 📡 cyan dans TechCard), résumé IA via GitHub Models gpt-4o-mini (AISummary + /api/summarize sur 4 pages détail), historique des consultations (trackVisit + useHistory + SettingsDrawer + bouton ⚙️), auto-complétion barre de recherche (useRecentSearches + dropdown recherches récentes + tags + titres). |
