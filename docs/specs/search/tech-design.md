# Tech design — search

| Champ | Valeur |
|---|---|
| **Feature** | search |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |

---

## Intention

Le filtrage se fait entièrement côté client sur les données déjà chargées — aucun appel API supplémentaire. Le state `query` vit dans un wrapper Client Component autour de la grille, car `app/page.tsx` est un Server Component et ne peut pas avoir de `useState`.

## Pattern Server → Client

```
app/page.tsx (Server Component)
  → fetch les données
  → passe items à <DashboardClient items={items} />

DashboardClient.tsx ("use client")
  → useState(query)
  → filtre items
  → rend <SearchBar /> + <BentoGrid items={filteredItems} />
```

Ce découpage évite de transformer toute la page en Client Component juste pour la recherche.
