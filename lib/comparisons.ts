import { Transaction } from '@/types/transaction';
import { PAYMENT_METHOD_THEMES } from '@/constants/payment-methods';
import { CATEGORY_COLORS } from '@/constants/categories';

export interface ComparisonVariation {
  currentAmount: number;
  previousAmount: number;
  difference: number;
  percentage: number | null; // null if previous === 0
  isNew: boolean;
  statusText: string; // Ex: "+20 %", "-15 %", "Nouveau", "0 %"
}

export interface CategoryComparisonItem extends ComparisonVariation {
  category: string;
  color: string;
}

export interface PaymentComparisonItem extends ComparisonVariation {
  payment: string;
  theme: { bg: string; text: string };
}

export interface PeriodComparisonData {
  currentTotal: number;
  previousTotal: number;
  difference: number;
  percentage: number | null;
  isNew: boolean;
  statusText: string;
  categoryComparisons: CategoryComparisonItem[];
  paymentComparisons: PaymentComparisonItem[];
}

/**
 * Calcule la variation entre deux montants selon la section 5.3 de la roadmap V1.2.
 * Si la période précédente est 0, on n'affiche jamais +∞ %, mais "Nouveau".
 */
export function calculateVariation(current: number, previous: number): ComparisonVariation {
  const difference = current - previous;
  const isNew = previous === 0 && current > 0;

  if (previous === 0) {
    if (current === 0) {
      return {
        currentAmount: 0,
        previousAmount: 0,
        difference: 0,
        percentage: 0,
        isNew: false,
        statusText: '0 %',
      };
    }
    return {
      currentAmount: current,
      previousAmount: 0,
      difference: current,
      percentage: null,
      isNew: true,
      statusText: 'Nouveau',
    };
  }

  const rawPercent = (difference / previous) * 100;
  const roundedPercent = Math.round(rawPercent * 10) / 10;
  const sign = roundedPercent > 0 ? '+' : '';

  return {
    currentAmount: current,
    previousAmount: previous,
    difference,
    percentage: roundedPercent,
    isNew: false,
    statusText: `${sign}${roundedPercent} %`,
  };
}

/**
 * Génère toutes les comparaisons de dépenses (par catégorie et par moyen de paiement)
 * entre la période actuelle et la période précédente.
 */
export function buildPeriodComparison(
  currentExpenses: Transaction[],
  previousExpenses: Transaction[]
): PeriodComparisonData {
  const currentTotal = currentExpenses.reduce((acc, tx) => acc + tx.amount, 0);
  const previousTotal = previousExpenses.reduce((acc, tx) => acc + tx.amount, 0);

  const totalVariation = calculateVariation(currentTotal, previousTotal);

  // Groupement par catégorie
  const categoryMap = new Map<string, { current: number; previous: number }>();

  for (const tx of currentExpenses) {
    const existing = categoryMap.get(tx.category) || { current: 0, previous: 0 };
    categoryMap.set(tx.category, { ...existing, current: existing.current + tx.amount });
  }

  for (const tx of previousExpenses) {
    const existing = categoryMap.get(tx.category) || { current: 0, previous: 0 };
    categoryMap.set(tx.category, { ...existing, previous: existing.previous + tx.amount });
  }

  const categoryComparisons: CategoryComparisonItem[] = Array.from(categoryMap.entries())
    .map(([cat, val]) => {
      const variation = calculateVariation(val.current, val.previous);
      return {
        category: cat,
        color: CATEGORY_COLORS[cat] || '#2563EB',
        ...variation,
      };
    })
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  // Groupement par moyen de paiement
  const paymentMap = new Map<string, { current: number; previous: number }>();

  for (const tx of currentExpenses) {
    const existing = paymentMap.get(tx.payment) || { current: 0, previous: 0 };
    paymentMap.set(tx.payment, { ...existing, current: existing.current + tx.amount });
  }

  for (const tx of previousExpenses) {
    const existing = paymentMap.get(tx.payment) || { current: 0, previous: 0 };
    paymentMap.set(tx.payment, { ...existing, previous: existing.previous + tx.amount });
  }

  const paymentComparisons: PaymentComparisonItem[] = Array.from(paymentMap.entries())
    .map(([pm, val]) => {
      const variation = calculateVariation(val.current, val.previous);
      return {
        payment: pm,
        theme: PAYMENT_METHOD_THEMES[pm] || { bg: '#EFF6FF', text: '#111827' },
        ...variation,
      };
    })
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  return {
    currentTotal,
    previousTotal,
    difference: totalVariation.difference,
    percentage: totalVariation.percentage,
    isNew: totalVariation.isNew,
    statusText: totalVariation.statusText,
    categoryComparisons,
    paymentComparisons,
  };
}
