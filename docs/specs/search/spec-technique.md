# Spec technique — search

| Champ | Valeur |
|---|---|
| **Feature** | search |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Architecture

`SearchBar` est un Client Component avec `useState`. Le dashboard passe tous les items en props et reçoit les items filtrés via un state remonté (`useState` dans le dashboard parent).

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/components/SearchBar.tsx` | Input de recherche — Client Component |
| `packages/app/src/app/page.tsx` | Gère le state `query` et filtre les items |

## Schema BDD

Aucun.

## Logique de filtrage

```typescript
// Dans app/page.tsx (Client Component wrapper)
const [query, setQuery] = useState('')

const filteredItems = items.filter((item) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    item.title.toLowerCase().includes(q) ||
    item.tags.some((tag) => tag.toLowerCase().includes(q))
  )
})
```

## Composant SearchBar

```typescript
'use client'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">Rechercher</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un projet ou article..."
        aria-label="Rechercher dans le feed"
        className="w-full rounded-lg border px-4 py-2 pr-10"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Effacer la recherche">
          ×
        </button>
      )}
    </div>
  )
}
```

## Tests

- [ ] Unitaire : filtrage — "react" filtre correctement sur titre et tags
- [ ] Unitaire : insensibilité à la casse — "React" = "react"
- [ ] Unitaire : trim — "  react  " filtre correctement
- [ ] Unitaire : chaîne vide → tous les items retournés
