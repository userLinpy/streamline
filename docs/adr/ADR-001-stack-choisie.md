# ADR-001 — Stack technique choisie

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-001                        |
| Statut     | Accepté                        |
| Date       | 2026-04-07                     |
| Auteur(s)  | Anthony (Zelian)               |
| Owner      | Anthony (Zelian)               |
| Décideurs  | Anthony                        |
| Contexte   | Phase 1 — Init projet          |
| Remplace   | —                              |

## Contexte

Ce projet a été initialisé avec le template **zelian-starter** du framework Zelian. La stack technique est un monorepo pnpm avec Next.js 16 (App Router + Server Actions), PostgreSQL 16, Prisma 6 (multiSchema avec RLS), et Supabase Cloud pour l'authentification JWT uniquement. Ce canevas sera complété en Phase 2 avec les justifications détaillées.

## Stack retenue

### Frontend
- Next.js 16 (App Router, React 19) — TypeScript 5 strict
- Zod v4 (validation)
- Aucun framework CSS — fourni par le Design

### Backend
- Node.js 20 via Next.js Server Actions (mutations) + Route Handlers (webhooks)
- Prisma 6 multiSchema (public + onboarding)
- 2 clients : prismaUser (RLS) + prismaService (bypass)
- pdf-lib, Resend v4, AES-256-GCM, Better Stack

### Base de données
- PostgreSQL 16 (Docker local port 5433)
- 2 schémas : public (users, permissions) + onboarding (parcours, steps, etc.)
- RLS via wrapper withRLS()

### Auth
- Supabase Cloud (auth JWT uniquement, ne touche pas à la BDD)
- MFA/TOTP (AAL2 pour manage_permissions)

### Infra
- Prod : Hetzner VPS CX23 + Coolify + Caddy + Cloudflare DNS
- CI/CD : GitHub Actions → types → tsc → vitest → prisma migrate → build → Coolify

## Options considérées

> À compléter en Phase 2.

| Option | Description | Effort estimé | Avantages | Inconvénients |
|--------|-------------|---------------|-----------|---------------|
| — | — | — | — | — |

## Option choisie

> À compléter en Phase 2.

## Conséquences

> À compléter en Phase 2.
