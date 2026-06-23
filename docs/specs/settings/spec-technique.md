---
feature: settings
version: 0.2.1
date: 2026-06-23
status: implemented
---

# Spec Technique — Settings

## Architecture

Page Server Component `/settings` accessible à tous — aucune redirection côté serveur. Onglets gérés côté client (`'use client'`). Mutations via Server Actions dans `src/actions/profile.ts`.

## Comportement auth

| Onglet | Accès sans connexion |
|--------|----------------------|
| Historique | Accessible — données stockées en localStorage, indépendantes du compte |
| Profil | Bloqué — affiche `AuthGate` (cadenas + message + lien `/login`) |
| Sécurité | Bloqué — affiche `AuthGate` |
| Données | Bloqué — affiche `AuthGate` |
| Zone Danger | Bloqué — affiche `AuthGate` |

`AuthGate` est un composant client inline dans `SettingsClient.tsx` — il remplace le contenu de l'onglet si `session` est null. Pas de redirection : l'utilisateur reste sur `/settings` et peut naviguer librement entre les onglets publics.

### Onglets

| Onglet | Contenu |
|--------|---------|
| Profil | Pseudo + photo de profil (URL) |
| Sécurité | Changer mdp (si email/password) + déconnecter tous appareils |
| Historique | Contenu actuel de `SettingsDrawer` intégré ici |
| Données | Export JSON favoris + read-later |
| Zone danger | Supprimer le compte |

## Fichiers

### Nouveaux
- `packages/app/src/app/settings/page.tsx` — Server Component, vérifie session, passe `user` au client
- `packages/app/src/app/settings/SettingsClient.tsx` — `'use client'`, gestion onglets + formulaires
- `packages/app/src/actions/profile.ts` — Server Actions : `updateProfile`, `changePassword`, `revokeAllSessions`, `deleteAccount`, `exportData`

### Modifiés
- `packages/app/prisma/schema.prisma` — ajoute `tokenVersion Int @default(0)` sur `User`
- `packages/app/src/auth.ts` — callback `jwt` vérifie `tokenVersion`
- `packages/app/src/components/DashboardClient.tsx` — bouton ⚙️ → `<Link href="/settings">` + supprime `showSettings` state + supprime `<SettingsDrawer />`

## Schéma BDD

```prisma
model User {
  // ... champs existants ...
  tokenVersion  Int      @default(0)  // incrément = invalide tous les JWT
}
```

Migration : `prisma db push` (ajout de colonne avec défaut, non destructif).

## Server Actions — `src/actions/profile.ts`

```typescript
updateProfile(data: { name?: string; image?: string | null }): Promise<{ error?: string }>
changePassword(data: { current: string; next: string }): Promise<{ error?: string }>
// Erreurs possibles : 'Non connecté', 'Compte OAuth — pas de mot de passe local',
// 'Mot de passe actuel incorrect', 'Mot de passe trop court (min 8 caractères)'
revokeAllSessions(): Promise<void>  // incrémente tokenVersion via { increment: 1 }
deleteAccount(): Promise<void>       // supprime user (cascade)
exportData(): Promise<{ favorites: TechItem[]; readLater: TechItem[] }>
```

Toutes les actions commencent par `getUserId()` — helper interne qui appelle `auth()` et retourne `session?.user?.id ?? null`. Pas de Zod côté Server Action (validation portée par les formulaires client).

## Auth — callback JWT mis à jour

```typescript
async jwt({ token, user }) {
  if (user) {
    // Connexion initiale : stocker id + tokenVersion courant depuis la DB
    token.id = user.id
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tokenVersion: true },
    })
    token.tokenVersion = dbUser?.tokenVersion ?? 0
    return token
  }
  // Appels suivants : vérifier que tokenVersion n'a pas été incrémenté
  if (token.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { tokenVersion: true },
    })
    if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) return null
  }
  return token
}
```

Note : la vérification se fait à **chaque appel** du callback (pas seulement sur `trigger === 'update'`). Cela implique 1 requête DB par vérification de token — acceptable pour un projet à faible trafic.

## Tests

Fichier : `tests/unit/actions/profile.test.ts` — 14 tests unitaires (Vitest, mocks Prisma + bcryptjs).

| Suite | Cas couverts |
|-------|-------------|
| `updateProfile` | name+image, name seul, non connecté |
| `changePassword` | non connecté, compte OAuth (password null), mdp actuel incorrect, nouveau mdp trop court (< 8 chars), succès |
| `revokeAllSessions` | increment tokenVersion, non connecté |
| `deleteAccount` | suppression, non connecté |
| `exportData` | retourne favorites+readLater, non connecté (tableaux vides) |

- Pas de test E2E (hors scope)

## Notes d'implémentation

- `revokeAllSessions` : incrémente `tokenVersion` en base → le callback JWT retourne `null` → NextAuth détruit la session au prochain appel
- Export JSON : la Server Action retourne les données, le composant client crée un `Blob` et déclenche le téléchargement
- Photo de profil : `<img src={url} onError={() => setImgError(true)} />` avec fallback sur les initiales
- Suppression compte : `prisma.user.delete({ where: { id } })` suffit grâce aux `onDelete: Cascade` existants
