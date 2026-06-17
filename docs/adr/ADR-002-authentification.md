# ADR-002 — Authentification et sécurité des tokens API

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-002                        |
| Statut     | Accepté                        |
| Date       | 2026-06-17                     |
| Auteur(s)  | Lin                            |
| Owner      | Lin                            |
| Décideurs  | Lin                            |
| Contexte   | Phase 1 — Init projet          |
| Remplace   | —                              |

## Justification (politique ADR v2.3.0)

| Champ | Valeur |
|-------|--------|
| Catégorie | AUTH |
| Q1 — Coût de revert > 1j ? | OUI — déplacer les appels API du serveur vers le client exposerait les tokens et nécessiterait une refonte de toute la couche data |
| Q2 — Non-déductible du code ? | OUI — la décision de ne jamais préfixer `NEXT_PUBLIC_` les tokens ne se voit pas dans `package.json` |
| Q3 — Impact transverse (≥ 2 specs) ? | OUI — concerne github-feed, devto-feed, et tout futur module API |
| Q4 — Casse un invariant si ignoré ? | OUI — un développeur qui expose un token via `NEXT_PUBLIC_GITHUB_TOKEN` crée une faille de sécurité immédiate |

> ✅ Validé contre la politique `.claude/rules/06-adr-policy.md`.

## Contexte

Streamline appelle des APIs tierces (GitHub, Dev.to) avec des clés secrètes. Ces tokens doivent rester invisibles des visiteurs. L'application elle-même n'a pas d'authentification utilisateur pour le MVP.

## Décision

**Les tokens API sont stockés dans `.env.local` et utilisés exclusivement dans des Server Components ou Route Handlers (côté serveur).** Ils ne sont jamais préfixés `NEXT_PUBLIC_`.

```bash
# .env.local — jamais commité, jamais exposé
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
DEVTO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

## Options considérées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| Tokens côté serveur uniquement (choisi) | Sécurisé, tokens invisibles | Nécessite Server Components |
| Tokens côté client (`NEXT_PUBLIC_`) | Simple à implémenter | ❌ Token visible dans le navigateur — faille critique |
| Proxy via Route Handler | Tokens sécurisés | Complexité supplémentaire inutile avec App Router |

## Option choisie

**Server Components + variables d'environnement non-publiques.** Next.js App Router permet nativement d'appeler des APIs depuis le serveur — c'est la solution la plus simple et la plus sécurisée.

## Conséquences

- Tout composant qui appelle GitHub ou Dev.to doit être un Server Component (pas de `"use client"`)
- `.env.local` est dans `.gitignore` — un fichier `.env.example` documente les variables requises
- Si un futur module nécessite des appels API côté client, utiliser un Route Handler comme proxy
