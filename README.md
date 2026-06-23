# Streamline

> Cockpit de veille technologique — Monorepo pnpm · Next.js 15 · React 19 · Tailwind CSS 4 · NextAuth v5 · Prisma 6 · Neon PostgreSQL

Streamline agrège GitHub Trending, Dev.to, Hacker News, GitHub Releases et des flux RSS personnalisés dans une interface unifiée. Il remplace la navigation entre plusieurs plateformes par un tableau de bord unique avec recherche, favoris, historique et résumés IA.

## Démarrage rapide

1. Copier `.env.example` en `.env.local` et configurer les variables
2. `pnpm install`
3. `docker compose up -d` (PostgreSQL local)
4. `pnpm db:generate`
5. `pnpm db:migrate`
6. `pnpm dev`

## Variables d'environnement

```bash
# packages/app/.env.local

# GitHub Personal Access Token (requis) — scope : public_repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Clé API Dev.to (optionnelle)
DEVTO_API_KEY=

# Base de données (Docker local ou Neon en prod)
DATABASE_URL=postgresql://user:password@localhost:5433/streamline

# NextAuth
AUTH_SECRET=                        # openssl rand -base64 32
AUTH_GITHUB_ID=                     # GitHub OAuth App
AUTH_GITHUB_SECRET=
```

## Architecture monorepo

| Package | Nom | Rôle |
|---------|-----|------|
| `packages/app` | `@zelian/app` | Application Next.js 15 (App Router + Server Actions) |

```
packages/app/src/
├── app/
│   ├── page.tsx                  ← Dashboard (Server Component, fetch parallèle 4 sources)
│   ├── layout.tsx                ← Layout global (sidebar, theme, anti-FOUC)
│   ├── (auth)/                   ← Pages /login et /register
│   ├── api/                      ← Route Handlers
│   │   ├── search/               ← GET  /api/search?q=
│   │   ├── releases/             ← GET  /api/releases?repos=
│   │   ├── rss/                  ← GET  /api/rss?url=
│   │   └── summarize/            ← POST /api/summarize (GitHub Models / gpt-4o-mini)
│   ├── article/[id]/             ← Détail article Dev.to (ISR 1h)
│   ├── repo/[id]/                ← Détail repo GitHub + README (ISR 1h)
│   ├── hn/[id]/                  ← Détail story Hacker News
│   ├── release/[...slug]/        ← Notes de version GitHub
│   └── settings/                 ← Page paramètres (5 onglets)
├── components/                   ← Composants UI (TechCard, AppShell, FilterPanel…)
├── hooks/                        ← Hooks React (useFilters, useFavorites, useHistory…)
├── lib/                          ← Intégrations API (github.ts, devto.ts, hackernews.ts…)
├── actions/                      ← Server Actions (profile.ts : updateProfile, changePassword…)
└── types/                        ← Types TypeScript partagés
```

## Stack technique

### Frontend
Next.js 15 (App Router, React 19) · TypeScript 5 strict · Tailwind CSS 4 · Zod v4 · Framer Motion

### Backend
Server Components pour les fetches externes · Server Actions pour les mutations (profil, auth) · Route Handlers pour search, RSS, releases et résumés IA

### Sources de données
| Source | Lib | Clé requise |
|--------|-----|-------------|
| GitHub Trending | `lib/github.ts` | `GITHUB_TOKEN` |
| Dev.to | `lib/devto.ts` | `DEVTO_API_KEY` (optionnelle) |
| Hacker News | `lib/hackernews.ts` (Algolia) | non |
| GitHub Releases | `lib/github-releases.ts` | `GITHUB_TOKEN` |
| Flux RSS | `lib/rss.ts` (fast-xml-parser) | non |
| Résumés IA | `POST /api/summarize` (GitHub Models) | `GITHUB_TOKEN` |

### Persistance
- **localStorage** — favoris, read-later, historique, recherches récentes, feeds RSS, repos surveillés
- **Neon PostgreSQL + Prisma 6** — comptes utilisateurs, synchronisation cloud (migration automatique localStorage → cloud à l'inscription)

### Auth
NextAuth v5 · GitHub OAuth · Email + mot de passe (bcryptjs) · Révocation de sessions via `tokenVersion`

### Infra
Docker (PostgreSQL 16 local, port 5433) · Déploiement Vercel (`vercel.json` à la racine)

## Fonctionnalités

- **Dashboard** 5 onglets : Dev.to · GitHub · Tout · À lire · Favoris
- **Sidebar globale** rétractable avec navigation et accès rapide aux paramètres
- **Recherche** avec autocomplétion (historique + tags + titres)
- **Filtres** par source, tags prédéfinis et tags custom
- **Repos GitHub personnalisés** et **flux RSS** ajoutables depuis le FilterPanel
- **Dark mode** persisté (anti-FOUC via script inline dans layout)
- **Notifications** de nouveaux contenus avec redirection vers la carte concernée
- **Statistiques** de consultation (aujourd'hui / semaine / mois / par source)
- **Résumés IA** (GitHub Models, gpt-4o-mini) sur les pages détail
- **Settings** : profil · sécurité · historique · export de données · suppression de compte

## Commandes

```bash
# Développement
pnpm dev                    # Next.js (port 3000)

# Build
pnpm build
pnpm start

# Base de données
pnpm db:generate            # Prisma generate
pnpm db:migrate             # Prisma migrate dev
pnpm db:studio              # Prisma Studio

# Qualité
pnpm lint                   # ESLint
pnpm typecheck              # tsc --noEmit
pnpm test                   # Vitest
pnpm test:e2e               # Playwright
```

## Documentation

```
docs/
├── specs/          ← Spécifications par feature (dashboard, auth, settings…)
├── adr/            ← Architecture Decision Records
└── architecture/
    └── database/   ← Schéma BDD (schema.md)
```

> Ce projet a été initialisé avec le framework Zelian (`/zelian:init zelian-starter`).
