---
feature: settings
version: 0.1.0
date: 2026-06-23
status: draft
---

# Spec Fonctionnelle — Settings

## Contexte

Page `/settings` permettant à un utilisateur authentifié de gérer son profil, sa sécurité, son historique de navigation et ses données. Accessible uniquement après connexion — redirige vers `/login` sinon.

Le bouton ⚙️ du header (actuellement tiroir Historique) pointe vers `/settings`. L'historique devient un onglet de la page.

## Personas

- **Utilisateur connecté (email/password)** : peut changer pseudo, photo, mot de passe, se déconnecter partout, supprimer son compte, exporter ses données.
- **Utilisateur connecté (GitHub OAuth)** : peut changer pseudo et photo. Le champ "changer mot de passe" est masqué (pas de password local).

## Règles

1. Page accessible uniquement si `session?.user` existe — sinon redirect `/login`
2. Toute mutation passe par une Server Action
3. Confirmation explicite (modale) avant suppression du compte
4. "Déconnecter tous les appareils" invalide les tokens en incrémentant `tokenVersion` en base, puis signe out la session courante
5. L'export génère un fichier JSON téléchargeable côté client
6. La photo de profil est une URL (pas d'upload fichier) — validée comme URL valide

## User Stories

- En tant qu'utilisateur, je veux changer mon pseudo affiché dans le header
- En tant qu'utilisateur, je veux renseigner une URL de photo de profil et voir un aperçu
- En tant qu'utilisateur email/password, je veux changer mon mot de passe (ancien + nouveau + confirmation)
- En tant qu'utilisateur, je veux déconnecter tous mes appareils en une action
- En tant qu'utilisateur, je veux voir et gérer mon historique de navigation
- En tant qu'utilisateur, je veux exporter mes favoris et read-later en JSON
- En tant qu'utilisateur, je veux supprimer définitivement mon compte

## Cas d'usage

### UC-1 : Changer le pseudo
1. L'utilisateur saisit un nouveau nom dans l'onglet Profil
2. Clique "Enregistrer"
3. `updateProfile` Server Action met à jour `user.name`
4. Le header reflète immédiatement le changement via `router.refresh()`

### UC-2 : Changer la photo de profil
1. L'utilisateur saisit une URL dans le champ photo
2. Un aperçu s'affiche en temps réel (img avec fallback sur les initiales si URL invalide)
3. Clique "Enregistrer" → `updateProfile` met à jour `user.image`

### UC-3 : Changer le mot de passe (email/password uniquement)
1. Saisit ancien mdp, nouveau mdp, confirmation
2. `changePassword` Server Action vérifie l'ancien mdp avec bcrypt
3. Hash le nouveau et met à jour `user.password`
4. Message de succès

### UC-4 : Déconnecter tous les appareils
1. Clique "Déconnecter tous les appareils"
2. `revokeAllSessions` incrémente `user.tokenVersion`
3. `signOut` côté client
4. Redirige vers `/login`

### UC-5 : Exporter les données
1. Clique "Exporter mes données"
2. Server Action récupère favoris + read-later
3. JSON téléchargé automatiquement via `Blob` côté client

### UC-6 : Supprimer le compte
1. Clique "Supprimer mon compte" dans Zone Danger
2. Modale de confirmation avec saisie de "SUPPRIMER"
3. `deleteAccount` Server Action supprime `user` (cascade sur toutes les données)
4. `signOut` → redirect `/`

## Cas limites

- Ancien mdp incorrect → erreur "Mot de passe actuel incorrect"
- URL photo invalide → fallback silencieux sur les initiales (pas de blocage)
- Compte GitHub OAuth → champ mdp masqué (vérification `user.password === null`)
- Suppression compte pendant session active → signOut immédiat

## Contraintes

- Pas d'upload de fichier pour la photo (URL uniquement)
- Pas de changement d'email (trop complexe sans service d'email)
- Page `/settings` = route protégée côté serveur (redirect si non connecté)

## Interfaces

- Entrée : `session.user` depuis NextAuth
- Sorties : Server Actions dans `src/actions/profile.ts`
- Navigation : bouton ⚙️ header → `href="/settings"` (remplace `onClick`)

## Dépendances

- `docs/specs/auth/` — gestion des sessions, bcrypt, NextAuth

## Hors scope

- Upload de fichier image
- Changement d'email
- Notifications email
- 2FA

## Critères d'acceptance

- [ ] Changer pseudo → visible dans le header sans rechargement complet
- [ ] Changer photo URL → aperçu temps réel + persisté en DB
- [ ] Changer mdp → erreur si ancien mdp incorrect, succès sinon
- [ ] Déconnecter tous appareils → token invalidé, redirect login
- [ ] Export JSON → fichier téléchargeable avec favoris + read-later
- [ ] Supprimer compte → toutes les données supprimées, redirect accueil
- [ ] Utilisateur non connecté → redirect `/login`
- [ ] Utilisateur GitHub OAuth → champ mdp masqué
