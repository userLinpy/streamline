# ADR-003 — Absence de base de données (MVP)

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-003                        |
| Statut     | Superseded (2026-06-22)        |
| Date       | 2026-06-17                     |
| Auteur(s)  | Lin                            |
| Owner      | Lin                            |
| Décideurs  | Lin                            |
| Contexte   | Phase 1 — Init projet          |
| Remplace   | —                              |
| Remplacé par | feat/auth-sync-cloud — Prisma 6 + Neon PostgreSQL ajoutés en v0.2.0 |

## Contexte

Le template zelian-starter inclut une configuration PostgreSQL + Prisma. Pour Streamline (MVP), une base de données n'est pas nécessaire : les données affichées viennent entièrement des APIs GitHub et Dev.to, et les favoris (bookmarks) peuvent être stockés dans le localStorage du navigateur.

## Décision

**Pas de base de données pour le MVP.** Les fichiers de configuration Prisma et Docker sont conservés dans le repo (héritage du template) mais non utilisés. La feature bookmarks utilise le `localStorage` côté client.

## Options considérées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| Pas de BDD — localStorage pour favoris (choisi) | Simple, zéro infrastructure | Favoris non synchronisés entre appareils |
| PostgreSQL + Prisma | Favoris persistants multi-appareils | Complexité infrastructure, auth nécessaire |
| SQLite local | Léger | Pas adapté à un déploiement serverless (Vercel) |

## Option choisie

**Aucune base de données pour le MVP.** Objectif : livrer rapidement une application fonctionnelle. La BDD pourra être ajoutée en v2 si la feature bookmarks multi-appareils devient nécessaire.

## Conséquences

- Fichiers `prisma/`, `docker-compose.yml`, `packages/shared/lib/prisma.ts` présents mais inutilisés pour le MVP
- Feature bookmarks = `localStorage` uniquement (données perdues si changement de navigateur)
- Pas de `pnpm db:*` à lancer pour démarrer le projet
- Migration vers BDD possible en v2 sans refonte majeure (ajout d'une API Route + Prisma)
