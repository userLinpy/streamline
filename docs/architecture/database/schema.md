# Schéma base de données — Streamline

| Champ | Valeur |
|---|---|
| **Provider** | Neon (PostgreSQL serverless) |
| **ORM** | Prisma 6 |
| **Schéma source** | `packages/app/prisma/schema.prisma` |
| **Dernière mise à jour** | 2026-06-22 |
| **Version feature** | 0.2.0 (auth+sync cloud) |

---

## Vue d'ensemble

Le schéma comprend 11 modèles répartis en deux groupes :

- **4 modèles Auth.js** — gérés automatiquement par `@auth/prisma-adapter`
- **7 modèles métier** — données utilisateur synchronisées depuis localStorage

---

## Modèles Auth.js

### User

Table centrale. Référencée par tous les modèles métier.

| Colonne | Type | Contrainte | Notes |
|---|---|---|---|
| `id` | String | PK, cuid() | |
| `name` | String? | nullable | |
| `email` | String | UNIQUE | |
| `emailVerified` | DateTime? | nullable | |
| `image` | String? | nullable | URL avatar GitHub |
| `password` | String? | nullable | `null` pour les comptes GitHub OAuth, hash bcrypt pour Credentials |
| `createdAt` | DateTime | default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

Relations : `accounts[]`, `sessions[]`, `favorites[]`, `readLater[]`, `history[]`, `watchedRepos[]`, `watchedFeeds[]`, `preferences?`, `recentSearches[]`

### Account

OAuth providers (GitHub).

| Colonne | Type | Contrainte | Notes |
|---|---|---|---|
| `userId` | String | FK → User | onDelete: Cascade |
| `type` | String | | `"oauth"` |
| `provider` | String | PK composite | ex: `"github"` |
| `providerAccountId` | String | PK composite | |
| `refresh_token` | String? | nullable | |
| `access_token` | String? | nullable | |
| `expires_at` | Int? | nullable | |
| `token_type` | String? | nullable | |
| `scope` | String? | nullable | |
| `id_token` | String? | nullable | |
| `session_state` | String? | nullable | |
| `createdAt` | DateTime | default(now()) | |
| `updatedAt` | DateTime | @updatedAt | |

PK : `@@id([provider, providerAccountId])`

### Session

Sessions actives (database strategy).

| Colonne | Type | Contrainte |
|---|---|---|
| `sessionToken` | String | UNIQUE |
| `userId` | String | FK → User, onDelete: Cascade |
| `expires` | DateTime | |
| `createdAt` | DateTime | default(now()) |
| `updatedAt` | DateTime | @updatedAt |

### VerificationToken

Tokens de vérification email.

| Colonne | Type | Contrainte |
|---|---|---|
| `identifier` | String | PK composite |
| `token` | String | PK composite |
| `expires` | DateTime | |

PK : `@@id([identifier, token])`

---

## Modèles métier

### Favorite

Favoris utilisateur. `itemData` stocke la carte `TechItem` complète pour affichage sans rappel API.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `itemId` | String | Identifiant de l'item (ex: ID GitHub/DevTo) |
| `itemData` | Json | TechItem sérialisé |
| `createdAt` | DateTime | default(now()) |

Index : `@@unique([userId, itemId])`, `@@index([userId])`

### ReadLater

Liste "À lire plus tard". Même structure que `Favorite`.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `itemId` | String | |
| `itemData` | Json | TechItem sérialisé |
| `createdAt` | DateTime | default(now()) |

Index : `@@unique([userId, itemId])`, `@@index([userId])`

### HistoryEntry

Historique des consultations. Purge automatique en applicatif : 2 mois max, 500 entrées max.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `itemId` | String | |
| `title` | String | |
| `source` | String | ex: `"github"`, `"devto"`, `"hackernews"` |
| `detailPath` | String | Route interne ex: `/repo/rails/rails` |
| `visitedAt` | DateTime | default(now()) |

Index : `@@index([userId])`, `@@index([userId, visitedAt])` (pour la purge par date)

### WatchedRepo

Repos GitHub surveillés par l'utilisateur.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `repo` | String | Format `owner/repo` |
| `createdAt` | DateTime | default(now()) |

Index : `@@unique([userId, repo])`, `@@index([userId])`

### WatchedFeed

Flux RSS surveillés par l'utilisateur.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `url` | String | URL du flux RSS/Atom |
| `createdAt` | DateTime | default(now()) |

Index : `@@unique([userId, url])`, `@@index([userId])`

### UserPreferences

Préférences et filtres utilisateur. Un seul enregistrement par utilisateur.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | UNIQUE, FK → User, onDelete: Cascade |
| `filterSources` | Json | État des toggles sources (github/devto/etc.) |
| `filterTags` | Json | Tags actifs |
| `createdAt` | DateTime | default(now()) |
| `updatedAt` | DateTime | @updatedAt |

### RecentSearch

Recherches récentes. Max 10 entrées par utilisateur, gérées en FIFO côté applicatif.

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | String | PK, cuid() |
| `userId` | String | FK → User, onDelete: Cascade |
| `query` | String | Texte de la recherche |
| `createdAt` | DateTime | default(now()) |

Index : `@@unique([userId, query])`, `@@index([userId])`

---

## Règles et invariants

- `password` est `null` pour les comptes GitHub OAuth — ne jamais supposer qu'il est renseigné
- `itemData JSON` dans `Favorite` et `ReadLater` contient le `TechItem` complet — pas de rappel API nécessaire à l'affichage
- `HistoryEntry` : purge automatique en applicatif (Server Action `addHistory`) — 2 mois glissants, max 500 entrées par utilisateur
- `RecentSearch` : max 10 entrées par utilisateur, FIFO géré en applicatif dans `addRecentSearch`
- Toutes les FK vers `User` ont `onDelete: Cascade` — supprimer un utilisateur supprime toutes ses données

---

## ADR liés

- [ADR-003](../../adr/ADR-003-schema-bdd.md) — Absence de BDD pour le MVP (superseded par cette feature)
