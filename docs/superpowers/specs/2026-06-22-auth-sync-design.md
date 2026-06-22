# Auth + Sync Cloud — Design Spec

> **Date :** 2026-06-22
> **Module :** auth-sync
> **Statut :** Validé

---

## Objectif

Ajouter l'authentification et la synchronisation cloud à Streamline. Les utilisateurs peuvent utiliser l'app sans compte (localStorage), créer un compte pour synchroniser leurs données sur tous leurs appareils, ou se connecter via GitHub OAuth.

---

## Décisions clés

| Décision | Choix |
|---|---|
| Auth modes | GitHub OAuth + Email/mot de passe (Credentials) |
| Auth optionnelle | Oui — l'app fonctionne sans compte (localStorage) |
| Backend | NextAuth v5 (Auth.js) + Neon (PostgreSQL) + Prisma |
| Pattern | Storage Adapter — abstraction du stockage (local vs cloud) |
| Migration | Nouveau compte → importe localStorage en cloud |
| Compte existant | Données cloud prioritaires, localStorage ignoré |
| Pages auth | `/login` et `/register` séparées (split layout) |

---

## Architecture générale

```
NAVIGATEUR
  DashboardClient
    └── useFavorites() / useReadLater() / useWatchedRepos() / ...
          └── useStorageAdapter()
                ├── anonyme  → LocalStorageAdapter
                └── connecté → CloudAdapter

SERVEUR Next.js
  auth.ts                      ← NextAuth v5 config
  actions/favorites.ts         ← Server Actions mutations
  actions/read-later.ts
  actions/watched-repos.ts
  actions/watched-feeds.ts
  actions/history.ts
  actions/preferences.ts
  actions/migrate.ts           ← import localStorage → cloud
  lib/db.ts                    ← Prisma client

NEON (PostgreSQL)
  users / sessions / accounts / favorites / read_later /
  history / watched_repos / watched_feeds / user_preferences /
  recent_searches / verification_tokens
```

---

## Schéma de base de données (Prisma)

### Tables Auth.js (générées automatiquement par l'adaptateur)
- `User` — id, email, name, image, password (nullable), createdAt
- `Account` — OAuth providers (GitHub)
- `Session` — sessions actives
- `VerificationToken` — tokens email

### Tables métier
- `Favorite` — userId, itemId, itemData (JSON), createdAt | UNIQUE(userId, itemId)
- `ReadLater` — userId, itemId, itemData (JSON), createdAt | UNIQUE(userId, itemId)
- `History` — userId, itemId, title, source, detailPath, visitedAt
- `WatchedRepo` — userId, repo (string), createdAt | UNIQUE(userId, repo)
- `WatchedFeed` — userId, url (string), createdAt | UNIQUE(userId, url)
- `UserPreferences` — userId (unique), filterSources (JSON), filterTags (JSON), theme
- `RecentSearch` — userId, query, createdAt

**Note :** `itemData JSON` stocke la carte TechItem complète pour affichage sans rappel API. `password` est null pour les comptes GitHub OAuth.

---

## Pattern Adapter

### Interface commune

```typescript
// lib/storage/adapter.ts
interface StorageAdapter {
  getFavorites(): Promise<TechItem[]>
  addFavorite(item: TechItem): Promise<void>
  removeFavorite(id: string): Promise<void>

  getReadLater(): Promise<TechItem[]>
  addReadLater(item: TechItem): Promise<void>
  removeReadLater(id: string): Promise<void>

  getWatchedRepos(): Promise<string[]>
  addWatchedRepo(repo: string): Promise<void>
  removeWatchedRepo(repo: string): Promise<void>

  getWatchedFeeds(): Promise<string[]>
  addWatchedFeed(url: string): Promise<void>
  removeWatchedFeed(url: string): Promise<void>

  getHistory(): Promise<HistoryEntry[]>
  addHistory(entry: HistoryEntry): Promise<void>

  getRecentSearches(): Promise<string[]>
  addRecentSearch(query: string): Promise<void>

  getPreferences(): Promise<UserPreferences>
  savePreferences(prefs: UserPreferences): Promise<void>
}
```

### Sélection de l'adaptateur

```typescript
// hooks/useStorageAdapter.ts
export function useStorageAdapter(): StorageAdapter {
  const { data: session } = useSession()
  return session?.user ? cloudAdapter : localStorageAdapter
}
```

### LocalStorageAdapter
Refactorisation du code existant dans les hooks. Mêmes clés localStorage, même logique — encapsulée dans la classe.

### CloudAdapter
Chaque méthode appelle soit :
- Un **Server Action** pour les mutations (add/remove)
- Un **Route Handler GET** pour les lectures

---

## Flows utilisateur

### Inscription email/mdp (nouveau compte)
1. `/register` — saisit email + mdp + confirmation
2. Server Action `createUser()` :
   - Vérifie unicité email
   - Hache le mdp avec bcrypt
   - Crée le `User` en base
   - Lit le localStorage (toutes les clés)
   - Importe tout en base via `migrate()`
   - Connecte automatiquement
3. Redirige vers `/`

### Inscription GitHub (nouveau compte)
1. `/register` → "Continuer avec GitHub"
2. OAuth flow GitHub → NextAuth crée le `User` + `Account`
3. Callback `signIn()` déclenche `migrate()` (importe localStorage)
4. Redirige vers `/`

### Connexion compte existant
1. `/login` → email/mdp ou GitHub
2. NextAuth vérifie credentials
3. Session créée → CloudAdapter actif
4. localStorage ignoré (données cloud chargées)
5. Redirige vers `/`

### Sans compte
1. `/login` ou `/register` → "Continuer sans compte"
2. Redirige vers `/`
3. LocalStorageAdapter utilisé comme avant

### Déconnexion
1. Header → "Se déconnecter"
2. NextAuth détruit la session
3. Retour au LocalStorageAdapter
4. Données cloud conservées en base pour la prochaine connexion

---

## Pages auth

### Layout commun `/login` et `/register` — Split screen

```
┌─────────────────────┬──────────────────────────┐
│  ⚡ Streamline      │  [Titre page]            │
│                     │                          │
│  "Votre veille      │  [⬡ Continuer avec GitHub]│
│  tech, partout,     │                          │
│  sur tous vos       │   ── ou ──               │
│  appareils"         │                          │
│                     │  Email [____________]    │
│  [aperçu animé      │  Mdp   [____________]    │
│   des cartes]       │                          │
│                     │  [  Bouton action  ]     │
│                     │                          │
│                     │  Lien vers l'autre page  │
│                     │  → Continuer sans compte │
└─────────────────────┴──────────────────────────┘
```

| | `/login` | `/register` |
|---|---|---|
| Titre | "Se connecter" | "Créer un compte" |
| Champs | Email + Mdp | Email + Mdp + Confirmation |
| Lien | "Pas de compte ? → S'inscrire" | "Déjà un compte ? → Se connecter" |
| Mobile | Panel gauche masqué, formulaire centré | Idem |

### Indicateur dans le header dashboard

```
Anonyme :   [ Se connecter ]         ← bouton
Connecté :  [avatar] Prénom ▾        ← menu (profil / déconnexion)
```

---

## Nouveaux fichiers

```
packages/app/src/
├── auth.ts                                  ← NextAuth v5 config (providers, adapter, callbacks)
├── middleware.ts                            ← Session refresh middleware
├── app/
│   ├── api/auth/[...nextauth]/route.ts      ← Route handler Auth.js
│   └── (auth)/
│       ├── layout.tsx                       ← Layout auth (fond centré)
│       ├── login/page.tsx                   ← Page connexion
│       └── register/page.tsx               ← Page inscription
├── actions/
│   ├── favorites.ts
│   ├── read-later.ts
│   ├── watched-repos.ts
│   ├── watched-feeds.ts
│   ├── history.ts
│   ├── preferences.ts
│   ├── recent-searches.ts
│   └── migrate.ts                          ← Migration localStorage → cloud
├── lib/
│   ├── db.ts                               ← Prisma client singleton
│   └── storage/
│       ├── adapter.ts                      ← Interface StorageAdapter
│       ├── local.ts                        ← LocalStorageAdapter
│       └── cloud.ts                        ← CloudAdapter
├── hooks/
│   └── useStorageAdapter.ts                ← Sélection adaptateur selon session
└── prisma/
    └── schema.prisma                       ← Schéma BDD complet
```

## Fichiers modifiés

```
packages/app/src/hooks/
  useFavorites.ts         ← utilise StorageAdapter
  useReadLater.ts         ← utilise StorageAdapter
  useWatchedRepos.ts      ← utilise StorageAdapter
  useWatchedFeeds.ts      ← utilise StorageAdapter
  useHistory.ts           ← utilise StorageAdapter
  useFilters.ts           ← utilise StorageAdapter (préférences)
  useRecentSearches.ts    ← utilise StorageAdapter

packages/app/src/components/
  DashboardClient.tsx     ← bouton connexion / avatar utilisateur dans header
```

---

## Variables d'environnement requises

```bash
# .env.local
DATABASE_URL=postgresql://...         # URL Neon
AUTH_SECRET=...                       # Clé secrète NextAuth (openssl rand -base64 32)
AUTH_GITHUB_ID=...                    # GitHub OAuth App Client ID
AUTH_GITHUB_SECRET=...               # GitHub OAuth App Client Secret
```

---

## Dépendances à installer

```bash
pnpm --filter @zelian/app add next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
pnpm --filter @zelian/app add -D @types/bcryptjs prisma
```
