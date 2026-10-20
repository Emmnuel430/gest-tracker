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

/**
 * Détermine si une transaction doit être prise en compte dans le solde après déclaration à T0.
 * Une transaction compte si :
 * 1. Elle a été créée après la déclaration et sa date métier est >= au jour de la déclaration.
 * 2. Ou sa date métier est strictement postérieure à l'instant de la déclaration.
 */
export function isTransactionAfterDeclaration(
  tx: { date: Date | string; createdAt?: Date | string },
  declaredAt: Date | string
): boolean {
  const declDate = new Date(declaredAt);
  const txDate = new Date(tx.date);
  const txCreatedAt = tx.createdAt ? new Date(tx.createdAt) : txDate;

  // Si la transaction a été créée après la déclaration dans l'application
  if (txCreatedAt.getTime() > declDate.getTime()) {
    // Ne compte que si la date métier est sur le même jour calendaire ou ultérieure
    const startOfDeclDay = new Date(declDate.getFullYear(), declDate.getMonth(), declDate.getDate()).getTime();
    const startOfTxDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
    return startOfTxDay >= startOfDeclDay;
  }

  // Si la transaction a été créée avant ou à l'instant T0, elle ne compte que si sa date métier est postérieure
  return txDate.getTime() > declDate.getTime();
}

export interface WalletBalanceCalculationParams {
  initialBalance: number | Prisma.Decimal;
  declaredBalance?: number | Prisma.Decimal | null;
  declaredAt?: Date | string | null;
  movements: WalletMovements;
  postDeclarationMovements?: WalletMovements | null;
}

/**
 * Calcule le solde disponible effectif d'un portefeuille :
 * - Si un solde a été déclaré à T0 : prend declaredBalance + mouvements postérieurs.
 * - Sinon : prend initialBalance + mouvements globaux.
 */
export function calculateEffectiveWalletBalance(
  params: WalletBalanceCalculationParams
): number {
  if (
    params.declaredBalance !== undefined &&
    params.declaredBalance !== null &&
    params.declaredAt
  ) {
    const postMov = params.postDeclarationMovements || {
      income: 0,
      expense: 0,
      transferIn: 0,
      transferOut: 0,
    };
    return computeWalletBalance(params.declaredBalance, postMov);
  }

  return computeWalletBalance(params.initialBalance, params.movements);
}

export interface WalletBalanceItem {
  id: string;
  isArchived: boolean;
  isDeleted?: boolean;
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
 * Les portefeuilles supprimés logiquement (soft-deleted) sont strictement exclus du patrimoine.
 */
export function computeNetWorth(
  wallets: WalletBalanceItem[]
): NetWorthCalculationResult {
  let netWorthDecimal = new Prisma.Decimal(0);
  let activeDecimal = new Prisma.Decimal(0);
  let archivedDecimal = new Prisma.Decimal(0);
  let count = 0;

  for (const w of wallets) {
    if (w.isDeleted) continue;
    count++;
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
    walletCount: count,
  };
}
