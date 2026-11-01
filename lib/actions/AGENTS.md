# Directives Services & Actions Métier — Gest Tracker

> **Portée :** Services de mutation et actions métier sous `my-app/lib/actions/` et `my-app/actions/`.  
> **Référentiel :** [`.agent/docs/DEFINITION-OF-DONE.md`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/.agent/docs/DEFINITION-OF-DONE.md) et [`.agent/docs/USER-FLOWS.md`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/.agent/docs/USER-FLOWS.md).

---

## 1. Sécurité, Auth & Isolation des Données (Multi-Tenant)

- **Authentification systématique côté serveur** : Chaque mutation métier doit extraire et vérifier la session utilisateur via Supabase Auth SSR (`createClient()` de `@supabase/ssr` ou `getUser()`).
- **Interdiction formelle de faire confiance au client** : Ne jamais accepter un `userId` fourni dans les arguments ou le payload d'une Server Action sans le vérifier contre la session authentifiée.
- **Filtrage étanche par `userId`** : Toute requête Prisma (lecture, création, modification, suppression) DOIT obligatoirement comporter `where: { userId }` pour empêcher toute fuite de données inter-utilisateurs.

---

## 2. Validation Stricte des Entrées (Zod)

- **Validation obligatoire avant tout traitement** : Toutes les entrées doivent être validées via les schémas Zod centralisés dans `lib/validations.ts`.
- **Typage strict** : Aucun `any` toléré. Si la validation échoue, retourner immédiatement un objet d'erreur typé sans exécuter de requête en base.

---

## 3. Rigueur Financière & Calculs Sans Flottants

- **Zéro approximation flottante** : Interdiction des opérations directes `a + b` ou `a - b` sur des flottants imprécis pour la gestion des montants (FCFA).
- **Fonctions de calcul centralisées** : Utiliser exclusivement les utilitaires validés (ex. `computeWalletBalance`, `calculateEffectiveWalletBalance`).
- **Neutralité comptable absolue des virements** : Un virement entre deux portefeuilles d'un même utilisateur ne constitue ni un revenu ni une dépense. Il s'agit d'un mouvement neutre (débit du compte source, crédit du compte cible).
- **Atomicité des opérations (Transactions Prisma)** : Tout virement, solde initial rétrocalculé ou opération affectant plusieurs tables doit s'exécuter dans un bloc transactionnel `prisma.$transaction(...)`.

---

## 4. Règles Spécifiques Next.js Turbopack pour Server Actions

- **Export exclusif de fonctions asynchrones** : Les fichiers comportant la directive `'use server'` ne doivent exporter STRICTEMENT QUE des fonctions asynchrones.
- **Interdiction d'exporter des constantes ou objets** : Toute constante, enum, schéma ou fonction synchrone utilitaire doit être déportée dans `constants/` ou `lib/` (ex. `constants/categories.ts`).
- **Réinvalidation du cache** : Après chaque mutation réussie, réinvalider explicitement les chemins concernés (`revalidatePath('/')`, `revalidatePath('/portefeuilles')`, etc.).

---

## 5. Gestion des Réponses & Erreurs

- **Format de retour standardisé et prévisible** :
  - Succès : `{ success: true, data: T }`
  - Erreur : `{ success: false, error: string }`
- **Sécurité des messages d'erreur** : Ne jamais renvoyer de stack trace, d'erreur SQL brute ou de secret au client. Logger l'erreur côté serveur et renvoyer un message d'erreur compréhensible et sécurisé.
