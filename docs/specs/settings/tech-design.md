# Tech Design — Settings

## Intention

Page `/settings` à onglets, accessible aux utilisateurs connectés uniquement. Centralise gestion du profil, sécurité, historique de navigation, et export/suppression des données.

## Décisions clés

### 1. tokenVersion pour "sign out all"
Les JWT sont stateless — on ne peut pas les révoquer directement. Solution : champ `tokenVersion Int @default(0)` sur `User`. Le callback `jwt` interroge la DB à chaque refresh et retourne `null` si les versions divergent, ce qui force NextAuth à détruire la session.

### 2. Photo de profil = URL
Pas d'upload fichier pour éviter la dépendance à un service de stockage (Vercel Blob, S3). L'utilisateur colle une URL. Aperçu immédiat avec `onError` pour fallback sur les initiales.

### 3. SettingsDrawer → onglet Historique
Le `SettingsDrawer` existant (tiroir latéral) est remplacé par l'onglet Historique dans la page `/settings`. Le composant `SettingsDrawer` est supprimé. Le bouton ⚙️ devient un `<Link href="/settings">`.

### 4. Export côté client
`exportData` Server Action retourne les données brutes. Le composant crée un `Blob`, génère un `objectURL` et déclenche le téléchargement via un `<a>` temporaire. Pas de fichier servi par le serveur.

### 5. Suppression en cascade
`prisma.user.delete` suffit — tous les modèles liés ont `onDelete: Cascade` depuis la feature auth.
