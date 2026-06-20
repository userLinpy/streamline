# Spec technique — bookmarks

| Champ | Valeur |
|---|---|
| **Feature** | bookmarks |
| **Statut** | Implémenté |
| **Date** | 2026-06-19 |
| **Auteur** | Lin |
| **Version** | 0.2.0 |

---

## Architecture

Deux hooks localStorage distincts côté client, consommés par `TechCard` et `DashboardClient`.

- `useReadLater` — gère la liste "À lire plus tard" (clé `streamline_read_later`)
- `useFavorites` — gère la liste "Favoris" (clé `streamline_favorites`)

Chaque hook expose un pattern identique : hydratation depuis localStorage au montage (`useEffect`), puis lecture/écriture synchrone à chaque mutation.

## Fichiers

| Fichier | Rôle |
|---|---|
| `packages/app/src/hooks/useReadLater.ts` | Hook "À lire plus tard" — localStorage `streamline_read_later` |
| `packages/app/src/hooks/useFavorites.ts` | Hook "Favoris" — localStorage `streamline_favorites` |
| `packages/app/src/components/TechCard.tsx` | Boutons bookmark (🔖) et favori (⭐) intégrés |
| `packages/app/src/types/index.ts` | Type `TechItem` |

## Schema BDD

Aucun — `localStorage` uniquement.

```
localStorage key : "streamline_read_later"
value : JSON.stringify(TechItem[])

localStorage key : "streamline_favorites"
value : JSON.stringify(TechItem[])
```

## Hook useReadLater

```typescript
'use client'
export function useReadLater() {
  const [readLaterItems, setReadLaterItems] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('streamline_read_later')
      if (stored) setReadLaterItems(JSON.parse(stored) as TechItem[])
    } catch { setReadLaterItems([]) }
  }, [])

  // addToReadLater(item) — déduplique par id
  // removeFromReadLater(id)
  // isInReadLater(id) → boolean
  return { readLaterItems, addToReadLater, removeFromReadLater, isInReadLater }
}
```

## Hook useFavorites

```typescript
'use client'
export function useFavorites() {
  const [favorites, setFavorites] = useState<TechItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('streamline_favorites')
      if (stored) setFavorites(JSON.parse(stored) as TechItem[])
    } catch { setFavorites([]) }
  }, [])

  // addFavorite(item) — déduplique par id
  // removeFavorite(id)
  // isFavorite(id) → boolean
  return { favorites, addFavorite, removeFavorite, isFavorite }
}
```

## Comportement TechCard

Bouton bookmark (Bookmark Lucide, amber) : toggle `addToReadLater` / `removeFromReadLater`.
Bouton favori (Star Lucide, rose) : toggle `addFavorite` / `removeFavorite`.
Les deux états sont visuellement distincts (rempli = actif, outline = inactif).

## Tests

- [ ] Unitaire : `addToReadLater` ajoute un item et ne duplique pas
- [ ] Unitaire : `removeFromReadLater` retire l'item correct
- [ ] Unitaire : `isInReadLater` retourne true/false correctement
- [ ] Unitaire : `addFavorite` ajoute un item et ne duplique pas
- [ ] Unitaire : `removeFavorite` retire l'item correct
- [ ] Unitaire : `isFavorite` retourne true/false correctement
- [ ] Unitaire : hydratation depuis localStorage au montage (les deux hooks)
- [ ] Unitaire : erreur localStorage silencieuse → état initial vide
