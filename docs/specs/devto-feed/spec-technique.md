# Spec technique — devto-feed

| Champ | Valeur |
|---|---|
| **Feature** | devto-feed |
| **Statut** | Implémenté |
| **Date** | 2026-06-19 |
| **Auteur** | Lin |
| **Version** | 0.2.0 |

---

## Architecture

Fonction pure `fetchDevTo()` dans `lib/devto.ts`, appelée depuis `app/page.tsx` via `Promise.all()`. Page de détail article `app/article/[id]/page.tsx` — Server Component qui fetch le corps HTML depuis Dev.to.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/lib/devto.ts` | Fetch + transformation des données Dev.to (`fetchDevTo`, `transformArticle`, type `DevToArticleRaw`) |
| `packages/app/src/app/article/[id]/page.tsx` | Page détail article — Server Component |
| `packages/app/src/types/index.ts` | Type `TechItem` partagé |

## Schema BDD

Aucun.

## API Dev.to — feed initial

```
GET https://dev.to/api/articles
  ?per_page=10
  &top=7

Headers (optionnel) :
  api-key: ${process.env.DEVTO_API_KEY}
```

### Réponse (champs utilisés)

```typescript
type DevToArticleRaw = {
  id: number
  title: string
  description: string
  url: string
  cover_image: string | null
  reading_time_minutes: number
  tag_list: string[]
  public_reactions_count: number
  published_at: string
  user: { name: string; username: string; profile_image: string }
}
```

## API Dev.to — détail article

```
GET https://dev.to/api/articles/:id
  next: { revalidate: 3600 }

Headers (optionnel) :
  api-key: ${process.env.DEVTO_API_KEY}
```

Champs supplémentaires consommés par la page détail :
- `body_html` : corps de l'article en HTML, rendu via `dangerouslySetInnerHTML` avec classe `.article-body`
- `user.name`, `user.username`, `user.profile_image`

## Transformation vers TechItem

```typescript
function transformArticle(article: DevToArticleRaw): TechItem {
  return {
    id: `dt-${article.id}`,
    title: article.title,
    description: article.description ?? '',
    url: article.url,
    tags: article.tag_list,
    source: 'devto',
    stars: article.public_reactions_count,
    readTime: article.reading_time_minutes,
    publishedAt: article.published_at,
    ownerAvatar: article.user?.profile_image,
    coverInitials: article.user?.username?.slice(0, 2).toUpperCase(),
  }
}
```

## Page détail `/article/[id]`

- Server Component avec `params: Promise<{ id: string }>` (Next.js 15+)
- Revalidation ISR : `next: { revalidate: 3600 }`
- Rendu du corps HTML : `dangerouslySetInnerHTML={{ __html: article.body_html }}`
- Classe CSS `.article-body` appliquée au conteneur
- Lien "Lire sur Dev.to" (target=_blank, noopener)
- Fallback 404 si `!res.ok`

## Tests

- [ ] Mock fetch → vérifie que `transformArticle` produit un `TechItem` valide
- [ ] Mock fetch sans `DEVTO_API_KEY` → requête sans header `api-key`
- [ ] Mock article avec `reading_time_minutes: 0` → `readTime` est 0
- [ ] Mock article avec `cover_image: null` → `ownerAvatar` utilise `profile_image`
- [ ] Page détail : `res.ok = false` → rendu du fallback "Article introuvable"
