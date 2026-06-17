# ADR-001 — Stack technique choisie

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-001                        |
| Statut     | Accepté                        |
| Date       | 2026-06-17                     |
| Auteur(s)  | Lin                            |
| Owner      | Lin                            |
| Décideurs  | Lin                            |
| Contexte   | Phase 1 — Init projet          |
| Remplace   | —                              |

## Contexte

Streamline est un cockpit de veille technologique qui agrège des données de GitHub et Dev.to. Le projet nécessite une stack capable de :
- Appeler des APIs externes avec des tokens secrets (sécurité)
- Afficher rapidement beaucoup de cartes (performance)
- Être simple à apprendre et maintenir

## Stack retenue

### Frontend
- **Next.js 15+** (App Router, React 19) — TypeScript 5 strict
- **Tailwind CSS 4** — styling utilitaire
- **Zod v4** — validation des réponses API

### Backend
- **Node.js 20** via Next.js Server Components (appels API externes)
- **Route Handlers** pour les endpoints internes (`/api/...`)
- **Pas de base de données** pour le MVP — données exclusivement depuis APIs externes

### APIs externes
- **GitHub API** — repositories trending (Personal Access Token)
- **Dev.to API** — articles techniques (clé API optionnelle)

### Auth
- **Aucune** pour le MVP — application publique en lecture seule

### Infra
- **À définir** — Vercel recommandé (intégration native Next.js)

## Options considérées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| Next.js 15 (choisi) | App Router moderne, Server Components natifs, sécurité tokens côté serveur | Courbe d'apprentissage App Router |
| Create React App | Simple | Pas de Server Components, tokens exposés côté client |
| Nuxt.js | Similaire à Next.js | Écosystème Vue, moins de ressources |

## Option choisie

**Next.js 15 + TypeScript + Tailwind CSS** — combinaison qui permet de sécuriser les tokens API côté serveur via Server Components, tout en offrant une DX moderne et un écosystème riche.

## Conséquences

- Les appels GitHub API et Dev.to API se font **uniquement côté serveur** (tokens jamais exposés)
- Tailwind CSS remplace tout CSS custom
- Pas de base de données à maintenir pour le MVP (simplification majeure)
- Possibilité d'ajouter une BDD plus tard pour les favoris (bookmarks)
