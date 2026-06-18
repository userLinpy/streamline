# Tech design — bookmarks

| Champ | Valeur |
|---|---|
| **Feature** | bookmarks |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |

---

## Intention

Hook custom `useBookmarks` partagé entre `TechCard` et la page `/bookmarks`. Le hook encapsule toute la logique localStorage — les composants n'y accèdent jamais directement.

## Problème hydratation SSR

`localStorage` n'existe pas côté serveur. Le hook utilise `useEffect` pour lire le localStorage uniquement après le montage côté client — évite les erreurs d'hydratation Next.js.

```typescript
const [bookmarks, setBookmarks] = useState<TechItem[]>([])  // [] par défaut côté serveur

useEffect(() => {
  // S'exécute uniquement côté client, après le premier rendu
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) setBookmarks(JSON.parse(stored))
}, [])
```

## Partage de l'état entre pages

`useBookmarks` relit le localStorage à chaque montage — les deux pages (`/` et `/bookmarks`) ont toujours les données à jour sans state global ni Context.
