# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
