# Rules Node.js (Server Actions + Route Handlers) — Zelian

> Charger sur tout projet Node.js. Adapté pour le pattern Next.js Server Actions.
> Copié depuis le plugin `zelian-framework` par `/zelian:init` — ne pas modifier au projet.

## Structure imposée

```
src/
├── actions/            # Server Actions — TOUTES les mutations
│   ├── auth.ts         # login, logout, signup, resetPassword
│   ├── parcours.ts     # CRUD parcours
│   ├── signatures.ts   # signature, génération PDF
│   └── ...
├── modules/            # Logique métier par feature
│   └── <feature>/
│       ├── <feature>.service.ts      # Logique métier
│       ├── <feature>.repository.ts   # Accès données (optionnel)
│       ├── <feature>.dto.ts          # Validation Zod entrée/sortie
│       └── <feature>.types.ts        # Types spécifiques
├── lib/
│   └── utils.ts        # cn() et utilitaires
└── app/api/            # Route Handlers — webhooks UNIQUEMENT
    └── webhooks/
        └── resend/
            └── route.ts
```

## Conventions

1. **TypeScript strict** — `strict: true`, pas de `any`, pas de `as unknown as`
2. **async/await** partout — pas de callbacks, pas de `.then()` chaîné
3. **Zod sur TOUTE donnée entrante** — jamais de données non validées
4. **Server Actions = mutations** — chaque action exporte une fonction `"use server"`
5. **Route Handlers = webhooks** — jamais de logique métier dans les Route Handlers
6. **pdf-lib pour les PDFs** — jamais Puppeteer
7. **Resend + React Email pour les emails** — via le wrapper `@zelian/shared/lib/email.ts`
8. **AES-256-GCM pour les données sensibles** — via `@zelian/shared/lib/crypto.ts`

## Tests

- Framework : **Vitest 4** (choix documenté dans ADR)
- Tests d'intégration : RLS policies, withRLS(), crypto.ts
- Couverture : schémas Zod + logique métier (services) + Server Actions critiques
- Nommage : `<feature>.service.test.ts`, `<feature>.action.test.ts`

## Commandes standard

```bash
pnpm dev                   # Next.js dev (inclut Server Actions)
pnpm test                  # Vitest
pnpm test:coverage         # Vitest avec couverture
pnpm typecheck             # tsc --noEmit
pnpm lint                  # ESLint
```

## Base de données

- ORM : **Prisma 6** (multiSchema : public + onboarding)
- 2 clients : `prismaUser` (RLS) + `prismaService` (bypass)
- Pattern obligatoire : `withRLS(userId, async (tx) => { ... })`
- Migrations versionnées et commitées
- Pas de requêtes SQL brutes hors du wrapper withRLS/prismaService

## Sécurité

- Rate limiting sur les webhooks
- Validation Zod sur toutes les entrées
- Chiffrement AES-256-GCM pour les données sensibles (SSN)
- CORS géré par Next.js
- Signed URLs Supabase Storage pour les uploads (jamais de transit serveur)
