# Spec technique — bookmarks

| Champ | Valeur |
|---|---|
| **Feature** | bookmarks |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Architecture

Hook custom `useBookmarks` côté client. Expose `bookmarks`, `addBookmark`, `removeBookmark`, `isBookmarked`. Utilisé par `TechCard` et la page `/bookmarks`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/hooks/useBookmarks.ts` | Hook custom — lecture/écriture localStorage |
| `packages/app/src/app/bookmarks/page.tsx` | Page `/bookmarks` — Client Component |
| `packages/app/src/components/TechCard.tsx` | Bouton bookmark intégré |
| `packages/app/src/types/index.ts` | Type `TechItem` |

## Schema BDD

Aucun — `localStorage` uniquement.

```
localStorage key : "streamline_bookmarks"
value : JSON.stringify(TechItem[])
```

## Hook useBookmarks

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { TechItem } from '@/types'

const STORAGE_KEY = 'streamline_bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setBookmarks(JSON.parse(stored))
    } catch {}
  }, [])

  const save = (items: TechItem[]) => {
    setBookmarks(items)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('localStorage full', e)
    }
  }

  const addBookmark = (item: TechItem) => {
    if (!bookmarks.find((b) => b.id === item.id)) save([...bookmarks, item])
  }

  const removeBookmark = (id: string) => {
    save(bookmarks.filter((b) => b.id !== id))
  }

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id)

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}
```

## Tests

- [ ] Unitaire : `addBookmark` ajoute un item et ne duplique pas
- [ ] Unitaire : `removeBookmark` retire l'item correct
- [ ] Unitaire : `isBookmarked` retourne true/false correctement
- [ ] Unitaire : hydratation depuis localStorage au montage
