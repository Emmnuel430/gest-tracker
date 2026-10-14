# GEST TRACKER — Documentation Complète (v2.4.0)

Bienvenue sur la documentation technique et fonctionnelle de **Personal GEST TRACKER**, l'application moderne de gestion financière personnelle et professionnelle, conçue selon les principes du **Néobrutalisme Moderne** avec une architecture full-stack Next.js, Supabase et Prisma.

---

## Table des Matières

1. [Vue d'ensemble & Philosophie](#1-vue-densemble--philosophie)
2. [Stack Technique](#2-stack-technique)
3. [Arborescence du Projet](#3-arborescence-du-projet)
4. [Fonctionnalités Détaillées par Module](#4-fonctionnalités-détaillées-par-module)
   - [4.1 Authentification & Cloisonnement Multi-User](#41-authentification--cloisonnement-multi-user)
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
- **Tests :** Node.js Test Runner avec `tsx` (123 tests unitaires automatisés).
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

### 4.1 Authentification & Cloisonnement Multi-User

- **Routes :** `/login` et `/register`.
- **Mécanisme :**
  - Session gérée par Supabase Auth via des cookies sécurisés lus dans [`middleware.ts`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/my-app/middleware.ts).
  - Toute tentative d'accès à une page protégée sans session valide redirige instantanément vers `/login`.
  - Inscription protégée par validation Zod stricte (minimum 8 caractères, au moins 1 lettre et 1 chiffre, confirmation identique).
  - **Cloisonnement total des données :** Toutes les requêtes en base de données filtrent impérativement sur `userId: user.id`. Aucun utilisateur ne peut accéder aux données d'un autre.

### 4.2 Tableau de Bord Principal (`/`)

- **Résumé du Solde :**
  - Solde global en temps réel.
  - Cartes synthétiques des flux pour 3 périodes clés : **Aujourd'hui**, **Mois en cours** et **Année**.
- **Bannière d'Alerte Récurrente :**
  - Détecte automatiquement les charges du mois qui n'ont pas encore été validées (loyer, abonnements).
  - Permet de valider (créant la transaction réelle) ou d'ignorer en un clic.
- **Actions Massives Rapides :**
  - Bouton **ENTRANT** vert néobrutaliste (`/entrant`) pour enregistrer un revenu.
  - Bouton **SORTANT** rouge néobrutaliste (`/sortant`) pour enregistrer une dépense.
  - Bouton **HISTORIQUE** bleu néobrutaliste (`/historique`) pour explorer les archives.
- **Dernières Opérations :** Liste compacte des transactions récentes avec affichage de la catégorie, moyen de paiement, portefeuille et date.

### 4.3 Bilan & Conseils Financiers (Moteur d'Insights & Carrousel)

- Situé sur la page d'accueil juste après les boutons d'actions rapides.
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

### 4.4 Hub de Gestion & Modules (`/gestion`)

Accessible directement depuis l'onglet central de la barre de navigation (avec redirection permanente 308 depuis l'ancienne route `/options`). Il regroupe les modules financiers avancés sous forme de cartes d'action interactives :

1. **Budgets & Plafonds**
2. **Portefeuilles & Virements**
3. **Dettes & Créances**
*(Note : Le module Règles Récurrentes y est temporairement masqué en attendant le service d'e-mails v2.6.0, mais reste accessible directement via son URL).*

### 4.5 Budgets Mensuels & Gestion des Catégories (`/budgets`)

- **Budgets mensuels par catégorie :** Définition d'un montant plafond pour un mois donné (ex: _Alimentation : 60 000 FCFA pour 2026-10_).
- **Jauge visuelle dynamique tricolore :**
  - **Vert :** Moins de 75 % consommé.
  - **Orange :** Entre 75 % et 99 % consommé (Attention).
  - **Rouge :** 100 % ou plus (Dépassement de budget).
- **Gestionnaire de Catégories Personnalisées (`CategoryManagerModal`) :**
  - Bouton dédié **"Catégories"** sur la vue `/budgets`.
  - Liste filtrable par type (`Toutes`, `Dépenses`, `Revenus`, `Mixtes / Both`).
  - Palette néobrutaliste contrôlée de 20 couleurs contrastées ou saisie d'un code hexadécimal libre.
  - Calcul dynamique de luminance W3C pour assurer un contraste de texte optimal (`#111827` sur fond clair, `#FFFFFF` sur fond sombre).
  - Prévisualisation dynamique du badge avant enregistrement.
  - Protection contre la suppression accidentelle si la catégorie est référencée par des transactions, budgets ou règles récurrentes (recommandation d'archivage).
  - Propagation transactionnelle atomique des renommages pour préserver la rétrocompatibilité expand/contract.
- Navigation mois par mois pour comparer sa consommation dans le temps.

### 4.6 Règles Récurrentes & Charges Fixes (`/recurrences`)

- Programmation des flux prévisibles : loyer, salaire, abonnements internet, tontine...
- Configuration : montant, catégorie, moyen de paiement, jour du mois (1 à 31), fréquence (mensuelle, hebdo, annuelle).
- **Résolution calendaire stricte (`Africa/Abidjan`) :** Les échéances prévues les 29, 30 ou 31 du mois sont automatiquement bornées au dernier jour effectif du mois (28 ou 29 février, 30 avril/juin/septembre/novembre), calculées à midi UTC pour neutraliser tout aléa de fuseau horaire.
- **Libellés contextuels :** Le jour 31 affiche lisiblement "Dernier jour du mois (ex: 28, 30 ou 31)".
- Statut actif / en pause en un clic.
- Calcul prévisionnel mensuel automatique (dépenses fixes prévues vs rentrées prévues).

### 4.7 Portefeuilles & Virements Internes (`/portefeuilles`)

- Différencie où se trouve réellement l'argent :
  - **Espèces** (Cash liquide)
  - **Mobile Money** (Wave, Orange Money)
  - **Compte bancaire**
  - **Épargne**
- **Calcul du solde en temps réel :**
  $$\text{Solde actuel} = \text{Solde initial} + \text{Revenus} - \text{Dépenses} + \text{Virements entrants} - \text{Virements sortants}$$
- **Virements Internes (Transfers) :**
  - Déplacement d'argent entre deux comptes (ex: Retrait Banque vers Wave ou Wave vers Espèces).
  - **Stricte Neutralité Comptable :** Le type `TRANSFER` met à jour les soldes des portefeuilles concernés mais n'impacte ni les revenus ni les dépenses globales de l'utilisateur.

### 4.8 Dettes & Créances (`/dettes`)

- **Argent prêté (LENT) :** Créances à récupérer auprès d'autrui.
- **Argent emprunté (BORROWED) :** Dettes à rembourser.
- Statuts : `PENDING` (En attente), `PARTIAL` (Partiellement remboursé), `SETTLED` (Soldé).
- Enregistrement de remboursements partiels successifs avec déduction automatique du reste dû.

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

L'application intègre une suite de **87 tests unitaires** couvrant l'ensemble des règles métier critiques :

- **`tests/validations.test.ts` :** Validation Zod des transactions, inscriptions et connexions.
- **`tests/recurring.test.ts` :** Échéances récurrentes, résolution calendaire de fin de mois (bissextile 2028, non-bissextile 2027) et libellés.
- **`tests/budgets.test.ts` :** Calcul des jauges de consommation, alertes de seuils et pourcentages.
- **`tests/wallets.test.ts` :** Calculs de soldes multi-comptes en temps réel.
- **`tests/transfers.test.ts` :** Garantie de neutralité comptable des virements internes.
- **`tests/insights.test.ts` :** Détection de hausses anormales multiples, seuil d'épargne 15 %, alertes de budget cumulatives et tri déterministe par sévérité.
- **`tests/debts.test.ts` :** Gestion des soldes de dettes et remboursements échelonnés.
- **`tests/csv-import.test.ts` :** Parsing de fichiers bancaires et détection de doublons.

Pour exécuter les tests et le linter :

```bash
pnpm test
pnpm lint
```

_Résultat garanti : 87 tests passés à 100 %, 0 échec, 0 avertissement ESLint._
