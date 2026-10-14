# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2026-10-14

### Features
- **historique** : Refonte contextuelle de l'historique avec matrice d'affichage intelligente (`getHistoryVisibility`) masquant dynamiquement le résumé financier sur les entrées, masquant les graphiques et sections redondantes lors du filtrage par catégorie spécifique, et adaptant les libellés ("Moyen de réception" pour les entrées, "Moyen de paiement" pour les dépenses).
- **pagination** : Pagination serveur par curseur (`getTransactionsPageAction`) avec tri déterministe `[date DESC, id DESC]`, bouton néobrutaliste "Charger plus" avec indicateur de progression, et réinitialisation propre à la première page lors de modifications de filtres.
- **performance** : Agrégations serveur directes (`getHistoryStatsAction`) par `groupBy` Prisma sur les totaux par type, catégorie et portefeuille pour la période courante et la période précédente, avec transmission des statistiques précalculées aux composants de visualisation.
- **db** : Migration `history_pagination_index` ajoutant l'index composé optimisé `idx_transactions_user_date_id (user_id, date DESC, id)` pour garantir des requêtes de pagination ultra-rapides sans scan de table.
- **navigation** : Synchronisation bidirectionnelle fluide de l'ensemble des filtres dans l'URL (`period`, `type`, `category`, `payment`, `tab`, `start`, `end`) sans rechargement de page via `window.history.replaceState`.
- **filtres** : Dépendance stricte du sélecteur de catégories désactivé avec message incitatif ("Choisissez d'abord un type") tant qu'aucun type n'est sélectionné, et réinitialisation automatique si la catégorie devient incompatible avec le nouveau type.
- **analytics** : Généralisation des composants d'analyse `CategoryChart` et `CategoryRanking` acceptant indifféremment les entrées et les dépenses avec palettes dynamiques.
- **export** : Prise en compte de l'ensemble des filtres actifs (`period`, `type`, `category`, `payment`, dates personnalisées) dans l'export et l'impression PDF via `/api/export/pdf`.
- **tests** : Couverture complète de la matrice de visibilité et de la pagination (`tests/history.test.ts`), portant la suite de tests à 123 tests unitaires réussis à 100 %.

---

## [2.3.0] - 2026-10-14

### Features
- **wallets** : Les portefeuilles deviennent la source unique et vivante de tous les moyens de paiement de l'application (suppression de la dépendance aux constantes codées en dur).
- **db** : Migration `wallets_payment_source` avec ajout de la colonne `is_archived` sur `wallets`, index d'optimisation, ajout de la clé étrangère `wallet_id` sur `recurring_rules`, et rétro-compatibilité Expand/Contract synchronisant en continu la colonne textuelle `payment`.
- **migrations** : Backfill automatisé en base créant les portefeuilles manquants d'après les anciens libellés textuels et reliant 100 % des transactions et règles récurrentes sans perte de données.
- **architecture** : Intégration du cache unifié `useWallets` dans `ReferenceDataProvider` fournissant la couleur dynamique de chaque portefeuille et un calcul de contraste W3C lisible pour les badges et graphiques.
- **ui** : Refonte complète des sélecteurs de moyens de paiement dans `TransactionForm`, `EditTransactionModal`, `RecurringModal`, `HistoryView`, `RecentTransactionsList`, `TransactionItem`, `RecurringCard` et `PaymentMethodChart`.
- **portefeuilles** : Ajout du cycle d'archivage/désarchivage de portefeuilles (`archiveWalletAction`), protection contre l'archivage du compte principal, interdiction stricte de suppression des portefeuilles liés à des transactions avec recommandation d'archivage, et filtre d'affichage des comptes archivés sur `/portefeuilles`.
- **tests** : Extension de la suite de tests unitaires à 109 tests réussis (`tests/wallets.test.ts`), 0 erreur TypeScript et conformité ESLint stricte avec 0 warning.

---

## [2.2.0] - 2026-10-14

### Features
- **db** : Création de la table `categories` en base de données avec enum `CategoryKind` (`INCOME`, `EXPENSE`, `BOTH`), contrainte d'unicité par utilisateur `(user_id, name)`, index de performance et isolation hermétique RLS (4 politiques `authenticated`).
- **architecture** : Implémentation du patron Expand/Contract avec ajout de `category_id` (FK `ON DELETE RESTRICT`) sur `transactions`, `budgets` et `recurring_rules` tout en maintenant synchronisées les colonnes textuelles d'origine `category`.
- **migrations** : Migration SQL et script de backfill automatisé assurant le peuplement des catégories par défaut et la réconciliation sans perte des catégories existantes et personnalisées de chaque utilisateur.
- **categories** : Nouvelles Server Actions dédiées (`getCategoriesAction`, `upsertCategoryAction`, `archiveCategoryAction`, `deleteCategoryAction`) avec initialisation paresseuse, validation Zod, interdiction de suppression si référencée (avec proposition d'archivage) et propagation transactionnelle atomique des renommages.
- **ui** : Modal de gestion des catégories néobrutaliste (`CategoryManagerModal`) intégrée à `/budgets` avec filtrage par type, palette contrôlée de 20 nuances, calcul automatique du contraste W3C du texte selon la luminance, prévisualisation en direct, archivage et modification instantanés.
- **providers** : Nouveau contexte client `ReferenceDataProvider` et hook universel `useCategories` pour la distribution et le cache des catégories et de leurs couleurs sur l'ensemble de l'application (`BudgetModal`, `BudgetCard`, `TransactionForm`, `EditTransactionModal`, `RecurringModal`, `RecurringCard`, `HistoryView`, `RecentTransactionsList`).
- **import-csv** : Réconciliation automatique et création dynamique des catégories manquantes lors de l'importation de fichiers CSV avec rattachement immédiat de `categoryId`.
- **tests** : Couverture unitaire étendue (`tests/categories.test.ts`) portant la suite à 103 tests réussis à 100 %.

---

## [2.1.0] - 2026-10-14

### Features
- **insights** : Tri déterministe des observations financières par sévérité prioritaire (`danger` > `warning` > `info` > `success`) afin de présenter les alertes critiques en premier.
- **insights** : Nouveau composant carrousel interactif néobrutaliste (`InsightsCarousel`) sans dépendance externe : affichage d'une alerte à la fois, pagination fluide par glissement, défilement automatique (6 s) avec mise en pause au survol et au focus clavier, boutons de navigation précédent / suivant, indicateurs cliquables et compteur textuel, support tactile (swipe mobile), navigation au clavier (flèches gauche/droite) et prise en compte de l'accessibilité `prefers-reduced-motion`.

---

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
