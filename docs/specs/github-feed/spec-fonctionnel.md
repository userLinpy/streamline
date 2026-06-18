# Spec fonctionnelle — github-feed

| Champ | Valeur |
|---|---|
| **Feature** | github-feed |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Contexte

Le github-feed récupère les dépôts populaires du moment via l'API GitHub Search. Il transforme les données brutes en objets `TechItem` utilisables par le dashboard.

## Règles métier

1. Le token GitHub est injecté côté serveur uniquement — jamais exposé au client
2. On récupère les 10 repos les plus étoilés de la semaine
3. Si le quota API est dépassé, afficher un message avec le délai de réinitialisation
4. Les données sont transformées en `TechItem` avant d'être passées au dashboard

## User Stories

- En tant que développeur, je veux voir les repos GitHub les plus populaires du moment
- En tant que développeur, je veux connaître le langage, les stars et la description de chaque repo

## Cas d'usage

1. **Nominal** : appel API réussi → liste de 10 repos transformés en `TechItem`
2. **Token invalide** : réponse 401 → erreur remontée au dashboard
3. **Rate limit** : réponse 403 → message avec heure de reset
4. **Réseau indisponible** : timeout → erreur générique

## Cas limites

- Repo sans description → champ `description` vide
- Repo sans langage détecté → tag "Unknown"
- Moins de 10 résultats → afficher ce qui est disponible

## Contraintes

- Appel API exclusivement côté serveur (Server Component / lib)
- Token stocké dans `GITHUB_TOKEN` (variable d'env non-publique)
- Timeout de 10 secondes maximum par requête

## Interfaces

- **Sortie** : `TechItem[]` avec `source: 'github'`

## Dépendances

- ADR-002 — sécurité tokens

## Hors scope

- Filtrage par langage (v1.5)
- Trending sur 24h vs 7j vs 1 mois (v1.5)
- Détails du repo (contributeurs, issues) (v2)

## ADRs référencés

- ADR-001 — Stack (Next.js Server Components)
- ADR-002 — Sécurité tokens API

## Critères d'acceptation

- [ ] Les 10 repos s'affichent avec titre, description, stars, langage
- [ ] Le token n'apparaît jamais dans le HTML ou les requêtes réseau côté client
- [ ] Un message d'erreur s'affiche si l'API échoue
- [ ] Le badge `StatusBadge` affiche "GitHub"
