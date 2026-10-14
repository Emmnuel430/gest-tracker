# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2026-10-14

### Bug Fixes
- **insights** : Correction des règles du moteur de conseils financiers : cumul indépendant des alertes budgétaires dépassées (danger) et sous tension (warning), détection exhaustive de toutes les hausses atypiques par catégorie (triées par croissance décroissante), et alerte de marge de sécurité faible si le taux d'épargne résiduel est inférieur à 15 % (`SAVINGS_WARNING_THRESHOLD`).
- **recurrences** : Calcul déterministe et clamp des échéances programmées aux 29, 30 et 31 ramenées au dernier jour du mois (`resolveDueDate`) avec libellé explicite `formatDayOfMonthLabel`.
- **historique** : État visuel actif du bouton filtre avec pastille numérique du nombre de filtres actifs et attribut d'accessibilité `aria-pressed`.
- **navigation** : Renommage de `/options` en `/gestion` ("Gestion & Modules"), redirection permanente HTTP 308 dans `next.config.ts`, masquage temporaire de la carte des règles récurrentes en attente de la v2.6.0, et protection de la route dans `middleware.ts`.
- **tooling** : Intégration de la configuration ESLint flat native Next.js 16 (`eslint.config.mjs`) avec commande `pnpm lint` passant à 0 erreur.

---

## [2.0.2] - 2026-10-12

### Bug Fixes
- **compliance** : Suppression intégrale des émojis et glyphes unicode de l'UI et du code au profit des icônes Lucide React.
- **typing** : Typage TypeScript strict des blocs `catch (error: unknown)`, élimination des types `any` et typage fort des clauses `Prisma.TransactionWhereInput`.
- **actions** : Typage générique exhaustif des retours de Server Actions (`ActionResponse<T>`).

---

## [2.0.1] - 2026-10-12

### Security & Bug Fixes
- **security** : Activation du Row Level Security (RLS) sur les 5 tables PostgreSQL métier (`budgets`, `debts`, `recurring_rules`, `transactions`, `wallets`).
- **policies** : Déploiement des 20 politiques de sécurité isolant hermétiquement les données par utilisateur (`auth.uid() = user_id`).

---

## [2.0.0] - 2026-10-12

### Features
- **auth** : Cloisonnement multi-utilisateurs avec Supabase Auth et cookies de session sécurisés.
- **budgets** : Gestion des plafonds budgétaires mensuels par catégorie avec jauges visuelles dynamiques (`/budgets`).
- **recurrences** : Automatisation des opérations récurrentes avec suivi des échéances et approbation en un clic (`/recurrences`).
- **wallets** : Multi-comptes (Espèces, Wave, Banque, Épargne) et virements internes à neutralité statistique (`/portefeuilles`).
- **debts** : Dossiers de dettes et créances avec enregistrement de remboursements partiels (`/dettes`).
- **insights** : Moteur d'analyse financière déterministe avec conseils automatisés sur le tableau de bord.
- **data** : Import CSV dédupliqué et export de sauvegarde JSON complet conforme RGPD (`/parametres`).
- **design** : Interface néobrutaliste moderne, navigation enrichie et support complet des thèmes Clair, Sombre et Système.

### Breaking Changes
- Refonte de la base de données avec rattachement obligatoire par `userId` et nouvelles entités relationnelles.
