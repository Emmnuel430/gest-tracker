import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { computeWalletBalance, computeNetWorth } from '@/lib/wallet-balance';

export interface CalculatedWalletData {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  initialBalance: number;
  currentBalance: number;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
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
export async function getWalletBalancesForUser(userId: string): Promise<UserWalletSummary> {
  // 1. Récupération des portefeuilles existants
  let wallets = await prisma.wallet.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });

  // Initialisation automatique par défaut si premier accès
  if (wallets.length === 0) {
    await prisma.wallet.createMany({
      data: [
        {
          userId,
          name: 'Espèces',
          type: 'CASH',
          initialBalance: 0,
          color: '#52B788',
          isDefault: true,
          isArchived: false,
        },
        {
          userId,
          name: 'Wave',
          type: 'MOBILE_MONEY',
          initialBalance: 0,
          color: '#1DC4F2',
          isDefault: false,
          isArchived: false,
        },
        {
          userId,
          name: 'Compte bancaire',
          type: 'BANK',
          initialBalance: 0,
          color: '#B8C0FF',
          isDefault: false,
          isArchived: false,
        },
      ],
    });

    wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  // 2. Récupérer toutes les transactions de l'utilisateur pour calculer les mouvements
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: {
      amount: true,
      type: true,
      walletId: true,
      targetWalletId: true,
    },
  });

  // Calcul des mouvements par portefeuille
  const walletMovementsMap = new Map<
    string,
    { income: Prisma.Decimal; expense: Prisma.Decimal; transferIn: Prisma.Decimal; transferOut: Prisma.Decimal }
  >();

  for (const w of wallets) {
    walletMovementsMap.set(w.id, {
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

    if (t.walletId && walletMovementsMap.has(t.walletId)) {
      const mov = walletMovementsMap.get(t.walletId)!;
      if (t.type === 'INCOME') {
        mov.income = mov.income.plus(amt);
      } else if (t.type === 'EXPENSE') {
        mov.expense = mov.expense.plus(amt);
      } else if (isTransfer) {
        mov.transferOut = mov.transferOut.plus(amt);
      }
    } else if (!t.walletId) {
      if (t.type === 'INCOME') unassignedIncome = unassignedIncome.plus(amt);
      else if (t.type === 'EXPENSE') unassignedExpense = unassignedExpense.plus(amt);
    }

    if (isTransfer && t.targetWalletId && walletMovementsMap.has(t.targetWalletId)) {
      const targetMov = walletMovementsMap.get(t.targetWalletId)!;
      targetMov.transferIn = targetMov.transferIn.plus(amt);
    }
  }

  const unassignedBalance = unassignedIncome.minus(unassignedExpense).toNumber();

  const calculatedWallets: CalculatedWalletData[] = wallets.map((w) => {
    const mov = walletMovementsMap.get(w.id) || {
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
      transferIn: new Prisma.Decimal(0),
      transferOut: new Prisma.Decimal(0),
    };

    const currentBalance = computeWalletBalance(w.initialBalance, mov);

    return {
      id: w.id,
      name: w.name,
      type: w.type,
      initialBalance: Number(w.initialBalance),
      currentBalance,
      color: w.color,
      isDefault: w.isDefault,
      isArchived: w.isArchived,
      totalIncome: mov.income.toNumber(),
      totalExpense: mov.expense.toNumber(),
      totalTransferIn: mov.transferIn.toNumber(),
      totalTransferOut: mov.transferOut.toNumber(),
      createdAt: w.createdAt.toISOString(),
    };
  });

  const netWorthSummary = computeNetWorth(calculatedWallets);

  return {
    wallets: calculatedWallets,
    netWorth: netWorthSummary.netWorth,
    activeBalance: netWorthSummary.activeBalance,
    archivedBalance: netWorthSummary.archivedBalance,
    unassignedBalance,
    walletCount: calculatedWallets.length,
  };
}
