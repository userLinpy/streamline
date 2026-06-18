# Spec technique — devto-feed

| Champ | Valeur |
|---|---|
| **Feature** | devto-feed |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Architecture

Fonction pure `fetchDevtoArticles()` dans `lib/devto.ts`, appelée depuis `app/page.tsx` via `Promise.all()`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/lib/devto.ts` | Fetch + transformation des données Dev.to |
| `packages/app/src/types/index.ts` | Type `TechItem` partagé |

## Schema BDD

Aucun.

## API Dev.to

```
GET https://dev.to/api/articles
  ?per_page=10
  &top=7

Headers (optionnel) :
  api-key: ${process.env.DEVTO_API_KEY}
```

### Réponse (champs utilisés)

```typescript
Array<{
  id: number
  title: string
  description: string
  url: string
  cover_image: string | null
  reading_time_minutes: number
  tag_list: string[]
  public_reactions_count: number
  published_at: string
}>
```

### Transformation vers TechItem

```typescript
async function fetchDevtoArticles(): Promise<TechItem[]> {
  const headers: HeadersInit = {}
  if (process.env.DEVTO_API_KEY) {
    headers['api-key'] = process.env.DEVTO_API_KEY
  }
  const res = await fetch('https://dev.to/api/articles?per_page=10&top=7', {
    headers,
    next: { revalidate: 3600 }
  })
  if (!res.ok) throw new Error(`Dev.to API error: ${res.status}`)
  const data = await res.json()
  return data.map((article) => ({
    id: String(article.id),
    title: article.title,
    description: article.description,
    url: article.url,
    tags: article.tag_list,
    source: 'devto',
    readTime: article.reading_time_minutes || 1,
    image: article.cover_image ?? undefined,
  }))
}
```

## Tests

- [ ] Mock fetch → vérifie que la transformation produit un `TechItem` valide
- [ ] Mock fetch sans `DEVTO_API_KEY` → vérifie que la requête part sans header `api-key`
- [ ] Mock article avec `reading_time_minutes: 0` → vérifie que `readTime` vaut 1
- [ ] Mock article avec `cover_image: null` → vérifie que `image` est `undefined`
