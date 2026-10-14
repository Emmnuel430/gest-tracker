import { formatCurrency, SAVINGS_WARNING_THRESHOLD } from '@/constants/config';

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
    if (savingsRate < SAVINGS_WARNING_THRESHOLD) {
      insights.push({
        id: 'savings-warning',
        type: 'SAVINGS_CAPACITY',
        severity: 'warning',
        title: 'Marge de sécurité faible',
        message: `Attention, votre épargne résiduelle est sous le seuil de 15 % (${savingsRate} %, soit ${formatCurrency(savingsAmount)} restants ce mois-ci).`,
      });
    } else {
      insights.push({
        id: 'savings-success',
        type: 'SAVINGS_CAPACITY',
        severity: 'success',
        title: 'Capacité d’épargne positive',
        message: `Bravo ! Vous avez conservé ${savingsRate} % de vos rentrées (${formatCurrency(savingsAmount)}) ce mois-ci.`,
      });
    }
  }

  // RÈGLE 2 : Alerte Budgétaire (catégorie dépassée et/ou proche du seuil)
  if (budgets.length > 0) {
    // 1. Tous les budgets dépassés (>= 100%), triés par pourcentage décroissant
    const exceededBudgets = budgets
      .filter((b) => b.percentage >= 100)
      .sort((a, b) => b.percentage - a.percentage);

    for (const exceeded of exceededBudgets) {
      const overspent = exceeded.spent - exceeded.amount;
      insights.push({
        id: `budget-exceeded-${exceeded.category}`,
        type: 'BUDGET_ALERT',
        severity: 'danger',
        title: `Plafond ${exceeded.category} dépassé`,
        message: `Vous avez dépassé votre budget ${exceeded.category} de ${formatCurrency(overspent)} (${exceeded.percentage}% consommés).`,
      });
    }

    // 2. Tous les budgets sous tension (75% <= percentage < 100%), triés par pourcentage décroissant
    const atRiskBudgets = budgets
      .filter((b) => b.percentage >= 75 && b.percentage < 100)
      .sort((a, b) => b.percentage - a.percentage);

    for (const atRisk of atRiskBudgets) {
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

  // RÈGLE 3 : Hausse atypique de catégorie par rapport à M-1
  const spikes: Array<{
    category: string;
    growthPercent: number;
    growthDiff: number;
  }> = [];

  for (const [cat, currentAmount] of Object.entries(categoryExpensesCurrent)) {
    const prevAmount = categoryExpensesPrevious[cat] || 0;
    // On ne s'intéresse qu'aux variations significatives avec un seuil minimum de dépense (ex: ≥ 5000 FCFA)
    if (prevAmount > 0 && currentAmount > prevAmount && currentAmount >= 5000) {
      const growth = ((currentAmount - prevAmount) / prevAmount) * 100;
      if (growth > 20) {
        spikes.push({
          category: cat,
          growthPercent: Math.round(growth),
          growthDiff: currentAmount - prevAmount,
        });
      }
    }
  }

  // Tri par croissance décroissante
  spikes.sort((a, b) => b.growthPercent - a.growthPercent);

  for (const spike of spikes) {
    insights.push({
      id: `spike-${spike.category}`,
      type: 'CATEGORY_SPIKE',
      severity: 'warning',
      title: `Forte hausse : ${spike.category}`,
      message: `Les dépenses "${spike.category}" ont bondi de +${spike.growthPercent} % (+${formatCurrency(spike.growthDiff)}) par rapport au mois dernier.`,
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

  // Tri déterministe par sévérité : danger > warning > info > success (V2.1.0)
  const SEVERITY_ORDER: Record<InsightSeverity, number> = {
    danger: 0,
    warning: 1,
    info: 2,
    success: 3,
  };

  insights.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99));

  return insights;
}
