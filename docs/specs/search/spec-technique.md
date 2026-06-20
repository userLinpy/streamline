# Spec technique — search

| Champ | Valeur |
|---|---|
| **Feature** | search |
| **Statut** | Implémenté |
| **Date** | 2026-06-19 |
| **Auteur** | Lin |
| **Version** | 0.2.0 |

---

## Architecture

Deux niveaux de recherche :

1. **Recherche locale (temps réel)** : filtrage inline dans `DashboardClient`, sur les items déjà chargés
2. **Recherche étendue (déclenchée par Entrée)** : Route Handler `GET /api/search?q=` qui interroge GitHub et Dev.to sans filtre de date

La recherche locale et la recherche étendue sont mutuellement exclusives : les résultats étendus (`searchResults`) écrasent l'affichage local jusqu'à effacement de la saisie.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/app/api/search/route.ts` | Route Handler GET /api/search — recherche étendue |
| `packages/app/src/components/DashboardClient.tsx` | Barre de recherche intégrée + filtrage local |

## Route Handler — GET /api/search

```
GET /api/search?q=<terme>

Réponse : TechItem[] (JSON)
```

- Paramètre `q` manquant ou vide → `[]`
- Appels GitHub et Dev.to en parallèle via `Promise.allSettled` (l'échec d'une source ne bloque pas l'autre)
- Pas de filtre de date (contrairement au fetch initial qui filtre les 14 derniers jours)
- `cache: 'no-store'` sur les deux sous-requêtes

### Sous-requête GitHub
```
GET https://api.github.com/search/repositories
  ?q=<terme>&sort=stars&per_page=10
Headers: Authorization: Bearer ${GITHUB_TOKEN}  (si défini)
```

### Sous-requête Dev.to
```
GET https://dev.to/api/articles
  ?tag=<terme>&per_page=10
Headers: api-key: ${DEVTO_API_KEY}  (si défini)
```

## Recherche locale (DashboardClient)

```typescript
baseItems.filter(item => {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.tags.some(t => t.toLowerCase().includes(q))
  )
})
```

Champs filtrés : `title`, `description`, `tags`.

## Comportement UX

| Action | Comportement |
|---|---|
| Frappe | Filtrage local temps réel |
| Entrée | Requête `GET /api/search?q=` → résultats étendus |
| Effacement | Réinitialise `searchResults` → retour au filtrage local |
| Changement d'onglet | Vide la recherche (`clearSearch`) |
| Erreur réseau | Bandeau d'erreur, affichage des résultats locaux |

## Tests

- [ ] Unitaire : filtrage local — "react" filtre sur titre, description et tags
- [ ] Unitaire : insensibilité à la casse — "React" = "react"
- [ ] Unitaire : trim — "  react  " filtre correctement
- [ ] Unitaire : chaîne vide → tous les items retournés
- [ ] Intégration : `GET /api/search?q=nextjs` → réponse JSON TechItem[]
- [ ] Intégration : `GET /api/search` sans param → réponse `[]`
- [ ] Intégration : échec GitHub → items Dev.to seuls retournés (Promise.allSettled)
