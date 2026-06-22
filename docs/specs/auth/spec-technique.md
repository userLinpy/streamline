# Spec technique — auth

| Champ | Valeur |
|---|---|
| **Feature** | auth |
| **Statut** | Implémenté |
| **Date** | 2026-06-22 |
| **Auteur** | Lin |
| **Version** | 0.2.0 |

---

## Architecture

L'authentification est optionnelle. L'application fonctionne sans compte (localStorage) et bascule en mode cloud dès qu'une session est active. L'abstraction est portée par le **Pattern Adapter** : une interface `StorageAdapter` commune, deux implémentations (`LocalStorageAdapter` / `CloudAdapter`), sélection automatique dans `useStorageAdapter` selon l'état de session NextAuth.

```
NAVIGATEUR
  DashboardClient
    └── useFavorites() / useReadLater() / useWatchedRepos() /
        useWatchedFeeds() / useHistory() / useFilters() / useRecentSearches()
              └── useStorageAdapter()
                    ├── anonyme  → LocalStorageAdapter
                    └── connecté → CloudAdapter

SERVEUR Next.js
  auth.ts                      ← NextAuth v5 config (GitHub OAuth + Credentials, database strategy)
  middleware.ts                ← Session refresh middleware (matcher : / + routes protégées)
  app/api/auth/[...nextauth]/route.ts  ← Route handler NextAuth
  actions/favorites.ts         ← Server Actions CRUD favoris
  actions/read-later.ts        ← Server Actions CRUD read-later
  actions/watched-repos.ts     ← Server Actions CRUD repos surveillés
  actions/watched-feeds.ts     ← Server Actions CRUD flux RSS
  actions/history.ts           ← Server Actions historique (2 mois max, 500 entrées)
  actions/preferences.ts       ← Server Actions préférences/filtres
  actions/recent-searches.ts   ← Server Actions recherches récentes (max 10)
  actions/migrate.ts           ← Migration localStorage → cloud (type LocalStorageSnapshot)
  actions/auth.ts              ← createUser (Zod v4, bcrypt hash)
  lib/db.ts                    ← PrismaClient singleton

NEON (PostgreSQL)
  Schéma : 11 modèles (voir section "Schéma BDD")
```

---

## Stack

| Dépendance | Version | Rôle |
|---|---|---|
| `next-auth` | v5 beta | Gestion auth (providers, session, callbacks) |
| `@auth/prisma-adapter` | latest | Adaptateur Prisma pour Auth.js v5 |
| `prisma` | 6 | ORM + migrations |
| `@prisma/client` | 6 | Client généré |
| `bcryptjs` | v3 | Hash mot de passe (Credentials provider) |
| `@types/bcryptjs` | — | Types TypeScript bcryptjs |
| `zod` | v4 | Validation entrées Server Actions (`.issues` au lieu de `.errors`) |
| Neon | — | PostgreSQL serverless (cloud) |

---

## Fichiers

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/prisma/schema.prisma` | 11 modèles Prisma (Auth.js + métier) |
| `packages/app/src/auth.ts` | NextAuth v5 config (GitHub OAuth + Credentials, database strategy, `'use server'`) |
| `packages/app/src/middleware.ts` | Session refresh middleware |
| `packages/app/src/types/next-auth.d.ts` | Augmentation `Session.user.id` |
| `packages/app/src/lib/db.ts` | PrismaClient singleton |
| `packages/app/src/lib/storage/adapter.ts` | Interface `StorageAdapter` (21 méthodes) |
| `packages/app/src/lib/storage/local.ts` | `LocalStorageAdapter` (wrapping clés localStorage existantes) |
| `packages/app/src/lib/storage/cloud.ts` | `CloudAdapter` (délègue aux Server Actions) |
| `packages/app/src/hooks/useStorageAdapter.ts` | Sélection adaptateur selon session |
| `packages/app/src/actions/favorites.ts` | Server Actions CRUD favoris (`'use server'`) |
| `packages/app/src/actions/read-later.ts` | Server Actions CRUD read-later (`'use server'`) |
| `packages/app/src/actions/watched-repos.ts` | Server Actions CRUD repos surveillés (`'use server'`) |
| `packages/app/src/actions/watched-feeds.ts` | Server Actions CRUD flux RSS (`'use server'`) |
| `packages/app/src/actions/history.ts` | Server Actions historique — purge 2 mois / max 500 entrées (`'use server'`) |
| `packages/app/src/actions/preferences.ts` | Server Actions préférences/filtres (`'use server'`) |
| `packages/app/src/actions/recent-searches.ts` | Server Actions recherches récentes — max 10 FIFO (`'use server'`) |
| `packages/app/src/actions/migrate.ts` | Migration localStorage → cloud (`LocalStorageSnapshot`, `'use server'`) |
| `packages/app/src/actions/auth.ts` | `createUser` — validation Zod v4, hash bcrypt (`'use server'`) |
| `packages/app/src/app/api/auth/[...nextauth]/route.ts` | Route handler NextAuth |
| `packages/app/src/app/(auth)/layout.tsx` | Layout split-screen auth |
| `packages/app/src/app/(auth)/login/page.tsx` | Page login (GitHub + Credentials) |
| `packages/app/src/app/(auth)/register/page.tsx` | Page register (+ déclenchement migration localStorage) |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `packages/app/src/app/layout.tsx` | Ajout `SessionProvider` (next-auth/react) |
| `packages/app/src/components/DashboardClient.tsx` | Bouton login/logout + avatar utilisateur dans header |
| `packages/app/src/hooks/useFavorites.ts` | Refactorisé → `StorageAdapter` |
| `packages/app/src/hooks/useReadLater.ts` | Refactorisé → `StorageAdapter` |
| `packages/app/src/hooks/useWatchedRepos.ts` | Refactorisé → `StorageAdapter` |
| `packages/app/src/hooks/useWatchedFeeds.ts` | Refactorisé → `StorageAdapter` |
| `packages/app/src/hooks/useHistory.ts` | Refactorisé → `StorageAdapter` |
| `packages/app/src/hooks/useFilters.ts` | Refactorisé → `StorageAdapter` (garde exports `SourceFilters`, `Filters`, `PREDEFINED_TAGS`) |
| `packages/app/src/hooks/useRecentSearches.ts` | Refactorisé → `StorageAdapter` |

---

## Pattern Adapter

### Interface StorageAdapter

```typescript
// packages/app/src/lib/storage/adapter.ts
interface StorageAdapter {
  // Favoris
  getFavorites(): Promise<TechItem[]>
  addFavorite(item: TechItem): Promise<void>
  removeFavorite(id: string): Promise<void>

  // Read Later
  getReadLater(): Promise<TechItem[]>
  addReadLater(item: TechItem): Promise<void>
  removeReadLater(id: string): Promise<void>

  // Repos surveillés
  getWatchedRepos(): Promise<string[]>
  addWatchedRepo(repo: string): Promise<void>
  removeWatchedRepo(repo: string): Promise<void>

  // Flux RSS
  getWatchedFeeds(): Promise<string[]>
  addWatchedFeed(url: string): Promise<void>
  removeWatchedFeed(url: string): Promise<void>

  // Historique
  getHistory(): Promise<HistoryEntry[]>
  addHistory(entry: HistoryEntry): Promise<void>

  // Recherches récentes
  getRecentSearches(): Promise<string[]>
  addRecentSearch(query: string): Promise<void>

  // Préférences
  getPreferences(): Promise<UserPreferences>
  savePreferences(prefs: UserPreferences): Promise<void>
}
```

### Sélection de l'adaptateur

```typescript
// packages/app/src/hooks/useStorageAdapter.ts
export function useStorageAdapter(): StorageAdapter {
  const { data: session } = useSession()
  return session?.user ? cloudAdapter : localStorageAdapter
}
```

**Note tests** : les tests des hooks utilisent `vi.mock('./useStorageAdapter', ...)` pour éviter l'import de `next/server` dans Vitest.

### LocalStorageAdapter

Encapsule le code existant des hooks. Mêmes clés localStorage, même logique.

Clés conservées :
- `streamline_favorites`
- `streamline_read_later`
- `streamline-repos` (WatchedRepos)
- `streamline-feeds` (WatchedFeeds)
- `streamline-history`
- `streamline-filters` (UserPreferences)
- `streamline-searches` (RecentSearches)

### CloudAdapter

Chaque méthode délègue à un Server Action (`'use server'`). Les lectures (get\*) appellent directement les actions, les mutations (add\*/remove\*) idem.

---

## Server Actions — signatures

| Fichier | Exports |
|---|---|
| `actions/favorites.ts` | `getFavorites()`, `addFavorite(item)`, `removeFavorite(itemId)` |
| `actions/read-later.ts` | `getReadLater()`, `addReadLater(item)`, `removeReadLater(itemId)` |
| `actions/watched-repos.ts` | `getWatchedRepos()`, `addWatchedRepo(repo)`, `removeWatchedRepo(repo)` |
| `actions/watched-feeds.ts` | `getWatchedFeeds()`, `addWatchedFeed(url)`, `removeWatchedFeed(url)` |
| `actions/history.ts` | `getHistory()`, `addHistory(entry)` — purge auto 2 mois / 500 entrées max |
| `actions/preferences.ts` | `getPreferences()`, `savePreferences(prefs)` |
| `actions/recent-searches.ts` | `getRecentSearches()`, `addRecentSearch(query)` — max 10 FIFO |
| `actions/migrate.ts` | `migrate(snapshot: LocalStorageSnapshot)` |
| `actions/auth.ts` | `createUser({ email, password })` — hash bcrypt, Zod v4 |

---

## Schéma BDD

Voir `docs/architecture/database/schema.md` pour le détail complet.

### Tables Auth.js (gérées par @auth/prisma-adapter)

| Modèle | Clé primaire | Notes |
|---|---|---|
| `User` | `id` (cuid) | `password` nullable (null pour GitHub OAuth) |
| `Account` | `[provider, providerAccountId]` | OAuth GitHub |
| `Session` | `sessionToken` | Sessions actives |
| `VerificationToken` | `[identifier, token]` | Tokens email |

### Tables métier

| Modèle | Contrainte d'unicité | Notes |
|---|---|---|
| `Favorite` | `UNIQUE(userId, itemId)` | `itemData JSON` = TechItem complet |
| `ReadLater` | `UNIQUE(userId, itemId)` | `itemData JSON` = TechItem complet |
| `HistoryEntry` | — | Index `(userId, visitedAt)` pour purge |
| `WatchedRepo` | `UNIQUE(userId, repo)` | |
| `WatchedFeed` | `UNIQUE(userId, url)` | |
| `UserPreferences` | `userId UNIQUE` | `filterSources JSON`, `filterTags JSON` |
| `RecentSearch` | `UNIQUE(userId, query)` | Max 10 gérés en applicatif |

---

## Pages auth

| Route | Composant | Description |
|---|---|---|
| `/(auth)/login` | `login/page.tsx` | GitHub OAuth + Credentials (email/mdp) |
| `/(auth)/register` | `register/page.tsx` | Création compte + migration localStorage |
| `/(auth)/layout.tsx` | Layout split-screen | Panel gauche branding + panel droit formulaire |

### Layout split-screen

```
┌─────────────────────┬──────────────────────────┐
│  Streamline         │  [Titre page]             │
│  Branding           │  [GitHub OAuth button]    │
│  (masqué mobile)    │  ── ou ──                 │
│                     │  Email / Mdp / Confirm    │
│                     │  [Bouton action]          │
│                     │  Lien vers l'autre page   │
│                     │  Continuer sans compte    │
└─────────────────────┴──────────────────────────┘
```

---

## Flows utilisateur

### Inscription email/mdp
1. `/register` → `createUser()` : valide (Zod v4), hash bcrypt, insère User, appelle `migrate(snapshot)`, connecte automatiquement via NextAuth.

### Inscription GitHub OAuth
1. `/register` → GitHub OAuth flow → NextAuth crée `User` + `Account`, callback `signIn()` déclenche `migrate()`.

### Connexion compte existant
1. `/login` → NextAuth vérifie credentials → session créée → `CloudAdapter` actif → localStorage ignoré.

### Sans compte
Redirige vers `/` — `LocalStorageAdapter` actif comme avant.

### Déconnexion
NextAuth détruit la session → retour `LocalStorageAdapter` → données cloud conservées en base.

---

## Variables d'environnement

```bash
# .env.local (non versionné)
DATABASE_URL=postgresql://...         # URL Neon
AUTH_SECRET=...                       # Clé secrète NextAuth (openssl rand -base64 32)
AUTH_GITHUB_ID=...                    # GitHub OAuth App Client ID
AUTH_GITHUB_SECRET=...               # GitHub OAuth App Client Secret

# .env (non versionné, pour Prisma CLI uniquement)
DATABASE_URL=postgresql://...
```

---

## Tests

- 59 tests unitaires — 3 fichiers de tests storage
- Mock `useStorageAdapter` via `vi.mock('./useStorageAdapter', ...)` dans chaque test de hook
- Couverture : hooks refactorisés, LocalStorageAdapter, CloudAdapter, actions auth (createUser Zod)
