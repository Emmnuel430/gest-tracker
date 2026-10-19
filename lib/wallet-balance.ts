import { Prisma } from '@prisma/client';

export interface WalletMovements {
  income: number | Prisma.Decimal;
  expense: number | Prisma.Decimal;
  transferIn: number | Prisma.Decimal;
  transferOut: number | Prisma.Decimal;
}

/**
 * Calcule le solde disponible d'un portefeuille à partir de son solde initial
 * et de l'ensemble de ses mouvements financiers.
 * Formule : initial + income - expense + transferIn - transferOut
 */
export function computeWalletBalance(
  initialBalance: number | Prisma.Decimal,
  movements: WalletMovements
): number {
  const initial = new Prisma.Decimal(initialBalance || 0);
  const income = new Prisma.Decimal(movements.income || 0);
  const expense = new Prisma.Decimal(movements.expense || 0);
  const transferIn = new Prisma.Decimal(movements.transferIn || 0);
  const transferOut = new Prisma.Decimal(movements.transferOut || 0);

  const balance = initial
    .plus(income)
    .minus(expense)
    .plus(transferIn)
    .minus(transferOut);

  return balance.toNumber();
}

export interface WalletBalanceItem {
  id: string;
  isArchived: boolean;
  currentBalance: number;
}

export interface NetWorthCalculationResult {
  netWorth: number;
  activeBalance: number;
  archivedBalance: number;
  walletCount: number;
}

/**
 * Calcule le patrimoine total (somme de tous les portefeuilles, archivés inclus selon règle Q10)
 * et isole la part des portefeuilles archivés.
 */
export function computeNetWorth(
  wallets: WalletBalanceItem[]
): NetWorthCalculationResult {
  let netWorthDecimal = new Prisma.Decimal(0);
  let activeDecimal = new Prisma.Decimal(0);
  let archivedDecimal = new Prisma.Decimal(0);

  for (const w of wallets) {
    const bal = new Prisma.Decimal(w.currentBalance || 0);
    netWorthDecimal = netWorthDecimal.plus(bal);
    if (w.isArchived) {
      archivedDecimal = archivedDecimal.plus(bal);
    } else {
      activeDecimal = activeDecimal.plus(bal);
    }
  }

  return {
    netWorth: netWorthDecimal.toNumber(),
    activeBalance: activeDecimal.toNumber(),
    archivedBalance: archivedDecimal.toNumber(),
    walletCount: wallets.length,
  };
}
