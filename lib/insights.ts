import { formatCurrency } from '@/constants/config';

export type InsightSeverity = 'danger' | 'warning' | 'success' | 'info';

export interface FinancialInsight {
  id: string;
  type: 'EFFORT_RATE' | 'CATEGORY_SPIKE' | 'BUDGET_ALERT' | 'SAVINGS_CAPACITY';
  severity: InsightSeverity;
  title: string;
  message: string;
}

export interface BudgetInsightData {
  category: string;
  amount: number;
  spent: number;
  percentage: number;
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export interface ComputeInsightsParams {
  currentIncome: number;
  currentExpense: number;
  currentBalance: number;
  categoryExpensesCurrent: Record<string, number>;
  categoryExpensesPrevious: Record<string, number>;
  budgets?: BudgetInsightData[];
}

/**
 * Moteur déterministe d'analyse financière et de génération de conseils naturels (V2.1)
 */
export function computeFinancialInsights(params: ComputeInsightsParams): FinancialInsight[] {
  const {
    currentIncome,
    currentExpense,
    categoryExpensesCurrent,
    categoryExpensesPrevious,
    budgets = [],
  } = params;

  const insights: FinancialInsight[] = [];

  // RÈGLE 1 & 4 : Taux d'effort / Reste à vivre & Capacité d'épargne
  if (currentExpense > currentIncome && currentIncome > 0) {
    const deficit = currentExpense - currentIncome;
    insights.push({
      id: 'deficit-alert',
      type: 'EFFORT_RATE',
      severity: 'danger',
      title: 'Dépenses supérieures aux revenus',
      message: `Vos sorties dépassent vos entrées de ${formatCurrency(deficit)} ce mois-ci. Veillez à limiter les achats non prioritaires.`,
    });
  } else if (currentIncome > 0 && currentExpense <= currentIncome) {
    const savingsAmount = currentIncome - currentExpense;
    const savingsRate = Math.round((savingsAmount / currentIncome) * 100);
    insights.push({
      id: 'savings-success',
      type: 'SAVINGS_CAPACITY',
      severity: 'success',
      title: 'Capacité d’épargne positive',
      message: `Bravo ! Vous avez conservé ${savingsRate} % de vos rentrées (${formatCurrency(savingsAmount)}) ce mois-ci.`,
    });
  }

  // RÈGLE 2 : Alerte Budgétaire (catégorie dépassée ou proche du seuil)
  if (budgets.length > 0) {
    // 1. Chercher un budget dépassé
    const exceeded = budgets.find((b) => b.percentage >= 100);
    if (exceeded) {
      const overspent = exceeded.spent - exceeded.amount;
      insights.push({
        id: `budget-exceeded-${exceeded.category}`,
        type: 'BUDGET_ALERT',
        severity: 'danger',
        title: `Plafond ${exceeded.category} dépassé`,
        message: `Vous avez dépassé votre budget ${exceeded.category} de ${formatCurrency(overspent)} (${exceeded.percentage}% consommés).`,
      });
    } else {
      // 2. Chercher le budget le plus sous tension (≥ 75%)
      const atRisk = budgets
        .filter((b) => b.percentage >= 75)
        .sort((a, b) => b.percentage - a.percentage)[0];

      if (atRisk) {
        const remaining = Math.max(0, atRisk.amount - atRisk.spent);
        insights.push({
          id: `budget-warning-${atRisk.category}`,
          type: 'BUDGET_ALERT',
          severity: 'warning',
          title: `Budget ${atRisk.category} sous tension`,
          message: `Attention, vous avez déjà consommé ${atRisk.percentage}% de votre budget ${atRisk.category}. Reste disponible : ${formatCurrency(remaining)}.`,
        });
      }
    }
  }

  // RÈGLE 3 : Hausse atypique de catégorie par rapport à M-1
  let highestGrowthCat: string | null = null;
  let highestGrowthPercent = 0;
  let highestGrowthDiff = 0;

  for (const [cat, currentAmount] of Object.entries(categoryExpensesCurrent)) {
    const prevAmount = categoryExpensesPrevious[cat] || 0;
    // On ne s'intéresse qu'aux variations significatives avec un seuil minimum de dépense (ex: ≥ 5000 FCFA)
    if (prevAmount > 0 && currentAmount > prevAmount && currentAmount >= 5000) {
      const growth = ((currentAmount - prevAmount) / prevAmount) * 100;
      if (growth > 20 && growth > highestGrowthPercent) {
        highestGrowthPercent = Math.round(growth);
        highestGrowthDiff = currentAmount - prevAmount;
        highestGrowthCat = cat;
      }
    }
  }

  if (highestGrowthCat && highestGrowthPercent > 0) {
    insights.push({
      id: `spike-${highestGrowthCat}`,
      type: 'CATEGORY_SPIKE',
      severity: 'warning',
      title: `Forte hausse : ${highestGrowthCat}`,
      message: `Les dépenses "${highestGrowthCat}" ont bondi de +${highestGrowthPercent} % (+${formatCurrency(highestGrowthDiff)}) par rapport au mois dernier.`,
    });
  }

  // Si aucun conseil d'alerte, message neutre positif
  if (insights.length === 0) {
    insights.push({
      id: 'general-healthy',
      type: 'SAVINGS_CAPACITY',
      severity: 'info',
      title: 'Gestion équilibrée',
      message: 'Vos finances sont stables ce mois-ci. Aucun dérapage inhabituel détecté.',
    });
  }

  return insights;
}
