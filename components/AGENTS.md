# Directives UI & Composants — Gest Tracker

> **Portée :** Composants d'interface, pages, layouts et vues sous `my-app/components/`.  
> **Référentiel :** [`.agent/docs/DESIGN-SYSTEM.md`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/.agent/docs/DESIGN-SYSTEM.md) et [`.agent/docs/USER-FLOWS.md`](file:///c:/Users/Albetarus/3D%20Objects/expense-tracker/.agent/docs/USER-FLOWS.md).

---

## 1. Esthétique Néobrutaliste Obligatoire

- **Bordures dures et nettes** : `border-2 border-[#111827]` en mode clair, `border-2 border-[#334155]` en mode sombre. Aucune bordure transparente, adoucie ou invisible.
- **Ombres portées sans flou (Zero Blur)** :
  - Standard clair : `shadow-[3px_3px_0px_0px_#111827]` ou `shadow-[4px_4px_0px_0px_#111827]`.
  - Standard sombre : `dark:shadow-[3px_3px_0px_0px_#000000]`.
  - Enfoncement au clic/touch : `active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#111827]`.
- **Palette de couleurs** :
  - Signature : Bleu `#2563EB` (actions principales, badges de solde, sélections).
  - Revenus : Vert vif `#16A34A` / `#10B981` (`ArrowDownLeft`).
  - Dépenses : Rouge / Corail `#DC2626` / `#EF4444` (`ArrowUpRight`).
  - Virements internes : Bleu indigo `#4F46E5` / `#6366F1` (`ArrowLeftRight`).

---

## 2. Règle Zéro Emoji & Icônes

- **Interdiction formelle et absolue des emojis** dans le code TSX, les libellés, les infobulles, les placeholders et les messages toast.
- **Source unique d'iconographie** : Utiliser exclusivement les icônes vectorielles de `lucide-react`.

---

## 3. Dialogue et Confirmations Utilisateur

- **Interdiction stricte des fonctions natives du navigateur** : Ne jamais utiliser `alert()`, `confirm()` ou `prompt()`.
- **Modales React néobrutalistes** : Toute action destructive (suppression de transaction, archivage de portefeuille, réinitialisation) doit obligatoirement utiliser `ConfirmDialog.tsx` (`components/ui/ConfirmDialog.tsx`).

---

## 4. Concision Visuelle & Hiérarchie

- Éviter la surcharge cognitive et les pavés de texte explicatifs.
- Présenter directement les données essentielles (chiffres, montants en FCFA, statuts courts).
- Déporter toute explication secondaire ou définition contextuelle dans `InfoTooltip.tsx` (`components/ui/InfoTooltip.tsx`), activable au survol et au clic/tap.

---

## 5. Ergonomie Mobile & États Interactifs

- Conception mobile-first : navigation et boutons utilisables à une main sur écran tactile de 375px et plus (zones de frappe >= 44x44px).
- Saisie express en moins de 5 secondes pour les flux transactionnels.
- Gestion explicite des états :
  - Boutons désactivés (`disabled`) avec feedback visuel pendant la soumission (`isPending` / `loading`) pour bloquer les doubles clics.
  - États vides clairs avec appel à l'action immédiat.
  - Skeleton screens ou spinners néobrutalistes pendant les chargements de données.
