# Spec technique — dashboard

| Champ | Valeur |
|---|---|
| **Feature** | dashboard |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Architecture

- `app/page.tsx` — Server Component, orchestre les appels API en parallèle
- Appels GitHub et Dev.to en parallèle avec `Promise.all()`
- Pas de cache explicite pour le MVP (`cache: 'no-store'`)

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/app/page.tsx` | Page principale — Server Component |
| `packages/app/src/app/layout.tsx` | Layout global (header, meta) |
| `packages/app/src/components/TechCard.tsx` | Carte réutilisable |
| `packages/app/src/components/LoadingSkeleton.tsx` | Squelette de chargement |
| `packages/app/src/components/SearchBar.tsx` | Barre de recherche (Client Component) |
| `packages/app/src/components/StatusBadge.tsx` | Badge type de contenu |
| `packages/app/src/lib/github.ts` | Fonctions appel GitHub API |
| `packages/app/src/lib/devto.ts` | Fonctions appel Dev.to API |
| `packages/app/src/types/index.ts` | Types partagés |

## Schema BDD

Aucun — pas de base de données pour cette feature.

## API

### GitHub — repos trending
```
GET https://api.github.com/search/repositories
  ?q=stars:>1000&sort=stars&order=desc&per_page=10
Headers: Authorization: Bearer ${GITHUB_TOKEN}
```

### Dev.to — articles récents
```
GET https://dev.to/api/articles
  ?per_page=10&top=7
```

## Types

```typescript
type TechItem = {
  id: string
  title: string
  description: string
  url: string
  tags: string[]
  source: 'github' | 'devto'
  stars?: number
  readTime?: number
  image?: string
}
```

## Tests

- [ ] Unitaire : `lib/github.ts` — mock fetch, vérifie la transformation des données
- [ ] Unitaire : `lib/devto.ts` — mock fetch, vérifie la transformation des données
- [ ] Intégration : page `/` — vérifie que les deux sections s'affichent
