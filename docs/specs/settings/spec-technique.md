---
feature: settings
version: 0.1.0
date: 2026-06-23
status: draft
---

# Spec Technique — Settings

## Architecture

Page Server Component `/settings` qui vérifie la session côté serveur et redirige si non connecté. Onglets gérés côté client (`'use client'`). Mutations via Server Actions dans `src/actions/profile.ts`.

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
updateProfile(data: { name?: string; image?: string }): Promise<{ error?: string }>
changePassword(data: { current: string; next: string }): Promise<{ error?: string }>
revokeAllSessions(): Promise<void>  // incrémente tokenVersion
deleteAccount(): Promise<void>       // supprime user (cascade)
exportData(): Promise<{ favorites: TechItem[]; readLater: TechItem[] }>
```

## Auth — callback JWT mis à jour

```typescript
async jwt({ token, user, trigger }) {
  if (user) {
    token.id = user.id
    token.tokenVersion = 0
  }
  // Vérification tokenVersion à chaque refresh
  if (trigger === 'update' || !token.tokenVersion) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { tokenVersion: true }
    })
    if (dbUser && dbUser.tokenVersion !== token.tokenVersion) {
      return null  // invalide le token
    }
  }
  return token
}
```

## Tests

- `tests/unit/actions/profile.test.ts` — updateProfile, changePassword (bon mdp / mauvais mdp), deleteAccount
- Pas de test E2E (hors scope)

## Notes d'implémentation

- `revokeAllSessions` : incrémente `tokenVersion` en base → le callback JWT retourne `null` → NextAuth détruit la session au prochain appel
- Export JSON : la Server Action retourne les données, le composant client crée un `Blob` et déclenche le téléchargement
- Photo de profil : `<img src={url} onError={() => setImgError(true)} />` avec fallback sur les initiales
- Suppression compte : `prisma.user.delete({ where: { id } })` suffit grâce aux `onDelete: Cascade` existants
