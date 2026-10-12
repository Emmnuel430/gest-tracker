'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { ActionResponse } from '@/types/transaction';
import { computeFinancialInsights, FinancialInsight, BudgetInsightData } from '@/lib/insights';
import { getErrorMessage } from '@/lib/utils';

/**
 * Récupère les insights financiers déterministes de l'utilisateur pour le mois en cours
 */
export async function getFinancialInsightsAction(
  targetMonth?: string
): Promise<ActionResponse<FinancialInsight[]>> {
  try {
    const user = await getAuthenticatedUser();

    const now = new Date();
    const currentMonthStr =
      targetMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [yearStr, monthStr] = currentMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);

    // Bornes du mois en cours
    const startCurrent = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const endCurrent = new Date(year, m, 0, 23, 59, 59, 999);

    // Bornes du mois précédent
    const startPrevious = new Date(year, m - 2, 1, 0, 0, 0, 0);
    const endPrevious = new Date(year, m - 1, 0, 23, 59, 59, 999);
    const previousMonthStr = `${startPrevious.getFullYear()}-${String(startPrevious.getMonth() + 1).padStart(2, '0')}`;

    // 1. Transactions du mois en cours
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startCurrent, lte: endCurrent },
      },
    });

    // 2. Transactions du mois précédent
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startPrevious, lte: endPrevious },
      },
    });

    // 3. Budgets du mois en cours (sécurisé avec fallback défensif)
    const budgets = prisma?.budget?.findMany
      ? await prisma.budget.findMany({
          where: {
            userId: user.id,
            month: currentMonthStr,
          },
        })
      : [];

    // Agrégations mois en cours
    let currentIncome = 0;
    let currentExpense = 0;
    const categoryExpensesCurrent: Record<string, number> = {};

    for (const tx of currentTransactions) {
      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') {
        currentIncome += amount;
      } else if (tx.type === 'EXPENSE') {
        currentExpense += amount;
        categoryExpensesCurrent[tx.category] = (categoryExpensesCurrent[tx.category] || 0) + amount;
      }
    }

    // Agrégations mois précédent
    const categoryExpensesPrevious: Record<string, number> = {};
    for (const tx of previousTransactions) {
      if (tx.type === 'EXPENSE') {
        const amount = Number(tx.amount);
        categoryExpensesPrevious[tx.category] =
          (categoryExpensesPrevious[tx.category] || 0) + amount;
      }
    }

    // Calculs de consommation budget
    const budgetData: BudgetInsightData[] = budgets.map((b) => {
      const budgetAmount = Number(b.amount);
      const spent = categoryExpensesCurrent[b.category] || 0;
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
      if (percentage >= 100) status = 'EXCEEDED';
      else if (percentage >= 75) status = 'WARNING';

      return {
        category: b.category,
        amount: budgetAmount,
        spent,
        percentage,
        status,
      };
    });

    const insights = computeFinancialInsights({
      currentIncome,
      currentExpense,
      currentBalance: currentIncome - currentExpense,
      categoryExpensesCurrent,
      categoryExpensesPrevious,
      budgets: budgetData,
    });

    return {
      success: true,
      data: insights,
    };
  } catch (error: unknown) {
    console.error('Erreur getFinancialInsightsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer les analyses financières',
    };
  }
}
