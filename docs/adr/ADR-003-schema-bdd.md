# ADR-003 — Schéma base de données

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-003                        |
| Statut     | Proposé                        |
| Date       | 2026-04-07                     |
| Auteur(s)  | —                              |
| Owner      | —                              |
| Décideurs  | —                              |
| Contexte   | Phase 2 — Analyse technique    |
| Remplace   | —                              |

## Contexte

Ce projet utilise **PostgreSQL 16** avec **Prisma 6** en mode multiSchema (décision ADR-001). Deux schémas sont définis : `public` (users, permissions) et `onboarding` (parcours, steps, signatures, email_logs, profiles). Deux clients Prisma distincts assurent la séparation RLS (prismaUser) / bypass (prismaService). Ce canevas sera complété en Phase 2.

## Options considérées

> À compléter en Phase 2.

| Option | Description | Effort estimé | Avantages | Inconvénients |
|--------|-------------|---------------|-----------|---------------|
| — | — | — | — | — |

## Option choisie

> À compléter en Phase 2.

## Conséquences

> À compléter en Phase 2.
