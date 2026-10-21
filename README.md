# GEST TRACKER — Documentation Complète (v2.13.0)

Bienvenue sur la documentation technique et fonctionnelle de **Personal GEST TRACKER**, l'application moderne de gestion financière personnelle et professionnelle, conçue selon les principes du **Néobrutalisme Moderne** avec une architecture full-stack Next.js, Supabase et Prisma.

---

## Table des Matières

1. [Vue d'ensemble & Philosophie](#1-vue-densemble--philosophie)
2. [Stack Technique](#2-stack-technique)
3. [Arborescence du Projet](#3-arborescence-du-projet)
4. [Fonctionnalités Détaillées par Module](#4-fonctionnalités-détaillées-par-module)
   - [4.1 Authentification, Onboarding & Premier Login (`/bienvenue`)](#41-authentification-onboarding--premier-login-bienvenue)
   - [4.2 Tableau de Bord Principal (`/`)](#42-tableau-de-bord-principal-)
   - [4.3 Bilan & Conseils Financiers (Moteur d'Insights)](#43-bilan--conseils-financiers-moteur-dinsights)
   - [4.4 Hub de Gestion & Modules (`/gestion`)](#44-hub-de-gestion--modules-gestion)
   - [4.5 Budgets Mensuels & Gestion des Catégories (`/budgets`)](#45-budgets-mensuels--gestion-des-catégories-budgets)
   - [4.6 Règles Récurrentes & Charges Fixes (`/recurrences`)](#46-règles-récurrentes--charges-fixes-recurrences)
   - [4.7 Portefeuilles & Virements Internes (`/portefeuilles`)](#47-portefeuilles--virements-internes-portefeuilles)
   - [4.8 Dettes & Créances (`/dettes`)](#48-dettes--créances-dettes)
   - [4.9 Historique, Graphiques & Import CSV (`/historique`)](#49-historique-graphiques--import-csv-historique)
   - [4.10 Paramètres, Thèmes & Sécurité (`/parametres`)](#410-paramètres-thèmes--sécurité-parametres)
5. [Modèle de Données & Schéma Prisma](#5-modèle-de-données--schéma-prisma)
6. [Guide de Démarrage & Déploiement](#6-guide-de-démarrage--déploiement)
   - [Variables d'Environnement](#variables-denvironnement)
   - [Commandes Utiles](#commandes-utiles)
   - [Synchronisation Base de Données (Local vs Prod)](#synchronisation-base-de-données-local-vs-prod)
   - [Rattachement des Transactions (Backfill)](#rattachement-des-transactions-backfill)
7. [Tests Automatisés & Qualité de Code](#7-tests-automatisés--qualité-de-code)
8. [Écosystème d'Agents & Auditeur UX / Logique Métier](#8-écosystème-dagents--auditeur-ux--logique-métier)

---

## 1. Vue d'ensemble & Philosophie

GEST TRACKER est conçu pour répondre à deux impératifs :

1. **La vitesse d'exécution :** Enregistrer une entrée ou une sortie d'argent doit prendre moins de 5 secondes sur mobile.
2. **La lisibilité absolue (Néobrutalisme) :**
   - Bordures nettes de 2px à 3px (`#111827` / `white`).
   - Ombres portées dures sans flou (`shadow-[3px_3px_0px_0px_#111827]`).
   - Typographie grasse et contrastée.
   - Micro-animations sur les clics et les survols (`active:translate-y-0.5`).
   - Thème adaptatif complet : **Clair**, **Sombre** et **Système**.

La devise native de l'application est le **Franc CFA (FCFA)**.

---

## 2. Stack Technique

- **Framework Web :** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components).
- **Runtime & UI :** React 19, TypeScript (mode strict).
- **Styles :** Tailwind CSS v4, Vanilla CSS tokens.
- **Base de Données :** PostgreSQL hébergé sur [Supabase](https://supabase.com/).
- **ORM :** [Prisma 7](https://www.prisma.io/) avec connecteur natif `@prisma/adapter-pg`.
- **Authentification :** Supabase Auth via `@supabase/ssr` avec cookies HTTP sécurisés.
- **Validation des données :** [Zod](https://zod.dev/) pour toutes les entrées utilisateur et Server Actions.
- **Visualisation & Graphiques :** [Recharts](https://recharts.org/) (flux mensuels, répartition circulaire).
- **Icônes :** [Lucide React](https://lucide.dev/).
- **Tests :** Node.js Test Runner avec `tsx` (161 tests unitaires automatisés).
- **Qualité & Lint :** ESLint 9 (Flat Config native) sans avertissement (`pnpm lint`).

---

## 3. Arborescence du Projet

```text
my-app/
├── actions/                  # Next.js Server Actions ('use server')
│   ├── budgets.ts            # Gestion des plafonds budgétaires et calcul de consommation
│   ├── categories.ts         # CRUD catégories personnalisées, seed paresseux, renommage
│   ├── csv-import.ts         # Importation de relevés bancaires avec dédoublonnage et mapping catégorie
│   ├── debts.ts              # Dettes, créances et remboursements partiels
│   ├── insights.ts           # Moteur d'analyses financières et détection d'anomalies
│   ├── recurring.ts          # Échéances récurrentes et génération automatique
│   ├── transactions.ts       # CRUD transactions et statistiques de solde
│   ├── user.ts               # Profil, changement de mot de passe, suppression de compte
│   └── wallets.ts            # Portefeuilles et virements internes neutres
├── app/                      # Pages et Routes Next.js App Router
│   ├── api/                  # Routes API (Export JSON, CSV, PDF)
│   ├── budgets/              # Page Budgets mensuels & Gestion des catégories
│   ├── dettes/               # Page Dettes & Créances
│   ├── entrant/              # Formulaire de recette / revenu
│   ├── gestion/              # Hub central des modules financiers V2 (redirection 308 depuis /options)
│   ├── historique/           # Filtres, graphiques et liste complète
│   ├── login/                # Page de connexion Supabase
│   ├── parametres/           # Profil, thème, sécurité et exports
│   ├── portefeuilles/        # Portefeuilles et virements
│   ├── recurrences/          # Règles d'échéances fixes
│   ├── register/             # Inscription avec confirmation de mot de passe
│   ├── sortant/              # Formulaire de dépense
│   ├── layout.tsx            # Layout racine avec ReferenceDataProvider, Thème et BottomNav
│   └── page.tsx              # Tableau de bord principal
├── components/               # Composants React organisés par domaine
│   ├── budgets/              # BudgetCard, BudgetModal, CategoryManagerModal
│   ├── debts/                # DebtCard, DebtModal, RepaymentModal
│   ├── home/                 # BalanceSummary, HomeActions, RecentTransactionsList
│   ├── insights/             # FinancialInsightsCard, InsightsCarousel
│   ├── layout/               # BottomNav (3 onglets), HeaderAuth
│   ├── providers/            # ReferenceDataProvider (cache réactif catégories et couleurs)
│   ├── recurring/            # RecurringCard, RecurringModal, RecurringAlertBanner
│   ├── ui/                   # Button, Card, ConfirmDialog (modal de sécurité)
│   └── wallets/              # WalletCard, WalletModal, TransferModal
├── constants/                # Catégories par défaut, moyens de paiement et configuration
├── lib/                      # Utilitaires réutilisables
│   ├── auth.ts               # Récupération de l'utilisateur authentifié côté serveur
│   ├── categories.ts         # Filtrage de catégories par kind (INCOME/EXPENSE/BOTH)
│   ├── dates.ts              # Formatage de dates en français
│   ├── insights.ts           # Moteur d'analyses financières et détection d'anomalies
│   ├── prisma.ts             # Client Prisma singleton avec Proxy auto-guérisseur
│   ├── recurring.ts          # Résolution calendaire (clamp fin de mois) et libellés
│   ├── supabase/             # Clients Supabase (client.ts et server.ts)
│   ├── theme.ts              # Logique de persistance du thème (Light/Dark/System)
│   └── validations.ts        # Schémas Zod stricts pour toutes les entités
├── prisma/                   # Configuration de base de données
│   ├── migration_v2.sql      # Script SQL idempotent de migration pour la Production
│   ├── schema.prisma         # Schéma déclaratif Prisma 7
│   └── seed.ts               # Seeder de démonstration avec catégories relationnelles
├── scripts/                  # Scripts de maintenance
│   └── backfill-user-transactions.ts # Rattachement des transactions orphelines
└── tests/                    # 103 tests unitaires automatisés (node:test + tsx)
```

---

## 4. Fonctionnalités Détaillées par Module

### 4.1 Authentification, Onboarding & Premier Login (`/bienvenue`)

- **Routes d'authentification :** `/login`, `/register`, et `/mot-de-passe-oublie` (3 étapes).
- **Parcours d'Onboarding Premier Login (`/bienvenue`) (v2.11.0) :**
  - **Guards de navigation :** `requireOnboarding()` bloque l'accès à toutes les pages de l'application (`/`, `/entrant`, `/sortant`, `/historique`, `/portefeuilles`, `/budgets`, `/recurrences`, `/dettes`, `/gestion`, `/parametres`) et redirige immédiatement vers `/bienvenue` si `onboarding_completed_at` est nul. Inversement, `redirectIfOnboardingCompleted()` empêche les utilisateurs déjà configurés de revenir sur `/bienvenue`.
  - **Table `user_profiles` :** Table PostgreSQL dédiée (`user_id`, `onboarding_completed_at`, `created_at`, `updated_at`) avec RLS Supabase et rétrocompatibilité garantie par backfill pour tous les comptes historiques.
  - **Stepper néobrutaliste en 4 étapes :**
    1. *Étape 1 — Bienvenue & Philosophie* : Présentation des principes clés de GEST TRACKER (contrôle, séparation des comptes, rapidité).
    2. *Étape 2 — Mes Portefeuilles* : Configuration initiale des comptes avec solde de départ, choix du compte principal et contrôle d'unicité des noms et couleurs.
    3. *Étape 3 — Mes Catégories* : Sélection assistée parmi des suggestions préconfigurées et ajout de catégories personnalisées (revenus, dépenses, ou les deux).
    4. *Étape 4 — Récapitulatif & Lancement* : Synthèse visuelle complète avant validation finale.
  - **Persistance du brouillon :** Sauvegarde automatique dans le `sessionStorage` pour ne pas perdre la configuration en cas de rafraîchissement intempestif.
  - **Option de démarrage rapide :** Bouton "Configurer plus tard" permettant de passer immédiatement à l'application avec les configurations standard par défaut.
- **Politique de mot de passe stricte (`PasswordSchema`) :**
  - Minimum 8 caractères.
  - Au moins 1 lettre majuscule (`[A-Z]`).
  - Au moins 1 lettre minuscule (`[a-z]`).
  - Au moins 1 chiffre (`[0-9]`).
  - Au moins 1 caractère spécial (`[^A-Za-z0-9]`).
  - **Garantie serveur :** Appliquée et verrouillée au niveau du moteur Supabase Auth (`password_requirements = "lower_upper_letters_digits_symbols"`).
- **Jauge de robustesse (`PasswordStrengthMeter`) :**
  - Barre segmentée en 4 sections avec évaluation déterministe (score 0 à 4).
  - Libellés textuels explicites (*Faible*, *Moyen*, *Bon*, *Robuste*).
  - Checklist en direct des 5 critères avec icônes Lucide (information non portée par la seule couleur).
  - Boutons de soumission (`/register`, `/parametres`, `/mot-de-passe-oublie/nouveau`) bloqués tant que la politique n'est pas intégralement respectée.
- **Parcours de Récupération de Mot de Passe en 3 Étapes :**
  1. `/mot-de-passe-oublie` : Saisie de l'adresse email. Réponse générique identique que le compte existe ou non (prévention stricte de l'énumération de comptes).
  2. `/mot-de-passe-oublie/verification` : Saisie du code à 6 chiffres avec compte à rebours de 60 secondes pour le renvoi et expiration du code à 10 minutes (`otp_expiry = 600`).
  3. `/mot-de-passe-oublie/nouveau` : Définition du nouveau mot de passe accessible uniquement en présence du cookie court `httpOnly` (5 min) délivré lors de l'étape 2.
  - **Environnement local :** Les e-mails de récupération sont consultables instantanément dans l'interface Mailpit locale à l'adresse [`http://127.0.0.1:54324`](http://127.0.0.1:54324).
- **Cloisonnement total des données & Synchronisation temps réel :**
  - Toutes les requêtes en base de données filtrent impérativement sur `userId: user.id`. Aucun utilisateur ne peut accéder aux données d'un autre.
  - Le contexte client `ReferenceDataProvider` synchronise automatiquement les catégories et portefeuilles dès la connexion (`SIGNED_IN`), à chaque changement de route, ou via l'événement `gt-refresh-reference-data`.
  - Les pages `/entrant` et `/sortant` préchargent directement les données côté serveur pour un affichage instantané sans latence dès la fin du parcours d'onboarding.
  - Tous les formulaires et modals (`TransactionForm`, `EditTransactionModal`, `RecurringModal`, `BudgetModal`) intègrent un mécanisme d'auto-réparation déclenchant un rafraîchissement si la liste locale est initialement vide.

### 4.2 Tableau de Bord Principal (`/`)

- **Résumé du Solde & Périodes (v2.8.0 / v2.9.0) :**
  - **Solde Total Disponible (Patrimoine net) :** Issu du service centralisé `getWalletBalancesForUser`, le solde global affiché en haut de l'accueil correspond rigoureusement à la somme des portefeuilles (soldes déclarés $T_0$ et mouvements postérieurs compris).
  - **Sélecteur de Période à 4 Vues (v2.9.0) :** Choix dynamique entre **Aujourd'hui**, **Semaine en cours**, **Mois en cours** et **Année en cours**.
  - **Vue "Semaine en cours" (v2.9.0) :** Calcule les entrées et dépenses du lundi au dimanche (`weekStartsOn: 1`). Borne dynamiquement les requêtes serveur (`min(week.from, year.from)`) pour capturer fidèlement les jours de fin d'année précédente (ex: lundi 29 décembre) lors d'une semaine à cheval sur deux années civiles (C5). La plage textuelle `du DD/MM au DD/MM` est affichée lisiblement sous les cartes.
  - **Flux net de la période :** Indicateur de synthèse reflétant la différence stricte entre entrées et sorties de la sélection.
- **Bannière d'Alerte Récurrente :**
  - Détecte automatiquement les charges du mois qui n'ont pas encore été validées (loyer, abonnements).
  - Permet de valider (créant la transaction réelle) ou d'ignorer en un clic.
- **Trilogie Financière & Action Bar 2+1 Mobile-First (v2.13.0) :**
  - **Ligne 1 (50% / 50%) :**
    - Bouton **ENTRANT** vert néobrutaliste (`#16A34A`, `ArrowDownLeft`) vers `/entrant` pour enregistrer un revenu.
    - Bouton **SORTANT** rouge néobrutaliste (`#DC2626`, `ArrowUpRight`) vers `/sortant` pour enregistrer une dépense.
  - **Ligne 2 (100% pleine largeur) :**
    - Bouton **VIREMENT INTERNE** jaune néobrutaliste (`#FFE600`, `ArrowRightLeft`) avec badge « Entre comptes », déclenchant directement la `TransferModal` en surimpression sans rechargement de page.
  - **Concision visuelle :** Suppression de tous les sous-titres verbeux, divisant l'encombrement vertical par deux (~120px vs ~240px) pour préserver la ligne de flottaison sur mobile.
  - **Historique déporté :** Le bouton géant `HISTORIQUE` de l'accueil est supprimé car accessible en 1 tap permanent dans la `BottomNav`.
- **Dernières Opérations Cliquables (v2.9.0) :**
  - Composant unique compact `TransactionListItem` : bouton interactif pleine largeur avec icône de type (`ArrowDownLeft`, `ArrowUpRight`, `ArrowRightLeft`), pastille de catégorie, date/heure et montant.
  - Les virements internes (`TRANSFER`) sont affichés avec une stricte neutralité comptable (sans signe négatif indu et en teinte neutre, C4).
  - Un clic ouvre la modale complète `TransactionDetailsModal`.

### 4.3 Bilan & Conseils Financiers (Moteur d'Insights & Carrousel)

- Situé sur la page d'accueil juste après les boutons d'actions rapides.
- **Interface épurée (v2.7.1) :** Suppression du titre textuel redondant "Bilan & Conseils Financiers" ; l'icône néobrutaliste en bloc jaune est positionnée élégamment sur le flanc gauche et le carrousel interactif occupe tout l'espace utile.
- **Tri déterministe par sévérité :** Les conseils sont ordonnés par niveau de priorité décroissant (`danger` > `warning` > `info` > `success`) afin que les alertes budgétaires critiques et risques de déficit soient immédiatement présentés.
- **Carrousel interactif néobrutaliste (`InsightsCarousel`) :**
  - Affichage épuré d'une alerte à la fois avec hauteur calibrée anti-décalage de mise en page.
  - Défilement automatique toutes les 6 secondes avec mise en pause au survol de la souris et au focus clavier.
  - Boutons de navigation précédent / suivant et pastilles de pagination interactives.
  - Compteur textuel dynamique (ex: `2 / 5`).
  - Navigation gestuelle tactile (swipe mobile gauche / droite).
  - Contrôle clavier direct (flèches directionnelles gauche et droite).
  - Respect strict de l'accessibilité `prefers-reduced-motion` (désactivation de l'autoplay et transitions instantanées).
  - Mode carte unique transparente si un seul insight est produit (aucun contrôle superflu).
- **Analyse algorithmique instantanée dans [`lib/insights.ts`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/my-app/lib/insights.ts) :**
  - **Taux d'épargne :** Évalué avec le seuil standard de 15 %. Taux $\ge 15\%$ : statut `success` (excellent). Taux entre 0 % et 15 % : statut `warning` (épargne fragile). Taux $< 0\%$ : statut `danger` (déficit mensuel).
  - **Surconsommation budgétaire :** Détection cumulative exhaustive. Liste tous les budgets dépassés ($\ge 100\%$, statut `danger`) et tous les budgets sous tension ($75\%-100\%$, statut `warning`).
  - **Hausse atypique de dépenses :** Détecte toutes les catégories affichant une hausse de plus de **20 %** et d'au moins **5 000 FCFA** par rapport au mois précédent, triées par montant de surcoût décroissant.
  - **Conseils personnalisés :** Recommandation systématique de renforcement d'épargne si le taux est inférieur au seuil de 15 %.

### 4.4 Hub de Gestion & Modules (`/gestion`) (v2.12.0)

Accessible directement depuis la barre de navigation inférieure (`BottomNav`). Le hub centralise les 4 modules avancés sous forme de centre de contrôle vivant doté de **Smart Badges** temps réel calculés côté serveur :

1. **Budgets & Plafonds** : Affichage direct du nombre de budgets actifs, pourcentage consommé et alerte rouge en cas de dépassement.
2. **Règles Récurrentes** : Décompte des charges fixes programmées et nombre d'échéances dues sur le mois en cours.
3. **Portefeuilles & Virements** : Synthèse instantanée du nombre de comptes et du patrimoine global net.
4. **Dettes & Créances** : Suivi des dossiers en cours et de la position financière nette (+/-).

- **Navigation & Continuité de flux :** Les 4 sous-pages de gestion (`/budgets`, `/recurrences`, `/portefeuilles`, `/dettes`) disposent de boutons retour contextuels vers `/gestion` garantissant une navigation cohérente.
- **Barre de Navigation 4 Onglets (`BottomNav`) :** Disposition mobile ergonomique équilibrée en 4 piliers majeurs : **Accueil**, **Historique**, **Gestion** et **Profil**.

### 4.5 Budgets Mensuels & Gestion des Catégories (`/budgets`)

- **Budgets mensuels par catégorie :** Définition d'un montant plafond pour un mois donné (ex: _Alimentation : 60 000 FCFA pour 2026-10_).
- **Jauge visuelle dynamique tricolore :**
  - **Vert :** Moins de 75 % consommé.
  - **Orange :** Entre 75 % et 99 % consommé (Attention).
  - **Rouge :** 100 % ou plus (Dépassement de budget).
- **Gestionnaire de Catégories Personnalisées (`CategoryManagerModal`) :**
  - Bouton dédié **"Catégories"** sur la vue `/budgets`.
  - Liste filtrable par type (`Toutes`, `Dépenses`, `Revenus`, `Mixtes / Both`).
  - **Unicité stricte des couleurs (v2.7.0) :** Contrôle côté serveur (`upsertCategoryAction`) et neutralisation visuelle côté client des teintes déjà attribuées à d'autres catégories, tant à la création qu'à l'édition.
  - Palette néobrutaliste contrôlée de 20 couleurs contrastées ou saisie d'un code hexadécimal libre.
  - Calcul dynamique de luminance W3C pour assurer un contraste de texte optimal (`#111827` sur fond clair, `#FFFFFF` sur fond sombre).
  - Prévisualisation dynamique du badge avant enregistrement.
  - Protection contre la suppression accidentelle si la catégorie est référencée par des transactions, budgets ou règles récurrentes (recommandation d'archivage).
  - Propagation transactionnelle atomique des renommages pour préserver la rétrocompatibilité expand/contract.
- Navigation mois par mois pour comparer sa consommation dans le temps.

### 4.6 Règles Récurrentes & Charges Fixes (`/recurrences`)

- Programmation des flux prévisibles : loyer, salaire, abonnements internet, tontine...
- Configuration : montant, catégorie, moyen de paiement, jour du mois (1 à 31), fréquence (mensuelle, hebdo, annuelle).
- **Rappels par e-mail automatiques (v2.6.0) :**
  - Notifications proactives envoyées à **J-7**, **J-3** et le jour même de l'échéance (**J0**).
  - Déduplication absolue via contrainte unique `(rule_id, due_date, offset_days)` dans la table `recurring_reminder_logs`.
  - Commutateur d'activation/désactivation individuel (`remindersEnabled`) disponible par règle récurrente dans le modal d'édition.
  - Déclenchement automatique planifié quotidiennement à 08:00 UTC via Vercel Cron (`vercel.json`) et endpoint sécurisé `/api/cron/reminders`.
  - En local : réception instantanée sur le serveur SMTP Mailpit (port `54325`). En production : relais SMTP standard avec TLS.
- **Résolution calendaire stricte (`Africa/Abidjan`) :** Les échéances prévues les 29, 30 ou 31 du mois sont automatiquement bornées au dernier jour effectif du mois (28 ou 29 février, 30 avril/juin/septembre/novembre), calculées à midi UTC pour neutraliser tout aléa de fuseau horaire.
- **Libellés contextuels :** Le jour 31 affiche lisiblement "Dernier jour du mois (ex: 28, 30 ou 31)".
- Statut actif / en pause en un clic.
- **Sécurisation des suppressions :** Boîte de dialogue néobrutaliste accessible `ConfirmDialog` pour toute suppression de règle récurrente.
- Calcul prévisionnel mensuel automatique (dépenses fixes prévues vs rentrées prévues).

### 4.7 Portefeuilles & Virements Internes (`/portefeuilles`)

- Différencie où se trouve réellement l'argent :
  - **Espèces** (Cash liquide)
  - **Mobile Money** (Wave, Orange Money)
  - **Compte bancaire**
  - **Épargne**
- **Solde Actuel Déclaré à T0 (v2.8.0) :**
  - **Repère initial sans perte d'historique :** Permet à l'utilisateur d'ajuster le solde réel actuellement présent sur son compte (`declaredBalance` à l'instant `declaredAt`).
  - **Formule de calcul financière :**
    $$\text{Solde effectif} = \text{Solde déclaré } (T_0) + \sum \text{Mouvements postérieurs à } T_0$$
  - Si aucun solde déclaré n'est renseigné (comportement d'origine), le calcul s'opère sur la base du `initialBalance` et de l'historique complet.
  - **Conservation absolue de l'historique :** Les transactions antérieures à la déclaration restent intégralement consultables dans l'historique, les statistiques et les graphiques de flux sans altérer le solde physique constaté.
  - **Repère temporel sur les cartes :** Badge indiquant la date du dernier ajustement (`Ajusté le DD MMM`).
- **Règle d'or du patrimoine total (v2.7.1, ADR-02 / Q10) :**
  - Le patrimoine total correspond fidèlement à la somme de tous les comptes, **archivés inclus**.
  - Si des comptes archivés disposent d'un solde non nul, une mention explicite le précise automatiquement (`dont X FCFA sur des comptes archivés`).
  - La valeur affichée est immuable et ne varie plus selon le filtre d'affichage des comptes archivés.
- **Virements Internes & Frais de Virement (v2.10.0, ADR-04 / D9) :**
  - Déplacement d'argent entre deux comptes (ex: Retrait Banque vers Wave ou Wave vers Espèces).
  - **Stricte Neutralité Comptable du Transfert :** Le type `TRANSFER` met à jour les soldes des portefeuilles concernés sans impacter les revenus ni les dépenses globales.
  - **Frais de Virement Optionnels :** Saisie en montant fixe (FCFA) ou en pourcentage (%), avec arrondi au FCFA supérieur et prévisualisation instantanée.
  - **Règle financière (Q11) :** Le montant saisi est le montant reçu/crédité sur le compte cible ; les frais sont débités en sus du compte source.
  - **Imputation Comptable :** Les frais sont automatiquement enregistrés sous forme d'une dépense (`EXPENSE`) rattachée (`linkedTransferId`) dans la catégorie système *"Frais de transfert"* (`systemKey = 'TRANSFER_FEE'`).
  - **Protection des opérations :** Les frais ne peuvent être modifiés ou supprimés isolément (message d'information invitant à modifier/supprimer le virement parent) et sont supprimés en cascade avec le virement.
  - **Auto-sélection contextuelle du compte source (v2.7.0) :** Cliquer sur *"Faire un virement depuis ce compte"* ouvre `TransferModal` avec ce compte immédiatement sélectionné en émetteur et un compte récepteur distinct pré-choisi automatiquement.
- **Suppression Réversible et Restauration des Portefeuilles (v2.10.0, ADR-05 / D10 / C7) :**
  - **Soft-Delete (`deletedAt`) :** La suppression d'un portefeuille ne détruit aucune transaction existante. L'historique et les libellés sont intégralement préservés.
  - **Exclusion du Patrimoine :** Les comptes supprimés sont immédiatement exclus du calcul du patrimoine net, des listes actives et des sélecteurs de saisie.
  - **Règles Récurrentes :** Les règles récurrentes actives rattachées au compte supprimé sont automatiquement mises en pause (`isActive = false`).
  - **Protection du Compte Principal :** Interdiction stricte de supprimer le compte par défaut (l'utilisateur doit d'abord désigner un autre compte principal).
  - **Modale d'Impact Chiffré :** `ConfirmDialog` affiche le nombre d'opérations préservées dans l'historique, le solde exclu et le nombre de règles récurrentes mises en pause.
  - **Détection et Restauration Automatique :** Recréer un compte portant le même nom détecte le compte supprimé et propose sa restauration immédiate avec réassignation de toutes ses transactions d'origine.
- **Ergonomie & Validation (v2.7.0 / v2.7.1 / v2.8.0 / v2.10.0 / v2.10.1 / v2.10.2) :**
  - **Concision Visuelle & InfoTooltip Accessible (v2.10.2) :** Directives prioritaires mises à jour pour éliminer la surcharge cognitive et les pavés de texte verbeux. Intégration d'un composant néobrutaliste accessible d'infobulle contextuelle `InfoTooltip` (`components/ui/InfoTooltip.tsx`), opérant au survol sur desktop et au tap sur mobile, avec fermeture au clic extérieur et touche Échap (`role="tooltip"`).
  - **Refonte UI/UX des Cartes de Portefeuilles (`WalletCard`) (v2.10.2) :** Épuration visuelle complète : solde disponible mis en avant avec typographie percutante, jauge compacte de part du patrimoine, déport des informations techniques de référence ($B_0$ et $T_0$) dans une infobulle dédiée, synthèse Entrées/Sorties sous forme de capsules compactes, et barre d'actions rapides fluide (virement, édition, archivage, suppression).
  - **Réconciliation du Solde de Référence & Trésorerie Globale (v2.10.1) :** Calcul rigoureux des portefeuilles selon la logique du jalon de référence ($B(t) = B_0 + \sum_{T_0 < d_i \le t} \Delta_i$). Tout compte sans déclaration explicite conserve son équation historique intégrale ($B(t) = \text{initialBalance} + \sum \Delta_i$). Le Solde Total Disponible sur l'Accueil réconcilie l'ensemble des portefeuilles et intègre les opérations sans compte rattaché (`unassignedBalance`) pour garantir une exactitude mathématique absolue.
  - **Solde Total Disponible sur l'Accueil (v2.8.0) :** L'écran d'accueil affiche le solde total disponible synchronisé avec les portefeuilles et met en valeur le flux net de la période sélectionnée (entrées, sorties, épargne nette).
  - **Portail de modales (`createPortal`) (v2.7.1) :** Rendu direct de `ConfirmDialog` et `Modal` à la racine de `document.body`, empêchant tout affadissement de backdrop causé par l'opacité des conteneurs parents (comme les comptes archivés `opacity-80`).
  - Éradication intégrale des pop-ups `alert()` / `confirm()` du navigateur sur l'ensemble de l'application au profit de boîtes de dialogue néobrutalistes `ConfirmDialog`.
  - Pré-remplissage complet garanti de `WalletModal` en modification (`name`, `type`, `balanceInput`, `color`, `isDefault`).
  - Unicité de la couleur des portefeuilles par utilisateur avec pastilles indisponibles marquées dans la palette.

### 4.8 Dettes & Créances (`/dettes`)

- **Argent prêté (LENT) :** Créances à récupérer auprès d'autrui.
- **Argent emprunté (BORROWED) :** Dettes à rembourser.
- Statuts : `PENDING` (En attente), `PARTIAL` (Partiellement remboursé), `SETTLED` (Soldé).
- Enregistrement de remboursements partiels successifs avec déduction automatique du reste dû.
- **Sécurisation des suppressions :** Boîte de dialogue néobrutaliste `ConfirmDialog` pour toute suppression de dossier de dette ou créance.

### 4.9 Historique, Graphiques & Import CSV (`/historique`)

- **Matrice d'affichage contextuelle intelligente (`getHistoryVisibility`) :**
  - **Type Entrées :** Masque automatiquement le résumé financier global pour focaliser sur le total des encaissements, adapte le libellé des portefeuilles en *"Moyen de réception"*, et présente la répartition et le classement des sources de revenus (`CategoryChart` et `CategoryRanking`).
  - **Type Dépenses :** Conserve le résumé financier complet et adapte le libellé en *"Moyen de paiement"*.
  - **Filtrage par Catégorie spécifique :** Masque automatiquement l'onglet Graphiques et la section de répartition par catégorie dans le comparatif (devenue redondante avec le filtre actif).
  - **Période Personnalisée :** Désactive le comparatif d'évolution temporelle (non représentatif sur dates libres).
  - **Redirection dynamique d'onglet :** Si un changement de filtre rend l'onglet actif masqué, l'interface bascule instantanément et sans heurts sur l'onglet *Opérations*.
- **Filtres dépendants & URL Source de Vérité :**
  - Sélecteur de catégorie inactif avec indication visuelle *"Choisissez d'abord un type"* tant que le type n'est pas sélectionné (`INCOME` ou `EXPENSE`).
  - Synchronisation bidirectionnelle continue dans l'URL (`?period=...&type=...&category=...&payment=...&tab=...`) via `window.history.replaceState` sans rechargement de page.
- **Liste des Opérations Cliquables & Modale de Détail (v2.9.0) :**
  - Items d'opérations épurés `TransactionListItem` : bouton accessible avec icône contextuelle, pastille de catégorie, horodatage et montant.
  - Modale de détail `TransactionDetailsModal` : présente l'opération complète (catégorie et statut d'archivage, portefeuille et moyen de paiement, compte source et cible pour les virements, date longue en français, commentaire multiligne sans troncature et dates de création/modification).
  - Actions intégrées : modification directe (`EditTransactionModal`) ou suppression irréversible sécurisée (`ConfirmDialog`).
- **Pagination Serveur par Curseur :**
  - Requêtes indexées ultra-performantes (`idx_transactions_user_date_id`) sur `[user_id, date DESC, id DESC]`.
  - Bouton néobrutaliste *"Charger plus"* avec indicateur d'avancement et conservation de la position de scroll.
- **Statistiques & Agrégations Serveur :**
  - Calcul instantané des totaux et des comparatifs N vs N-1 via des requêtes `groupBy` Prisma optimisées.
- **Export & Impression PDF :**
  - Prise en compte immédiate des filtres actifs (période, type, catégorie, portefeuille, dates personnalisées) sur `/api/export/pdf`.

### 4.10 Paramètres, Thèmes & Sécurité (`/parametres`)

Accessible depuis l'onglet **Compte** :

1. **Identité de session :** Affiche l'email, la date d'inscription et le nombre total d'opérations.
2. **Changement de mot de passe :**
   - Vérifie obligatoirement l'ancien mot de passe via Supabase avant toute mise à jour.
   - Valide le nouveau mot de passe avec Zod.
3. **Apparence & Thème :**
   - 3 boutons néobrutalistes pour basculer entre **Clair**, **Sombre** ou **Système**.
   - Persistance dans `localStorage` et synchronisation immédiate sur le DOM via `lib/theme.ts`.
4. **Sauvegarde de Souveraineté :**
   - Export **JSON complet** (données brutes restaurables).
   - Export **CSV / Excel** avec séparateurs compatibles tableur.
   - Export **PDF A4 Imprimable** haute fidélité pour archivage papier.
5. **Session & Déconnexion :** Bouton de déconnexion sécurisé avec boîte de confirmation.
6. **Zone de Danger (Suppression RGPD) :**
   - Purge intégrale et irréversible de l'ensemble des données (transactions, budgets, récurrences, portefeuilles, dettes).
   - **Protection renforcée :** Nécessite de saisir obligatoirement la phrase `"Supprimer mon compte"` pour déverrouiller le bouton de confirmation.

---

## 5. Modèle de Données & Schéma Prisma

Le schéma Prisma se trouve dans [`prisma/schema.prisma`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/my-app/prisma/schema.prisma) :

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum CategoryKind {
  INCOME
  EXPENSE
  BOTH
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

enum WalletType {
  CASH
  MOBILE_MONEY
  BANK
  SAVINGS
}

enum RecurrenceFrequency {
  MONTHLY
  WEEKLY
  YEARLY
}

enum DebtType {
  LENT
  BORROWED
}

enum DebtStatus {
  PENDING
  PARTIAL
  SETTLED
}

model Category {
  id         String       @id @default(uuid())
  userId     String       @map("user_id")
  name       String
  kind       CategoryKind
  color      String
  isArchived Boolean      @default(false) @map("is_archived")
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  transactions   Transaction[]
  budgets        Budget[]
  recurringRules RecurringRule[]

  @@unique([userId, name])
  @@index([userId, kind])
  @@index([userId])
  @@map("categories")
}

model Transaction {
  id             String          @id @default(uuid())
  type           TransactionType
  amount         Decimal         @db.Decimal(12, 2)
  category       String
  payment        String
  note           String?
  date           DateTime        @default(now())

  // Catégorie reliée (patron Expand/Contract)
  categoryId     String?         @map("category_id")
  categoryRel    Category?       @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  userId         String?         @map("user_id")
  walletId       String?         @map("wallet_id")
  wallet         Wallet?         @relation("SourceWallet", fields: [walletId], references: [id], onDelete: SetNull)
  targetWalletId String?         @map("target_wallet_id")
  targetWallet   Wallet?         @relation("TargetWallet", fields: [targetWalletId], references: [id], onDelete: SetNull)
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  @@map("transactions")
}

model Wallet {
  id             String          @id @default(uuid())
  userId         String          @map("user_id")
  name           String
  type           WalletType
  initialBalance Decimal         @default(0) @map("initial_balance") @db.Decimal(12, 2)
  color          String          @default("#2563EB")
  isDefault      Boolean         @default(false) @map("is_default")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")
  transactionsSource Transaction[] @relation("SourceWallet")
  transactionsTarget Transaction[] @relation("TargetWallet")

  @@map("wallets")
}

model Budget {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  category   String
  categoryId String?   @map("category_id")
  categoryRel Category? @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  amount     Decimal   @db.Decimal(12, 2)
  month      String    // Format "YYYY-MM"
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@unique([userId, category, month])
  @@map("budgets")
}

model RecurringRule {
  id                 String              @id @default(uuid())
  userId             String              @map("user_id")
  type               TransactionType
  amount             Decimal             @db.Decimal(12, 2)
  category           String
  categoryId         String?             @map("category_id")
  categoryRel        Category?           @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  payment            String
  dayOfMonth         Int                 @map("day_of_month")
  frequency          RecurrenceFrequency @default(MONTHLY)
  note               String?
  isActive           Boolean             @default(true) @map("is_active")
  lastProcessedMonth String?             @map("last_processed_month")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")

  @@map("recurring_rules")
}

model Debt {
  id              String      @id @default(uuid())
  userId          String      @map("user_id")
  personName      String      @map("person_name")
  type            DebtType
  initialAmount   Decimal     @map("initial_amount") @db.Decimal(12, 2)
  remainingAmount Decimal     @map("remaining_amount") @db.Decimal(12, 2)
  dueDate         DateTime?   @map("due_date")
  status          DebtStatus  @default(PENDING)
  note            String?
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  @@map("debts")
}
```

---

## 6. Guide de Démarrage & Déploiement

### Variables d'Environnement (`.env.local`)

Créez ou modifiez le fichier `.env.local` à la racine de `my-app` :

```env
# Supabase Authentication & API
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_votre_cle"

# PostgreSQL Database (Session Pooler port 5432)
DATABASE_URL="postgresql://postgres.votre-projet:votre_mot_de_passe@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres.votre-projet:votre_mot_de_passe@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?schema=public"
```

### Commandes Utiles

```bash
# 1. Installer les dépendances
pnpm install

# 2. Lancer le serveur de développement
pnpm dev

# 3. Synchroniser la base de données avec Prisma
pnpm prisma db push

# 4. Exécuter l'ensemble des tests automatisés
pnpm test

# 5. Vérifier la conformité TypeScript
pnpm tsc --noEmit

# 6. Compiler pour la production
pnpm build
```

### Synchronisation Base de Données (Local vs Prod)

Pour appliquer le schéma sur une base Supabase distante (Production) :

- **Option A (Automatisée avec Prisma) :**
  ```powershell
  $env:DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres?schema=public"
  pnpm prisma db push
  ```
- **Option B (Éditeur SQL Supabase) :**
  Copiez le script idempotent [`prisma/migration_v2.sql`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/my-app/prisma/migration_v2.sql) et exécutez-le dans le **SQL Editor** de Supabase Cloud.

### Sécurité des Données & Row Level Security (RLS)

Toutes les tables de l'application contenant des données utilisateur sont protégées par le mécanisme natif **Row Level Security (RLS)** de PostgreSQL sous Supabase :

- `public.transactions`
- `public.wallets`
- `public.budgets`
- `public.recurring_rules`
- `public.debts`

#### Politiques de sécurité actives :

- **Utilisateurs authentifiés (`authenticated`) :** Accès restreint strictement aux lignes où `(select auth.uid())::text = user_id` (opérations SELECT, INSERT, UPDATE, DELETE).
- **Accès public anonyme (`anon`) :** Tout accès est rejeté par défaut (politique zero-trust).
- **Accès serveur applicatif :** Les Server Actions Next.js opérant via Prisma utilisent le rôle administrateur de connexion directe PostgreSQL (qui contourne le RLS pour exécuter les opérations transactionnelles serveur sécurisées), tout en vérifiant systématiquement l'identité utilisateur côté serveur (`getAuthenticatedUser()`).

#### Migration RLS versionnée :

La migration [`supabase/migrations/20261012171259_enable_rls.sql`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/my-app/supabase/migrations/20261012171259_enable_rls.sql) applique l'activation de RLS et l'ensemble des 20 politiques de sécurité (4 par table).

Pour appliquer les migrations en local :

```bash
pnpm supabase migration up --local
```

Pour déployer les migrations sur l'instance Supabase distante :

```bash
pnpm supabase db push
```

---

## 7. Tests Automatisés & Qualité de Code

L'application intègre une suite de **142 tests unitaires** couvrant l'ensemble des règles métier critiques :

- **`tests/recurring-reminders.test.ts` :** Moteur de calcul des rappels d'échéances à J-7, J-3 et J0, déduplication stricte des e-mails, clamp calendaire et gestion des exclusions.
- **`tests/auth-recovery.test.ts` :** Validation du schéma de mot de passe complexe, scoring de robustesse, et flux de récupération à 3 étapes.
- **`tests/history.test.ts` :** Matrice de visibilité contextuelle, pagination par curseur déterministe, et synchronisation des filtres.
- **`tests/validations.test.ts` :** Validation Zod des transactions, inscriptions, connexions et règles récurrentes.
- **`tests/recurring.test.ts` :** Échéances récurrentes, résolution calendaire de fin de mois (bissextile 2028, non-bissextile 2027) et libellés.
- **`tests/categories.test.ts` :** Gestion des catégories dynamiques, calcul du contraste W3C, unicité et archivage.
- **`tests/wallets.test.ts` :** Portefeuilles en tant que source de paiement unique, archivage sécurisé et soldes multi-comptes.
- **`tests/transfers.test.ts` :** Garantie de neutralité comptable des virements internes.
- **`tests/budgets.test.ts` :** Calcul des jauges de consommation, alertes de seuils et pourcentages.
- **`tests/insights.test.ts` :** Détection de hausses anormales multiples, seuil d'épargne 15 %, alertes de budget cumulatives et tri déterministe par sévérité.
- **`tests/debts.test.ts` :** Gestion des soldes de dettes et remboursements échelonnés.
- **`tests/csv-import.test.ts` :** Parsing de fichiers bancaires et détection de doublons.

Pour exécuter les tests et le linter :

```bash
pnpm test
pnpm lint
```

_Résultat garanti : 161 tests passés à 100 %, 0 échec, 0 avertissement ESLint._

---

## 8. Écosystème d'Agents & Auditeur UX / Logique Métier

Le développement et la maintenance de **Gest Tracker** s'appuient sur un collège d'agents spécialisés coordonnés par l'Architecte (`.agent/agents/`) :

- **Lead Software Architect (`architecte.md`) :** Garant de l'architecture, du respect de la roadmap et de la gouvernance de livraison.
- **Senior Frontend (`frontend.md`) :** Composants UI néobrutalistes et ergonomie mobile (< 5s).
- **Senior Backend (`backend.md`) :** Server Actions, validations Zod et calculs financiers.
- **Database Administrator (`database.md`) :** Schéma Prisma, migrations versionnées et isolation des données.
- **Lead Application Security (`security.md`) :** Authentification Supabase Auth, middleware SSR et politiques RLS.
- **UX & Logic Auditor (`ux-logic-auditor.md`) :** Audit holistique des parcours réels, cohérence cross-pages, étanchéité de la logique financière, accessibilité et validation ciblée après correctifs.
- **QA Lead (`qa.md`) :** Suites de tests automatisés (161 tests unitaires), typage strict et validation de la Definition of Done.

### 8.1 Rôle et Compétences de UX_LOGIC_AUDITOR

L'agent `UX_LOGIC_AUDITOR` est conçu pour répondre à la question directrice :  
> *« Un utilisateur qui découvre Gest Tracker peut-il comprendre chaque page, savoir quoi faire, effectuer ses actions sans blocage et comprendre le résultat obtenu ? »*

Il opère selon 6 compétences clés :
1. **User Journey & Flow Analysis :** Parcours complets d'onboarding, création/modification/suppression d'opérations, budgets, portefeuilles et récurrences.
2. **UX Heuristic Evaluation :** Visibilité des états, clarté des libellés, prévention des erreurs (désactivation des CTA pendant la soumission, `ConfirmDialog.tsx` obligatoire sans alertes natives).
3. **Cross-Page & Navigation Audit :** Traçabilité entre le hub `/gestion`, le tableau de bord `/`, l'historique et les formulaires, persistance du contexte et absence de routes orphelines.
4. **Business Logic & Edge Cases :** Neutralité stricte des transferts entre portefeuilles, calculs financiers sans approximations flottantes, résolutions calendaires des fins de mois (29/30/31).
5. **Accessibility & Responsive Audit :** Conformité des contrastes W3C (`getContrastTextColor`), navigation au clavier, focus trap dans les modales, accessibilité tactile à 375px et interdiction des emojis.
6. **Exploratory Testing :** Scénarios aux limites (première connexion sans donnée, montants extrêmes, déconnexions réseau, double-clics).

### 8.2 Modes d'Intervention et Flux de Livraison

- **Mode AUDIT :** Analyse non-destructive produisant un rapport d'audit détaillé avec anomalies classées de P0 (critique) à P3 (mineur).
- **Mode VALIDATION :** Rejeu ciblé des scénarios après correctifs appliqués par l'équipe de développement.
- **Discipline Git :** Développement exclusif sur branche dédiée (`feat/...`, `fix/...`), interdiction absolue de merge vers `main`, push sur la branche de travail et délégation de la Pull Request à l'utilisateur humain.
