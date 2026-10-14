import { Transaction } from '@/types/transaction';
import {
  FinancialSummary,
  CategoryBreakdown,
  PaymentMethodBreakdown,
  PeriodComparisonResult,
} from '@/types/statistics';
import { CATEGORY_COLORS } from '@/constants/categories';

export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else if (tx.type === 'EXPENSE') {
      totalExpense += tx.amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'INCOME' | 'EXPENSE' = 'EXPENSE',
  colorResolver?: (category: string) => string
): CategoryBreakdown[] {
  const filtered = transactions.filter((tx) => tx.type === type);
  const totalAmount = filtered.reduce((acc, tx) => acc + tx.amount, 0);

  const groupMap = new Map<string, { total: number; count: number }>();

  for (const tx of filtered) {
    const existing = groupMap.get(tx.category) || { total: 0, count: 0 };
    groupMap.set(tx.category, {
      total: existing.total + tx.amount,
      count: existing.count + 1,
    });
  }

  const breakdown: CategoryBreakdown[] = [];

  groupMap.forEach((val, cat) => {
    const percentage = totalAmount > 0 ? (val.total / totalAmount) * 100 : 0;
    const resolvedColor = colorResolver
      ? colorResolver(cat)
      : (CATEGORY_COLORS[cat] || '#000000');

    breakdown.push({
      category: cat,
      total: val.total,
      percentage: Math.round(percentage * 10) / 10,
      color: resolvedColor,
      count: val.count,
    });
  });

  // Tri décroissant par montant total
  return breakdown.sort((a, b) => b.total - a.total);
}

export function calculatePaymentMethodBreakdown(
  transactions: Transaction[]
): PaymentMethodBreakdown[] {
  const totalAmount = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const groupMap = new Map<string, { total: number; count: number }>();

  for (const tx of transactions) {
    const existing = groupMap.get(tx.payment) || { total: 0, count: 0 };
    groupMap.set(tx.payment, {
      total: existing.total + tx.amount,
      count: existing.count + 1,
    });
  }

  const breakdown: PaymentMethodBreakdown[] = [];

  groupMap.forEach((val, method) => {
    const percentage = totalAmount > 0 ? (val.total / totalAmount) * 100 : 0;
    breakdown.push({
      method,
      total: val.total,
      percentage: Math.round(percentage * 10) / 10,
      count: val.count,
    });
  });

  return breakdown.sort((a, b) => b.total - a.total);
}

/**
 * Compare deux périodes (N vs N-1) avec gestion stricte du cas division par zéro
 */
export function comparePeriods(
  currentTotal: number,
  previousTotal: number
): PeriodComparisonResult {
  const difference = currentTotal - previousTotal;

  let percentageChange = 0;
  if (previousTotal === 0) {
    // Si la période précédente était à 0 et l'actuelle > 0, on considère +100%
    percentageChange = currentTotal > 0 ? 100 : 0;
  } else {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  return {
    currentTotal,
    previousTotal,
    difference,
    percentageChange: Math.round(percentageChange * 10) / 10,
    isIncrease: difference >= 0,
  };
}
