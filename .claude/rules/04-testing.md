# Rules testing — Zelian

> Valables sur tout projet. Adapter les outils selon la stack.

## Principes

1. **TDD obligatoire** — RED-GREEN-REFACTOR, imposé par Superpowers
2. Chaque feature a au minimum un test unitaire et un test d'intégration
3. Les tests tournent en CI — un test cassé bloque le merge
4. Pas de mocks de la BDD — utiliser une BDD de test réelle

## Stratégie par couche

| Couche | Type de test | Outil | Fréquence |
|--------|-------------|-------|-----------|
| Schémas Zod, logique métier | Unitaire | Vitest 4 | Chaque feature |
| RLS policies, withRLS(), crypto.ts | Intégration | Vitest 4 | Chaque modification sécurité |
| Composants UI | Composant | React Testing Library | Composants critiques |
| Parcours complet (arrivant + référent) | E2E | Playwright 1.58 (Chromium) | Parcours critiques |

## Conventions de nommage

- Fichiers de test : `*.test.ts`, `*.spec.ts`
- Describe : nom du module/service
- It/test : "should + comportement attendu" (en anglais)

## CI

- `pnpm test` doit passer sans erreur
- Coverage minimum recommandé : 60% (objectif, pas bloquant)
- Les tests E2E tournent sur les PR vers `main` uniquement

## Anti-patterns

- ❌ Tests qui testent l'implémentation (vérifier les résultats, pas les appels internes)
- ❌ Tests flaky (instables) — les corriger immédiatement ou les désactiver avec ticket
- ❌ `console.log` dans les tests
- ❌ Données de test en dur partagées entre tests (utiliser des factories/fixtures)
