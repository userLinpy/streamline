# ADR-002 — Authentification

| Champ      | Valeur                         |
|------------|--------------------------------|
| Numéro     | ADR-002                        |
| Statut     | Proposé                        |
| Date       | 2026-04-07                     |
| Auteur(s)  | —                              |
| Owner      | —                              |
| Décideurs  | —                              |
| Contexte   | Phase 2 — Analyse technique    |
| Remplace   | —                              |

## Contexte

Ce projet utilise **Supabase Cloud** exclusivement pour l'authentification JWT (décision ADR-001). Supabase ne touche PAS à la base de données PostgreSQL locale — il gère uniquement les sessions JWT et le MFA/TOTP. Les JWT sub sont propagés vers PostgreSQL via RLS. Ce canevas sera complété en Phase 2.

## Options considérées

> À compléter en Phase 2.

| Option | Description | Effort estimé | Avantages | Inconvénients |
|--------|-------------|---------------|-----------|---------------|
| — | — | — | — | — |

## Option choisie

> À compléter en Phase 2.

## Conséquences

> À compléter en Phase 2.
