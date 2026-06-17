# Rules Next.js 16 — Zelian

> Charger sur tout projet Next.js. Adapté pour Next.js 16 + App Router + React 19.

## Structure

- App Router (`app/`) obligatoire — PAS de Pages Router
- `src/actions/` — Server Actions (TOUTES les mutations passent ici)
- `src/modules/<feature>/` — logique métier par feature (services, types, hooks)
- `src/components/` — composants UI réutilisables (fournis par le Design)
- `app/api/` — Route Handlers UNIQUEMENT pour les webhooks externes
- `src/lib/` — utilitaires
- `src/hooks/` — hooks React custom
- `src/types/` — types TypeScript partagés
- `prisma/` — schéma et migrations

## Conventions

- TypeScript strict (`strict: true` dans tsconfig, zéro `any`, zéro `as unknown as`)
- Server Components par défaut — `"use client"` uniquement si nécessaire
- **Server Actions pour TOUTES les mutations** — PAS de fetch POST côté client
- **Route Handlers UNIQUEMENT pour les webhooks** (Resend, Stripe, etc.)
- Un composant par fichier
- Nommage : PascalCase pour les composants, camelCase pour les fonctions/variables

## Styling / UI

**Aucun framework CSS n'est pré-installé.** Le styling et les composants UI seront fournis par le Design choisi via `/zelian:init zelian-starter <DESIGN>`. Ne pas installer de framework CSS (Tailwind, Bootstrap, etc.) dans ce template.

## Commandes utiles

```bash
pnpm dev                  # Next.js dev (port 3000)
pnpm build                # Build production
pnpm start                # Production
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit
```

## Tests

- Vitest 4 pour unitaires + intégration
- Playwright 1.58 pour E2E (Chromium)

## Performance

- Utiliser `next/image` pour les images
- Utiliser `next/font` pour les polices
- Lazy loading avec `dynamic()` pour les composants lourds
- Cache : ISR ou `revalidate` sur les fetch côté serveur

## Sécurité

- Variables d'env : `NEXT_PUBLIC_*` uniquement pour le client (Supabase URL + anon key)
- `SUPABASE_SERVICE_ROLE_KEY` — JAMAIS préfixé `NEXT_PUBLIC_`
- Validation Zod sur toute donnée entrante
- CSRF : géré par Next.js pour les Server Actions
- Upload fichiers : toujours via signed URL Supabase, jamais de transit par Next.js
