# zelian-starter

> Template technique Zelian (sans design) — Monorepo pnpm · Next.js 16 · PostgreSQL 16 · Prisma 6 · Supabase Auth

## Démarrage rapide

1. Copier `.env.example` en `.env` et configurer les variables
2. `pnpm install`
3. `docker compose up -d` (PostgreSQL + pgAdmin)
4. `pnpm db:generate`
5. `pnpm db:migrate`
6. `pnpm dev`

## Architecture monorepo

| Package | Nom | Rôle |
|---------|-----|------|
| `packages/shared` | `@zelian/shared` | Libs partagées : Prisma, Supabase, Email, Crypto, Logger, Env |
| `packages/app` | `@zelian/app` | Application Next.js 16 (App Router + Server Actions) |

## Stack technique

### Frontend
Next.js 16 (App Router, React 19) · TypeScript 5 strict · Zod v4 · Aucun framework CSS pré-installé

### Backend
Node.js 20 via Server Actions (mutations) + Route Handlers (webhooks) · Prisma 6 multiSchema (public + onboarding) · 2 clients (prismaUser RLS + prismaService bypass) · pdf-lib · Resend v4 · AES-256-GCM · Better Stack

### BDD
PostgreSQL 16 (Docker local:5433) · 2 schémas · RLS via withRLS()

### Auth
Supabase Cloud (auth JWT uniquement, ne touche PAS à la BDD) · MFA/TOTP

### Infra
Hetzner VPS CX23 · Coolify · Caddy (SSL auto) · Cloudflare DNS

## Documentation Zelian

La documentation projet se trouve dans `docs/` :

- `docs/specs/` — Spécifications fonctionnelles par feature
- `docs/adr/` — Architecture Decision Records
- `docs/architecture/database/` — Schéma BDD
- `CLAUDE.md` — Configuration projet pour Claude Code

> Ce projet a été initialisé avec le framework Zelian (`/zelian:init zelian-starter`).
> Le design UI sera ajouté séparément via `/zelian:init zelian-starter <DESIGN>`.
