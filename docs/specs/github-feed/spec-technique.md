# Spec technique — github-feed

| Champ | Valeur |
|---|---|
| **Feature** | github-feed |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Architecture

Fonction pure dans `lib/github.ts` appelée depuis le Server Component `app/page.tsx`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/lib/github.ts` | Fetch + transformation des données GitHub |
| `packages/app/src/types/index.ts` | Type `TechItem` partagé |

## Schema BDD

Aucun.

## API GitHub

```
GET https://api.github.com/search/repositories
  ?q=stars:>1000+pushed:>2026-06-10
  &sort=stars
  &order=desc
  &per_page=10

Headers:
  Authorization: Bearer ${process.env.GITHUB_TOKEN}
  Accept: application/vnd.github.v3+json
  X-GitHub-Api-Version: 2022-11-28
```

### Réponse (champs utilisés)

```typescript
{
  items: Array<{
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    stargazers_count: number
    language: string | null
    topics: string[]
    pushed_at: string
  }>
}
```

### Transformation vers TechItem

```typescript
async function fetchGithubRepos(): Promise<TechItem[]> {
  const res = await fetch('https://api.github.com/search/repositories?...', {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
    next: { revalidate: 3600 } // cache 1h
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return data.items.map((item) => ({
    id: String(item.id),
    title: item.full_name,
    description: item.description ?? '',
    url: item.html_url,
    tags: [item.language ?? 'Unknown', ...item.topics.slice(0, 3)],
    source: 'github',
    stars: item.stargazers_count,
  }))
}
```

## Tests

- [ ] Mock fetch → vérifie que la transformation produit un `TechItem` valide
- [ ] Mock fetch 401 → vérifie que l'erreur est bien levée
- [ ] Mock fetch avec `description: null` → vérifie que le champ est une chaîne vide
