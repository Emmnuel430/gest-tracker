export interface BudgetProgressItem {
  id: string;
  category: string;
  categoryId?: string | null;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';
  month: string;
}

export interface MonthlyBudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  items: BudgetProgressItem[];
}

export interface BudgetCalculationInput {
  id: string;
  category: string;
  categoryId?: string | null;
  amount: number | string | { toString(): string };
  month: string;
}

export interface ExpenseCalculationInput {
  category: string;
  categoryId?: string | null;
  amount: number | string | { toString(): string };
}

/**
 * Normalise le libellé d'une catégorie pour les comparaisons insensibles à la casse et aux espaces.
 */
export function normalizeCategoryName(name: string): string {
  return (name || '').trim().toLowerCase();
}

/**
 * Vérifie si une dépense correspond à un budget donné :
 * 1. Priorité à l'identifiant relationnel `categoryId` lorsque les deux entités le renseignent.
 * 2. Repli insensible à la casse sur le libellé `category` pour les opérations historiques ou importées.
 */
export function doesExpenseMatchBudget(
  budget: { categoryId?: string | null; category: string },
  expense: { categoryId?: string | null; category: string }
): boolean {
  if (budget.categoryId && expense.categoryId) {
    if (budget.categoryId === expense.categoryId) {
      return true;
    }
  }
  return normalizeCategoryName(expense.category) === normalizeCategoryName(budget.category);
}

/**
 * Calcule de manière déterministe la progression de chaque budget du mois ainsi que les totaux globaux.
 * Seules les dépenses appartenant aux catégories budgétées du mois sont comptabilisées dans `totalSpent` ([BUD-01]).
 */
export function computeMonthlyBudgetSummary(
  month: string,
  budgets: BudgetCalculationInput[],
  expenses: ExpenseCalculationInput[]
): MonthlyBudgetSummary {
  let totalBudget = 0;
  let totalSpent = 0;

  const items: BudgetProgressItem[] = budgets.map((b) => {
    const bAmount = Number(b.amount);
    const spent = expenses.reduce((sum, exp) => {
      if (doesExpenseMatchBudget(b, exp)) {
        return sum + Number(exp.amount);
      }
      return sum;
    }, 0);

    const remaining = bAmount - spent;
    const percentage = bAmount > 0 ? Math.round((spent / bAmount) * 100) : 0;

    let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
    if (percentage >= 100) status = 'EXCEEDED';
    else if (percentage >= 75) status = 'WARNING';

    totalBudget += bAmount;
    totalSpent += spent;

    return {
      id: b.id,
      category: b.category,
      categoryId: b.categoryId ?? null,
      amount: bAmount,
      spent,
      remaining,
      percentage,
      status,
      month: b.month,
    };
  });

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    month,
    totalBudget,
    totalSpent,
    totalRemaining,
    overallPercentage,
    items,
  };
}
