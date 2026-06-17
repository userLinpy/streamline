# CLAUDE.md — Streamline

> Version : 0.1.0 — 2026-06-17
> Framework Zelian : `framework_version: v2`

## Description

**Streamline** est un cockpit de veille technologique. Il agrège les tendances GitHub et les articles Dev.to dans une interface Bento Grid épurée. Objectif : remplacer la navigation entre plusieurs plateformes par un tableau de bord unique.

## Stack

### Frontend
- **Framework :** Next.js 15+ (App Router, React 19)
- **Language :** TypeScript 5 strict (noImplicitAny, zéro `as unknown as`)
- **Styling / UI :** Tailwind CSS 4
- **Validation :** Zod v4

### Backend
- **Runtime :** Node.js 20 (via Next.js Server Components + Route Handlers)
- **Pattern :** Server Components pour les appels API externes — Route Handlers pour les endpoints internes
- **Pas de base de données** pour le MVP — les données viennent exclusivement des APIs externes
- **Emails :** non applicable
- **Logging :** console en dev, à évaluer en prod

### APIs externes
- **GitHub API** — repositories trending (Personal Access Token, côté serveur uniquement)
- **Dev.to API** — articles techniques (clé API optionnelle, côté serveur)

### Auth
- **Aucune authentification** pour le MVP

### Déploiement
- **À définir** (Vercel recommandé pour Next.js)

## Setup initial

```bash
# 1. Variables d'environnement
cp .env.example .env.local

# 2. Installation
pnpm install

# 3. Démarrage
pnpm dev
```

## Variables d'environnement requises

```bash
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx   # Personal Access Token GitHub
DEVTO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx  # Clé API Dev.to (optionnelle)
```

## Commandes

```bash
# Développement
pnpm dev                    # Next.js (port 3000)

# Build
pnpm build
pnpm start

# Qualité
pnpm lint
pnpm typecheck              # tsc --noEmit

# Tests
pnpm test                   # Vitest
pnpm test:e2e               # Playwright
```

## Structure

```
packages/app/src/
├── app/
│   ├── page.tsx                  ← Dashboard (Server Component)
│   ├── layout.tsx                ← Layout global
│   ├── repo/[id]/page.tsx        ← Détail dépôt GitHub
│   ├── article/[id]/page.tsx     ← Détail article Dev.to
│   └── bookmarks/page.tsx        ← Favoris (bonus)
├── components/
│   ├── TechCard.tsx              ← Carte principale
│   ├── SearchBar.tsx             ← Barre de recherche ("use client")
│   ├── StatusBadge.tsx           ← Badge GitHub / Article / Tutorial
│   └── LoadingSkeleton.tsx       ← Squelette de chargement
├── lib/
│   ├── github.ts                 ← Fonctions appel GitHub API
│   └── devto.ts                  ← Fonctions appel Dev.to API
└── types/
    └── index.ts                  ← Types partagés
```

## Rules actives

- @.claude/rules/00-global.md
- @.claude/rules/02-nextjs.md
- @.claude/rules/04-testing.md
- @.claude/rules/05-git-workflow.md
- @.claude/rules/06-adr-policy.md

## Modules

| Module | Spec technique | ADRs |
|--------|---|---|
| dashboard | — | — |
| github-feed | — | — |
| devto-feed | — | — |
| search | — | — |
| bookmarks | — | — |

## Conventions critiques

1. **Server Components par défaut** — `"use client"` uniquement pour les composants interactifs (SearchBar, boutons favoris)
2. **Appels API côté serveur uniquement** — les tokens ne doivent jamais être exposés côté client
3. **Zod sur toute donnée entrante** — valider les réponses des APIs externes
4. **TypeScript strict** — zéro `any`, zéro `as unknown as`
5. **Variables d'env sensibles** — jamais préfixées `NEXT_PUBLIC_`
