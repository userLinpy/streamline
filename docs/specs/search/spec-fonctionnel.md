# Spec fonctionnelle — search

| Champ | Valeur |
|---|---|
| **Feature** | search |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Contexte

La barre de recherche permet de filtrer en temps réel les items affichés dans le dashboard sans recharger la page ni faire de nouvel appel API. Le filtrage s'effectue côté client sur les données déjà chargées.

## Règles métier

1. Le filtrage est instantané (pas de délai artificiel)
2. La recherche porte sur le titre et les tags de chaque item
3. La recherche est insensible à la casse
4. Si aucun résultat : afficher l'état vide "Aucun résultat trouvé"
5. Effacer la recherche restaure tous les items

## User Stories

- En tant qu'utilisateur, je veux taper un mot-clé et voir les résultats se filtrer immédiatement
- En tant qu'utilisateur, je veux chercher par technologie (ex: "python") et voir les articles et repos correspondants
- En tant qu'utilisateur, je veux effacer ma recherche d'un clic pour revenir à la vue complète

## Cas d'usage

1. **Recherche active** : l'utilisateur tape "react" → seuls les items avec "react" dans le titre ou les tags restent visibles
2. **Aucun résultat** : "xyzabc" → illustration + message "Aucun résultat trouvé"
3. **Effacer** : clic sur la croix ou suppression du texte → tous les items réapparaissent

## Cas limites

- Recherche avec espaces → trim avant filtrage
- Caractères spéciaux (ex: `c++`, `c#`) → filtrage sur la chaîne brute, pas de regex
- Dashboard en chargement → SearchBar désactivée ou masquée

## Contraintes

- Client Component (`"use client"`) — nécessite `useState`
- Pas de nouvel appel API au moment de la recherche
- Accessible : label visible, attribut `aria-label` sur l'input

## Interfaces

- **Entrée** : `items: TechItem[]` (props depuis le dashboard)
- **Sortie** : `filteredItems: TechItem[]` via callback ou state partagé

## Dépendances

- `dashboard` — fournit les items à filtrer

## Hors scope

- Recherche avec appel API GitHub/Dev.to (v1.5)
- Filtres avancés (par source, par date) (v1.5)
- Historique des recherches (v2)

## ADRs référencés

- ADR-001 — Stack (React Client Component)

## Critères d'acceptation

- [ ] Taper un mot-clé filtre les items en temps réel
- [ ] La recherche est insensible à la casse
- [ ] L'état vide s'affiche quand aucun résultat ne correspond
- [ ] Effacer le champ restaure tous les items
- [ ] Le composant est accessible (label + aria-label)
