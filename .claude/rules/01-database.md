# Rules base de données — Zelian (PostgreSQL + Prisma multiSchema)

> Charger sur tout projet utilisant une BDD. Adapté pour PostgreSQL 16 + Prisma 6 multiSchema.

## Règles absolues

1. Toute modification de schéma → créer une migration (jamais modifier la BDD à la main)
2. Migrations datées, numérotées et versionées avec le code
3. Jamais de DROP TABLE en production — utiliser des « soft deletes » si nécessaire
4. Index sur toutes les foreign keys et colonnes de recherche (WHERE, JOIN)
5. Schéma lisible humainement à jour dans `docs/architecture/database/schema.md`

## Architecture multi-schéma

- **Schéma `public`** — users, permissions (tables partagées)
- **Schéma `onboarding`** — parcours, steps, signatures, email_logs, profiles (métier)
- **2 clients Prisma distincts :**
  - `prismaUser` — RLS activée, pour les Server Actions utilisateur
  - `prismaService` — Bypass RLS, pour les crons et webhooks système

## Pattern RLS obligatoire

Toute requête utilisateur DOIT passer par le wrapper `withRLS` :

```typescript
withRLS(userId, async (tx) => {
  // SET request.jwt.sub = userId en début de transaction
  return tx.parcours.findMany(...)
})
```

Ne JAMAIS utiliser `prismaUser` en dehors de `withRLS()`.

## Nommage

- Tables : `snake_case` pluriel
- Colonnes : `snake_case`
- PK : `id`
- FK : `<table_singulier>_id`
- Booléens : préfixe `is_` ou `has_`
- Timestamps : `created_at`, `updated_at`
- Soft delete : `deleted_at` (nullable)

## Migrations (Prisma 6)

```bash
pnpm db:migrate              # prisma migrate dev
pnpm db:generate             # prisma generate (regénère les 2 clients)
pnpm db:studio               # prisma studio
pnpm db:push                 # prisma db push (dev only, sans historique)
```
