# Tech design — github-feed

| Champ | Valeur |
|---|---|
| **Feature** | github-feed |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |

---

## Intention

Fonction pure `fetchGithubRepos()` dans `lib/github.ts`. Appelée une seule fois depuis `app/page.tsx` via `Promise.all()`. Retourne un tableau de `TechItem` normalisé.

## Gestion des erreurs

```
res.ok === false → throw Error avec le status HTTP
→ capturé dans app/page.tsx avec try/catch
→ passe errorGithub={true} au composant d'affichage
```

## Cache Next.js

`next: { revalidate: 3600 }` — les données GitHub sont mises en cache 1 heure côté serveur. Évite de consommer le quota API à chaque visite.
