# Tech design — devto-feed

| Champ | Valeur |
|---|---|
| **Feature** | devto-feed |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |

---

## Intention

Fonction pure `fetchDevtoArticles()` dans `lib/devto.ts`. Même pattern que `github.ts` — appelée en parallèle via `Promise.all()` dans `app/page.tsx`.

## Clé API optionnelle

```typescript
const headers: HeadersInit = {}
if (process.env.DEVTO_API_KEY) {
  headers['api-key'] = process.env.DEVTO_API_KEY
}
```

La clé est injectée conditionnellement — l'app fonctionne avec ou sans.

## Cache Next.js

`next: { revalidate: 3600 }` — même stratégie que GitHub feed, cache 1 heure côté serveur.
