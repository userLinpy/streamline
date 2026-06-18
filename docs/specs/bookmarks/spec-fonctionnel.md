# Spec fonctionnelle — bookmarks

| Champ | Valeur |
|---|---|
| **Feature** | bookmarks |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Contexte

Les bookmarks permettent à l'utilisateur de sauvegarder des articles ou repos pour les retrouver plus tard. Pour le MVP, les favoris sont stockés dans le `localStorage` du navigateur — aucun compte requis, aucune BDD.

## Règles métier

1. Un item peut être ajouté ou retiré des favoris depuis n'importe quelle carte du dashboard
2. Les favoris sont persistés dans le `localStorage` — ils survivent au rechargement de page
3. La page `/bookmarks` affiche uniquement les items sauvegardés
4. Si aucun favori : afficher un message invitant à en ajouter
5. Un item déjà en favori affiche un indicateur visuel (icône remplie)

## User Stories

- En tant qu'utilisateur, je veux sauvegarder un article ou repo d'un clic pour le retrouver plus tard
- En tant qu'utilisateur, je veux consulter tous mes favoris sur une page dédiée
- En tant qu'utilisateur, je veux retirer un item de mes favoris facilement
- En tant qu'utilisateur, je veux retrouver mes favoris après avoir fermé le navigateur

## Cas d'usage

1. **Ajouter** : clic sur l'icône bookmark d'une `TechCard` → l'item est sauvegardé, icône passe à l'état "rempli"
2. **Consulter** : navigation vers `/bookmarks` → affichage de tous les items sauvegardés
3. **Retirer depuis le dashboard** : clic sur l'icône bookmark d'un item déjà en favori → retiré, icône revient à l'état "vide"
4. **Retirer depuis /bookmarks** : clic sur l'icône → item retiré de la liste immédiatement
5. **Liste vide** : aucun favori → message "Aucun favori pour l'instant — ajoutez des articles depuis le dashboard"

## Cas limites

- localStorage plein (rare) → erreur silencieuse, log console
- Item ajouté en favori puis supprimé des APIs (n'existe plus) → reste affiché avec les données sauvegardées
- Navigation entre `/` et `/bookmarks` → état des favoris synchronisé

## Contraintes

- `localStorage` uniquement pour le MVP — pas de BDD, pas de compte
- Les favoris sont liés au navigateur et à l'appareil — non synchronisés entre appareils
- Client Component obligatoire (accès au `localStorage` impossible côté serveur)

## Interfaces

- **Entrée** : `item: TechItem` (depuis `TechCard`)
- **Sortie** : liste de `TechItem[]` stockée dans `localStorage` sous la clé `streamline_bookmarks`

## Dépendances

- `dashboard` — les cartes affichent le bouton bookmark

## Hors scope

- Synchronisation multi-appareils (v2 avec auth)
- Dossiers / catégories de favoris (v2)
- Export des favoris (v2)

## ADRs référencés

- ADR-003 — Absence de BDD (localStorage pour MVP)

## Critères d'acceptation

- [ ] Cliquer sur le bookmark d'une carte sauvegarde l'item
- [ ] L'icône bookmark change d'état visuellement (vide → rempli)
- [ ] Les favoris persistent après rechargement de la page
- [ ] La page `/bookmarks` affiche tous les items sauvegardés
- [ ] Retirer un favori le fait disparaître de `/bookmarks` immédiatement
- [ ] L'état vide de `/bookmarks` affiche un message explicite
