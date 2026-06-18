# Spec fonctionnelle — dashboard

| Champ | Valeur |
|---|---|
| **Feature** | dashboard |
| **Statut** | Brouillon |
| **Date** | 2026-06-17 |
| **Auteur** | Lin |
| **Version** | 0.1.0 |

---

## Contexte

Le dashboard est la page principale de Streamline (`/`). Il affiche en temps réel les tendances GitHub et les derniers articles Dev.to dans une interface Bento Grid. C'est le point d'entrée unique de l'application.

## Personas

- **Développeur curieux** : veut scanner rapidement les tendances tech sans ouvrir 5 onglets
- **Stagiaire / junior** : cherche des ressources et projets populaires pour apprendre

## Règles métier

1. Les données GitHub et Dev.to sont chargées côté serveur (tokens jamais exposés)
2. L'affichage se fait en Bento Grid — de 1 colonne (mobile) à 3 colonnes (desktop)
3. Les données sont rafraîchies à chaque visite (pas de cache persistant pour le MVP)
4. En cas d'erreur API, un message friendly s'affiche (pas de crash)

## User Stories

- En tant que développeur, je veux voir les repos GitHub tendance du jour pour découvrir de nouveaux projets
- En tant que développeur, je veux voir les derniers articles Dev.to populaires pour rester informé
- En tant qu'utilisateur, je veux filtrer les contenus par popularité ou temps de lecture
- En tant qu'utilisateur mobile, je veux une mise en page adaptée à mon écran

## Cas d'usage

1. **Chargement initial** : l'utilisateur arrive sur `/` → les données se chargent (skeletons) → la grille s'affiche
2. **Erreur GitHub API** : quota dépassé → message d'erreur section GitHub, section Dev.to reste fonctionnelle
3. **Erreur Dev.to API** : idem, section GitHub reste fonctionnelle
4. **Aucun résultat** : illustration + message "Aucun résultat trouvé"

## Cas limites

- Token GitHub invalide → message d'erreur explicite
- API GitHub rate limit → afficher le délai de réinitialisation si disponible dans la réponse
- Réseau lent → skeletons affichés le temps du chargement

## Contraintes

- Pas de JavaScript côté client pour le chargement initial (Server Components)
- Temps de chargement < 3s en conditions normales
- Responsive : 1 col mobile, 2 col tablet (md), 3 col desktop (lg)

## Interfaces

- **Entrée** : aucune (page publique, pas de paramètres requis)
- **Sortie** : grille de `TechCard` avec données GitHub + Dev.to

## Dépendances

- `github-feed` — fournit les données GitHub
- `devto-feed` — fournit les données Dev.to
- `search` — barre de filtrage intégrée au dashboard

## Hors scope

- Personnalisation des sources par l'utilisateur
- Notifications push
- Mode hors ligne

## ADRs référencés

- ADR-001 — Stack technique (Next.js + Tailwind)
- ADR-002 — Sécurité tokens API

## Critères d'acceptation

- [ ] La page `/` charge sans erreur
- [ ] Les repos GitHub s'affichent dans la grille
- [ ] Les articles Dev.to s'affichent dans la grille
- [ ] Les skeletons apparaissent pendant le chargement
- [ ] Un message d'erreur s'affiche si une API échoue
- [ ] La mise en page est responsive (1/2/3 colonnes)
