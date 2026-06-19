# Design — Streamline MVP

| Champ | Valeur |
|---|---|
| **Date** | 2026-06-19 |
| **Auteur** | Lin |
| **Approche** | B — APIs d'abord, UI ensuite |
| **Statut** | Approuvé |

---

## Contexte

Streamline est un cockpit de veille technologique qui agrège des articles Dev.to et des repos GitHub trending dans une interface unifiée. L'objectif : remplacer la navigation entre plusieurs plateformes par un tableau de bord unique, centré sur l'actualité récente (≤ 2 semaines).

---

## 1. Architecture générale

Flux en 4 couches, implémentées dans cet ordre (Approche B) :

```
1. TYPES          types/index.ts
                  TechItem — format commun GitHub + Dev.to

2. API LAYER      lib/github.ts   → repos récents + README (temps de lecture)
                  lib/devto.ts    → articles récents
                  app/api/search/ → recherche étendue sans filtre de date

3. PAGE SERVEUR   app/page.tsx (Server Component)
                  Promise.all([fetchGitHub(), fetchDevTo()])
                  → TechItem[] passé à DashboardClient

4. UI CLIENT      DashboardClient.tsx — onglets, recherche, filtrage
                  TechCard.tsx — carte individuelle
                  hooks/useReadLater.ts — localStorage "À lire"
                  hooks/useFavorites.ts — localStorage "Favoris"
```

---

## 2. Type partagé

```typescript
// types/index.ts
type TechItem = {
  id: string               // "gh-{repo_id}" | "dt-{article_id}" (IDs numériques)
  source: 'github' | 'devto'
  title: string
  description: string
  url: string              // lien vers l'original
  tags: string[]
  stars: number            // stargazers_count (GH) | public_reactions_count (DT)
  readTime: number         // minutes — natif DT, estimé README pour GH (0 si indispo)
  publishedAt: string      // ISO date
  ownerAvatar?: string     // avatar owner GitHub uniquement
  coverInitials: string    // 2-3 lettres auto-générées : initiales du titre (ex. "RSC", "UI")
}
```

---

## 3. Couche API

### `lib/github.ts`

- Endpoint : `GET /search/repositories?q=stars:>500 pushed:>DATE&sort=updated&per_page=15`
- `DATE` = aujourd'hui − 14 jours (calculé au moment du fetch)
- Pour chaque repo : `GET /repos/{owner}/{repo}/readme` en parallèle (`Promise.all`)
- Temps de lecture estimé : `Math.ceil(wordCount / 200)` (README décodé base64)
- Cache : `next: { revalidate: 3600 }`

### `lib/devto.ts`

- Endpoint : `GET /api/articles?per_page=15&top=14`
- Filtre post-fetch : exclure les articles dont `published_at` > 14 jours
- `reading_time_minutes` et `public_reactions_count` fournis nativement
- Cache : `next: { revalidate: 3600 }`

### `app/api/search/route.ts`

- `GET /api/search?q={query}` — appelé uniquement sur Entrée dans la barre de recherche
- Appelle GitHub Search + Dev.to Search **sans filtre de date**
- Les tokens restent côté serveur (Route Handler)
- Retourne `TechItem[]`

### Parallélisme page principale

```typescript
const [githubItems, devtoItems] = await Promise.all([fetchGitHub(), fetchDevTo()])
const items = [...devtoItems, ...githubItems]  // Dev.to en premier (articles prioritaires)
```

---

## 4. Interface utilisateur

### Layout

**Option C retenue** : Header + Onglets + Grille 3 colonnes uniforme.

### Thème

Light mode. Fond blanc, couleurs d'accentuation indigo (`#4f46e5`).

### Onglets (5)

| Onglet | Couleur active | Contenu |
|--------|---------------|---------|
| Dev.to | Indigo | Articles Dev.to uniquement |
| GitHub | Vert | Repos GitHub uniquement |
| Tout | Gris | Dev.to + GitHub mélangés |
| 🔖 À lire | Orange | Items sauvegardés temporairement |
| ⭐ Favoris | Rouge | Items conservés définitivement |

Onglet par défaut : **Dev.to** (articles en priorité).

### TechCard

- **Cover** : fond teinté clair (vert pâle GitHub, bleu pâle Dev.to)
- **Badge source** : fond blanc solide, toujours lisible
- **Logo** : avatar owner GitHub ou initiales sur fond blanc avec ombre
- **Bookmark** : fond blanc par défaut, bleu quand actif
- **2 boutons d'action** en haut à droite de la cover :
  - 🔖 orange = "À lire plus tard"
  - ⭐ rouge = "Favori permanent"
- **Footer** : tags en bas à gauche, stats (★ + ⏱) en bas à droite
- **Date relative** : "il y a 2 jours", "mis à jour il y a 1 j"
- **Titre cliquable** → page de détail

### Barre de recherche

- Frappe → filtre local instantané sur les items chargés (≤ 2 semaines)
- Entrée → appel `/api/search` sans filtre de date → résultats tous âges

### Pages de détail

- `/article/[id]` — contenu `body_html` Dev.to, rendu côté serveur (`id` = ID numérique Dev.to)
- `/repo/[id]` — README GitHub décodé (base64) + rendu Markdown via `marked`, côté serveur (`id` = ID numérique GitHub, fetch via `GET /repositories/{id}`)
- Bouton retour + lien "Lire sur Dev.to ↗" / "Voir sur GitHub ↗" (nouvel onglet)
- Boutons 🔖 / ⭐ disponibles sur la page de détail

---

## 5. État client (localStorage)

```
"streamline_read_later"  → TechItem[]   (hook useReadLater)
"streamline_favorites"   → TechItem[]   (hook useFavorites)
```

Les deux hooks lisent le localStorage dans `useEffect` uniquement — évite les erreurs d'hydratation SSR Next.js.

---

## 6. Gestion des erreurs

| Scénario | Comportement |
|----------|-------------|
| GitHub API en erreur | Retourne `[]`, Dev.to s'affiche normalement |
| Dev.to API en erreur | Retourne `[]`, GitHub s'affiche normalement |
| Les deux en erreur | Message "Impossible de charger les articles. Réessaie dans quelques minutes." |
| README GitHub indisponible | `readTime: 0` — aucun indicateur ⏱ affiché |
| `/api/search` en erreur | Message "Recherche indisponible" — résultats locaux restent visibles |

---

## 7. Nettoyage du template

Avant d'implémenter, supprimer du template `zelian-starter` :
- Dépendances : `@supabase/supabase-js`, `@supabase/ssr`, `@prisma/client`, `pdf-lib`, `resend`, `@logtail/node`
- Fichiers : `app/api/webhooks/resend/route.ts`, `prisma/`, `packages/shared/lib/supabase.ts`, `packages/shared/lib/prisma.ts`, `packages/shared/lib/email.ts`, `packages/shared/lib/crypto.ts`
- Ajouter : `tailwindcss@4`, `lucide-react` (icônes), `marked` (rendu Markdown README), mettre à jour `zod` en v4

---

## 8. Ordre d'implémentation (Approche B)

1. Nettoyage du template + installation des dépendances
2. `.env.local` — `GITHUB_TOKEN` + `DEVTO_API_KEY`
3. `types/index.ts` — type `TechItem`
4. `lib/github.ts` — fetch + README + transform
5. `lib/devto.ts` — fetch + transform
6. Validation des données dans `app/page.tsx` (log serveur)
7. `app/layout.tsx` — Tailwind + metadata Streamline
8. `components/TechCard.tsx`
9. `components/DashboardClient.tsx` — onglets + recherche locale
10. `hooks/useReadLater.ts` + `hooks/useFavorites.ts`
11. `app/api/search/route.ts` — recherche étendue
12. `app/article/[id]/page.tsx` — détail article Dev.to
13. `app/repo/[owner]/[repo]/page.tsx` — détail repo GitHub
14. Tests + polish final
