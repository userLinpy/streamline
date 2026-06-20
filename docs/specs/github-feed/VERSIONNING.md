# Versioning — github-feed

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1.0 | 2026-06-17 | Lin | Création initiale de la spec |
| 0.2.0 | 2026-06-19 | Lin | MVP : ajout page détail repo /repo/[id] (fetch README base64 + marked, ISR 1h, fallback README absent), export transformRepo et GitHubRepoRaw depuis lib/github.ts |
| 0.3.0 | 2026-06-20 | Lin | GitHub Releases : lib/github-releases.ts (fetchGitHubReleases, transformRelease, DEFAULT_WATCHED_REPOS — 12 repos), page détail /release/[...slug] (Markdown via marked, ISR 1h), Route Handler GET /api/releases (validation regex, limite 20 repos, fetch releases custom) |
