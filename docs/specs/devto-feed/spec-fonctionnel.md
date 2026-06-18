# Spec fonctionnelle — devto-feed

| Champ | Valeur |
|---|---|
| **Feature** | devto-feed |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Contexte

Le devto-feed récupère les articles techniques populaires via l'API Dev.to. Il transforme les données en objets `TechItem` utilisables par le dashboard. L'API Dev.to est publique — la clé API est optionnelle mais augmente le quota.

## Règles métier

1. La clé API Dev.to est utilisée côté serveur si disponible (`DEVTO_API_KEY`)
2. L'API fonctionne aussi sans clé (accès public) — ne pas bloquer si la clé est absente
3. On récupère les 10 articles les plus populaires de la semaine
4. Les articles sont transformés en `TechItem` avant d'être passés au dashboard

## User Stories

- En tant que développeur, je veux voir les articles techniques populaires du moment
- En tant que développeur, je veux voir le temps de lecture estimé de chaque article
- En tant que développeur, je veux voir les tags de chaque article pour évaluer son intérêt rapidement

## Cas d'usage

1. **Nominal** : appel API réussi → liste de 10 articles transformés en `TechItem`
2. **Sans clé API** : appel sans header → fonctionne avec quota réduit
3. **Erreur réseau** : timeout ou 5xx → erreur remontée au dashboard
4. **Article sans image** : `cover_image` null → image par défaut ou absence d'image

## Cas limites

- Article sans temps de lecture (`reading_time_minutes: 0`) → afficher "< 1 min"
- Article sans tags → tableau vide, badge "Article" affiché
- Article sans image de couverture → composant `TechCard` s'adapte

## Contraintes

- Appel API exclusivement côté serveur
- Clé API stockée dans `DEVTO_API_KEY` (variable non-publique, optionnelle)
- Timeout de 10 secondes maximum

## Interfaces

- **Sortie** : `TechItem[]` avec `source: 'devto'`

## Dépendances

- ADR-002 — sécurité tokens

## Hors scope

- Filtrage par tag (v1.5)
- Articles par auteur spécifique (v2)
- Contenu complet de l'article sur la page détail (v1 — feature `/article/[id]`)

## ADRs référencés

- ADR-001 — Stack (Next.js Server Components)
- ADR-002 — Sécurité tokens API

## Critères d'acceptation

- [ ] Les 10 articles s'affichent avec titre, tags, temps de lecture
- [ ] Le badge `StatusBadge` affiche "Article"
- [ ] Un message d'erreur s'affiche si l'API échoue
- [ ] L'absence de clé API ne bloque pas le chargement
- [ ] Les articles sans image de couverture s'affichent correctement
