# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0] - 2026-10-20

### Features
- **transactions** : Nouveau composant unifié et compact d'item d'opération `TransactionListItem` (`components/transactions/TransactionListItem.tsx`), partagé entre l'Accueil (`RecentTransactionsList`) et l'Historique (`HistoryView`), conçu comme un bouton interactif accessible avec `aria-label` descriptif complet.
- **transactions** : Nouvelle modale accessible et détaillée `TransactionDetailsModal` (`components/transactions/TransactionDetailsModal.tsx`) présentant la totalité des attributs d'une opération (catégorie et statut d'archivage, portefeuille et moyen de paiement, trajet source vers cible pour les virements, horodatage complet en français, note intégrale sans restriction de hauteur et métadonnées techniques de création et modification).
- **transactions** : Actions de modification directe (`EditTransactionModal`) et de suppression irréversible (`ConfirmDialog`) centralisées dans `TransactionDetailsModal` (une seule instance par liste parente).
- **accueil** : Ajout de la vue "Semaine en cours" dans le sélecteur de périodes de l'accueil (`BalanceSummary`), calculée rigoureusement du lundi au dimanche (`weekStartsOn: 1`) et affichant la plage textuelle sous les cartes de synthèse (ex: `du 12/10 au 18/10`).
- **accueil** : Résolution du constat technique C5 dans `getDashboardDataAction` (`actions/transactions.ts`) : extension dynamique de la borne de requête (`min(week.from, year.from)`) pour intégrer fidèlement les transactions de fin d'année civile précédente lors d'une semaine à cheval sur deux années (ex: 29 décembre 2025 pour la semaine du 1er janvier 2026).

### Fixes
- **transactions** : Correction du constat C4 et respect strict de la Règle 5 : les virements internes (`TRANSFER`) ne sont plus jamais assimilés à des dépenses ni affichés avec un signe négatif ou un badge rouge. Ils bénéficient d'un logo dédié (`ArrowRightLeft`), d'un montant neutre et de la mention explicite des comptes source et cible.

### Tests
- **tests** : Nouvelle suite de tests automatisés (`tests/v290-transaction-details-week-view.test.ts`) validant les calculs calendaires de la semaine, les semaines à cheval sur deux années, le respect des bornes de début et fin de semaine, et la stricte neutralité financière des virements dans les résumés.

---

## [2.8.0] - 2026-10-20

### Features
- **wallets** : Ajustement du solde réel déclaré à T0 (`declaredBalance` & `declaredAt`) pour chaque portefeuille, permettant aux utilisateurs d'aligner le solde de leur compte sur la réalité physique sans fausser ni réécrire l'historique comptable passé.
- **wallets** : Formule de solde dynamique et rétrocompatible : Solde effectif = Solde déclaré (T0) + Somme des mouvements postérieurs à T0. En l'absence de solde déclaré, le calcul préserve le fonctionnement classique (`initialBalance` + historique complet).
- **wallets** : Refonte de `WalletModal` avec bascule entre "Solde initial" (création) et "Solde actuel sur ce compte" (modification), avec mention explicite du rôle de référence dans le sous-titre et validation Zod (`declaredBalance`).
- **wallets** : Ajout d'un badge temporel sur les cartes de portefeuilles (`WalletCard`) indiquant la date du dernier ajustement (`Ajusté le DD MMM`) lorsque le solde a été déclaré.
- **accueil** : Synchronisation sémantique et financière de l'accueil (`BalanceSummary`) :
  - La carte principale affiche désormais explicitement "Solde Total Disponible" (cohérent avec le patrimoine total des portefeuilles).
  - La carte de flux affiche "Flux net de la période" (différence entre les entrées et les sorties réelles sur la période sélectionnée) pour éviter toute confusion entre flux périodique et solde global cumulé.
- **tooling** : Ajout du script npm `"clean"` dans `package.json` pour purger les caches `.next` en cas de conflit entre builds de production et serveur Turbopack.

### Database
- **migration** : Ajout des colonnes additives `declared_balance` (NUMERIC(12, 2)) et `declared_at` (TIMESTAMPTZ) sur la table `wallets` (`prisma/migrations/migration_v2_8_0.sql`), avec mise à jour du schéma Prisma (`prisma/schema.prisma`).

### Tests
- **tests** : Nouvelle suite de tests automatisés (`tests/wallet-declared-balance.test.ts`) validant l'étanchéité des mouvements antérieurs/postérieurs à T0, les soldes négatifs, les virements inter-comptes et la réconciliation globale, portant la suite globale à 186 tests réussis à 100 %.

---

## [2.7.1] - 2026-10-19

### Fixes
- **wallets** : Unification de la source de calcul du solde global (Accueil) et du patrimoine total (`/portefeuilles`) via le service centralisé `getWalletBalancesForUser` (`lib/services/wallet-balances.ts`). Le solde de l'accueil intègre désormais fidèlement les soldes initiaux et les mouvements réels de tous les comptes.
- **wallets** : Règle d'or du patrimoine (ADR-02 / Q10) : le patrimoine total somme désormais tous les comptes de l'utilisateur, archivés compris, avec mention explicite du montant détenu sur les comptes archivés (`dont X FCFA sur des comptes archivés`) et calcul immuable indépendant du filtre d'affichage.
- **ui** : Correction du backdrop délavé lors de la confirmation de désarchivage : déport de `ConfirmDialog` et `Modal` hors des conteneurs parents soumis à des filtres d'opacité (tels que `opacity-80` des cartes archivées) via `createPortal(..., document.body)`, avec blocage du défilement du body et accessibilité ARIA complète (`role="alertdialog"` / `role="dialog"`).
- **export** : Période d'export affichée en dates calendaires complètes et explicites (`formatExportPeriodLabel`) au lieu des codes techniques `WEEK` ou `TODAY` (ex: `du 01/09/2026 au 07/09/2026`, `05/09/2026`).
- **export** : Encadré descriptif des filtres appliqués dans le rapport PDF (`describeExportFilters`), adaptation dynamique des cartes de synthèse selon le type d'opération sélectionné (masquage des totaux hors périmètre) et transmission de `start`/`end` pour les périodes personnalisées depuis l'historique.
- **export** : Typage et affichage conformes des virements internes (`TRANSFER`) : libellés comme `VIREMENT` (et non plus `DÉPENSE`) dans le PDF et le CSV, montants sans signe négatif indu, et ajout d'une note d'information sur la neutralité financière des virements.
- **security** : Assainissement XSS systématique (`escapeHtml`) de toutes les données textuelles saisies par l'utilisateur (catégories, notes, moyens) avant injection dans le gabarit d'impression PDF.

### Style
- **accueil** : Épuration visuelle de la carte Bilan Financier (`FinancialInsightsCard`) : suppression du titre textuel redondant "Bilan & Conseils Financiers" et alignement moderne de l'icône néobrutaliste à gauche avec le carrousel interactif occupant l'espace restant.


## [2.7.0] - 2026-10-14

### Features
- **wallets** : Élimination complète des pop-ups `alert()` et `confirm()` natives du navigateur au profit du composant néobrutaliste accessible `ConfirmDialog` pour la suppression, l'archivage et le désarchivage de comptes.
- **wallets** : Pré-remplissage garanti et synchronisation réactive de `WalletModal` avec `initialData` et état d'ouverture `isOpen`, éliminant les données résiduelles en modification.
- **wallets** : Auto-sélection dynamique du portefeuille source dans `TransferModal` lors du clic sur l'action "Faire un virement depuis ce compte" sur n'importe quel `WalletCard`, avec réajustement automatique du compte cible pour prévenir les transferts circulaires.
- **wallets** : Contrôle d'unicité de la couleur des portefeuilles par utilisateur dans `upsertWalletAction` (insensible à la casse) et neutralisation visuelle des couleurs occupées dans la palette de `WalletModal` avec badge d'indisponibilité.
- **budgets** : Contrôle d'unicité de la couleur des catégories par utilisateur dans `upsertCategoryAction` (à la création comme à l'édition) et marquage direct des teintes indisponibles dans `CategoryManagerModal` avec infobulle contextuelle et adaptation du générateur aléatoire.
- **tests** : Nouvelle suite de tests automatisés (`tests/v270-ux-wallets-budgets.test.ts`) validant les règles d'unicité de couleurs, l'isolation multi-utilisateurs et la logique d'auto-sélection des virements, portant la suite globale à 161 tests réussis à 100 %.

### Fixes
- **ui** : Éradication définitive de tous les appels résiduels à `window.confirm()` / `confirm()` natifs dans l'application (`RecurringCard`, `DebtCard`) au profit systématique du composant modal néobrutaliste accessible `ConfirmDialog`.

---

## [2.6.1] - 2026-10-14

### Fixes
- **server-actions** : Déport des constantes et objets (`DEFAULT_CATEGORIES`, `RESET_COOKIE_NAME`, `RESET_COOKIE_MAX_AGE`) hors des fichiers `'use server'` (`actions/categories.ts`, `actions/auth-recovery.ts`) vers des modules de constantes dédiés (`constants/categories.ts`, `constants/auth.ts`) pour respecter la spécification stricte de Next.js Turbopack interdisant l'export de valeurs non-fonctions depuis les Server Actions.

---

## [2.6.0] - 2026-10-14

### Features
- **reminders** : Moteur de détection déterministe des rappels d'échéances des règles récurrentes (`getRemindersDueOn`) avec paliers d'anticipation à J-7, J-3 et le jour de l'échéance (J0), prise en compte rigoureuse du clamp de fin de mois (`resolveDueDate`) et politique anti-doublon.
- **db** : Nouvelle table `recurring_reminder_logs` en base de données avec contrainte d'unicité `(rule_id, due_date, offset_days)`, indexation optimisée, suivi des tentatives (jusqu'à 3) et politique de sécurité RLS.
- **mailer** : Service d'expédition d'emails transactionnels avec Nodemailer (`lib/mailer.ts`), interfaçage avec Mailpit en environnement de développement local (port 54325) et SMTP sécurisé en production, gabarit HTML néobrutaliste aux couleurs de l'application avec mise en valeur du montant en FCFA.
- **cron** : Endpoint serveur planifié `/api/cron/reminders` sécurisé par `CRON_SECRET`, extraction sans session des règles et destinataires associés, et planification quotidienne déclarée dans `vercel.json` (`0 8 * * *`).
- **ui** : Réactivation complète du module "Règles Récurrentes" sur `/gestion`, intégration du champ `remindersEnabled` avec interrupteur dédié dans `RecurringModal`, et affichage des indicateurs de statut de rappel (`Bell` / `BellOff`) sur chaque `RecurringCard`.
- **tests** : Couverture unitaire étendue (`tests/recurring-reminders.test.ts`) avec validation des déduplications, du clamp calendaire et de l'exclusion des règles inactives/désactivées, portant la suite globale à 142 tests réussis à 100 %.

---

## [2.5.0] - 2026-10-14

### Features
- **auth** : Politique de sécurité de mot de passe stricte et unifiée (`PasswordSchema`) : minimum 8 caractères, au moins une minuscule, une majuscule, un chiffre et un caractère spécial, garantie côté serveur dans `supabase/config.toml` (`lower_upper_letters_digits_symbols`).
- **ui** : Nouveau composant néobrutaliste autonome `PasswordStrengthMeter` avec barre segmentée en 4 sections, libellés textuels explicites ("Faible", "Moyen", "Bon", "Robuste") et checklist de conformité détaillée en temps réel.
- **recovery** : Parcours complet de récupération de mot de passe en 3 étapes sécurisées :
  - `/mot-de-passe-oublie` : Saisie d'email avec réponse générique anti-énumération de comptes (`requestPasswordResetAction`).
  - `/mot-de-passe-oublie/verification` : Saisie du code OTP à 6 chiffres avec compte à rebours de 60 secondes pour le renvoi et émission d'un cookie court `httpOnly` (5 min) attestant la vérification (`verifyPasswordResetOtpAction`).
  - `/mot-de-passe-oublie/nouveau` : Définition du nouveau mot de passe avec validation en direct, restriction stricte aux sessions munies du cookie de vérification et redirection propre vers la connexion (`resetPasswordAction`).
- **security** : Durcissement des limites d'émission d'emails dans Supabase (`max_frequency = "60s"`, `otp_expiry = 600s`), gabarit HTML néobrutaliste dédié pour les e-mails de récupération (`supabase/templates/recovery.html`), et protection des routes dans `middleware.ts`.
- **tests** : Nouvelle suite de tests unitaires dédiés (`tests/auth-recovery.test.ts`), portant la suite globale à 134 tests automatisés réussis à 100 %.

---

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
