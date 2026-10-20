import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  computeWalletBalance,
  computeNetWorth,
  isTransactionAfterDeclaration,
  calculateEffectiveWalletBalance,
} from '@/lib/wallet-balance';

export interface CalculatedWalletData {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  initialBalance: number;
  declaredBalance: number | null;
  declaredAt: string | null;
  currentBalance: number;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  deletedAt: string | null;
  isDeleted: boolean;
  totalIncome: number;
  totalExpense: number;
  totalTransferIn: number;
  totalTransferOut: number;
  createdAt: string;
}

export interface UserWalletSummary {
  wallets: CalculatedWalletData[];
  netWorth: number;
  activeBalance: number;
  archivedBalance: number;
  unassignedBalance: number;
  walletCount: number;
}

/**
 * Service centralisé pour calculer les soldes de tous les portefeuilles d'un utilisateur,
 * ainsi que le patrimoine total et les montants non assignés.
 */
export async function getWalletBalancesForUser(
  userId: string,
  options?: { includeDeleted?: boolean }
): Promise<UserWalletSummary> {
  // 1. Récupération des portefeuilles existants
  let wallets = await prisma.wallet.findMany({
    where: {
      userId,
      ...(options?.includeDeleted ? {} : { deletedAt: null }),
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });

  // Initialisation automatique par défaut si premier accès absolu (aucun portefeuille, même supprimé)
  // Règle 2.11.0 (C8) : Réservée aux profils dont l'onboarding est validé
  if (wallets.length === 0) {
    const existingCount = await prisma.wallet.count({ where: { userId } });
    if (existingCount === 0) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { onboardingCompletedAt: true },
      });

      if (profile?.onboardingCompletedAt != null) {
        await prisma.wallet.createMany({
          data: [
            {
              userId,
              name: 'Espèces',
              type: 'CASH',
              initialBalance: 0,
              declaredBalance: null,
              declaredAt: null,
              color: '#52B788',
              isDefault: true,
              isArchived: false,
            },
            {
              userId,
              name: 'Wave',
              type: 'MOBILE_MONEY',
              initialBalance: 0,
              declaredBalance: null,
              declaredAt: null,
              color: '#1DC4F2',
              isDefault: false,
              isArchived: false,
            },
            {
              userId,
              name: 'Compte bancaire',
              type: 'BANK',
              initialBalance: 0,
              declaredBalance: null,
              declaredAt: null,
              color: '#B8C0FF',
              isDefault: false,
              isArchived: false,
            },
          ],
        });

        wallets = await prisma.wallet.findMany({
          where: {
            userId,
            ...(options?.includeDeleted ? {} : { deletedAt: null }),
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
      }
    }
  }

  // 2. Récupérer toutes les transactions de l'utilisateur pour calculer les mouvements
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: {
      amount: true,
      type: true,
      walletId: true,
      targetWalletId: true,
      date: true,
      createdAt: true,
    },
  });

  // Calcul des mouvements par portefeuille (historiques complets + mouvements post-déclaration)
  const walletHistoricalMap = new Map<
    string,
    { income: Prisma.Decimal; expense: Prisma.Decimal; transferIn: Prisma.Decimal; transferOut: Prisma.Decimal }
  >();

  const walletPostDeclarationMap = new Map<
    string,
    { income: Prisma.Decimal; expense: Prisma.Decimal; transferIn: Prisma.Decimal; transferOut: Prisma.Decimal }
  >();

  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  for (const w of wallets) {
    walletHistoricalMap.set(w.id, {
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
      transferIn: new Prisma.Decimal(0),
      transferOut: new Prisma.Decimal(0),
    });

    walletPostDeclarationMap.set(w.id, {
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
      transferIn: new Prisma.Decimal(0),
      transferOut: new Prisma.Decimal(0),
    });
  }

  let unassignedIncome = new Prisma.Decimal(0);
  let unassignedExpense = new Prisma.Decimal(0);

  for (const t of transactions) {
    const amt = t.amount;
    const isTransfer = t.type === 'TRANSFER';

    if (t.walletId && walletHistoricalMap.has(t.walletId)) {
      const hist = walletHistoricalMap.get(t.walletId)!;
      const targetW = walletMap.get(t.walletId);
      const isPost = targetW?.declaredAt
        ? isTransactionAfterDeclaration(t, targetW.declaredAt)
        : true;
      const post = walletPostDeclarationMap.get(t.walletId)!;

      if (t.type === 'INCOME') {
        hist.income = hist.income.plus(amt);
        if (isPost) post.income = post.income.plus(amt);
      } else if (t.type === 'EXPENSE') {
        hist.expense = hist.expense.plus(amt);
        if (isPost) post.expense = post.expense.plus(amt);
      } else if (isTransfer) {
        hist.transferOut = hist.transferOut.plus(amt);
        if (isPost) post.transferOut = post.transferOut.plus(amt);
      }
    } else if (!t.walletId) {
      if (t.type === 'INCOME') unassignedIncome = unassignedIncome.plus(amt);
      else if (t.type === 'EXPENSE') unassignedExpense = unassignedExpense.plus(amt);
    }

    if (isTransfer && t.targetWalletId && walletHistoricalMap.has(t.targetWalletId)) {
      const histTarget = walletHistoricalMap.get(t.targetWalletId)!;
      histTarget.transferIn = histTarget.transferIn.plus(amt);

      const targetW = walletMap.get(t.targetWalletId);
      const isPostTarget = targetW?.declaredAt
        ? isTransactionAfterDeclaration(t, targetW.declaredAt)
        : true;
      if (isPostTarget) {
        const postTarget = walletPostDeclarationMap.get(t.targetWalletId)!;
        postTarget.transferIn = postTarget.transferIn.plus(amt);
      }
    }
  }

  const unassignedBalance = unassignedIncome.minus(unassignedExpense).toNumber();

  const calculatedWallets: CalculatedWalletData[] = wallets.map((w) => {
    const hist = walletHistoricalMap.get(w.id) || {
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
      transferIn: new Prisma.Decimal(0),
      transferOut: new Prisma.Decimal(0),
    };

    const post = walletPostDeclarationMap.get(w.id) || {
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
      transferIn: new Prisma.Decimal(0),
      transferOut: new Prisma.Decimal(0),
    };

    const currentBalance = calculateEffectiveWalletBalance({
      initialBalance: w.initialBalance,
      declaredBalance: w.declaredBalance,
      declaredAt: w.declaredAt,
      movements: hist,
      postDeclarationMovements: post,
    });

    return {
      id: w.id,
      name: w.name,
      type: w.type,
      initialBalance: Number(w.initialBalance),
      declaredBalance: w.declaredBalance !== null ? Number(w.declaredBalance) : null,
      declaredAt: w.declaredAt ? w.declaredAt.toISOString() : null,
      currentBalance,
      color: w.color,
      isDefault: w.isDefault,
      isArchived: w.isArchived,
      deletedAt: w.deletedAt ? w.deletedAt.toISOString() : null,
      isDeleted: !!w.deletedAt,
      totalIncome: hist.income.toNumber(),
      totalExpense: hist.expense.toNumber(),
      totalTransferIn: hist.transferIn.toNumber(),
      totalTransferOut: hist.transferOut.toNumber(),
      createdAt: w.createdAt.toISOString(),
    };
  });

  const netWorthSummary = computeNetWorth(calculatedWallets, unassignedBalance);

  return {
    wallets: calculatedWallets,
    netWorth: netWorthSummary.netWorth,
    activeBalance: netWorthSummary.activeBalance,
    archivedBalance: netWorthSummary.archivedBalance,
    unassignedBalance,
    walletCount: calculatedWallets.length,
  };
}
