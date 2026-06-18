# Tech design — dashboard

| Champ | Valeur |
|---|---|
| **Feature** | dashboard |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |

---

## Intention

La page d'accueil est un Server Component qui appelle GitHub et Dev.to en parallèle, puis passe les données aux composants d'affichage. Le composant SearchBar est le seul Client Component — il filtre les résultats déjà chargés côté client.

## Flux de données

```
app/page.tsx (Server Component)
  ├── fetchGithubRepos()    ┐
  └── fetchDevtoArticles()  ┘ Promise.all() — parallèle

  ↓ données combinées

  <BentoGrid>
    <TechCard /> × N   (Server Components)
    <SearchBar />       (Client Component — filtre en mémoire)
  </BentoGrid>
```

## Décisions techniques

1. `Promise.all()` pour les deux appels API — réduit le temps de chargement de moitié
2. `Suspense` + `LoadingSkeleton` pour l'UX pendant le chargement
3. SearchBar en Client Component avec `useState` — filtre les items déjà reçus sans nouvel appel API
4. Grille CSS Tailwind : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
