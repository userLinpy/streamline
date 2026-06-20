# Versioning — dashboard

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1.0 | 2026-06-17 | Lin | Création initiale de la spec |
| 0.2.0 | 2026-06-19 | Lin | MVP : DashboardClient (5 onglets Dev.to/GitHub/Tout/À lire/Favoris), barre de recherche intégrée (filtrage local temps réel + recherche étendue via Entrée), Server Component page.tsx avec Promise.all |
| 0.3.0 | 2026-06-20 | Lin | Nouvelles sources : GitHub Releases + Hacker News — 4 fetches parallèles dans page.tsx, FilterPanel (source toggles + tags), useFilters (4 sources + custom tags), useWatchedRepos (repos custom localStorage + /api/releases), TechCard mis à jour (4 sources, routing dynamique, logos simple-icons), DashboardClient refondu (onglets News/GitHub/Tout/À lire/Favoris, releases custom async) |
