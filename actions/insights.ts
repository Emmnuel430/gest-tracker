'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { ActionResponse } from '@/types/transaction';
import { computeFinancialInsights, FinancialInsight, BudgetInsightData } from '@/lib/insights';
import { getErrorMessage } from '@/lib/utils';
import { formatCurrentMonthISO } from '@/lib/recurring';
import { computeMonthlyBudgetSummary } from '@/lib/budgets';

/**
 * Récupère les insights financiers déterministes de l'utilisateur pour le mois en cours
 */
export async function getFinancialInsightsAction(
  targetMonth?: string
): Promise<ActionResponse<FinancialInsight[]>> {
  try {
    const user = await getAuthenticatedUser();

    const currentMonthStr = targetMonth || formatCurrentMonthISO();

    const [yearStr, monthStr] = currentMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);

    // Bornes du mois en cours
    const startCurrent = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const endCurrent = new Date(year, m, 0, 23, 59, 59, 999);

    // Bornes du mois précédent
    const startPrevious = new Date(year, m - 2, 1, 0, 0, 0, 0);
    const endPrevious = new Date(year, m - 1, 0, 23, 59, 59, 999);

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
    const currentExpensesList: Array<{
      category: string;
      categoryId?: string | null;
      amount: number;
    }> = [];

    for (const tx of currentTransactions) {
      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') {
        currentIncome += amount;
      } else if (tx.type === 'EXPENSE') {
        currentExpense += amount;
        categoryExpensesCurrent[tx.category] = (categoryExpensesCurrent[tx.category] || 0) + amount;
        currentExpensesList.push({
          category: tx.category,
          categoryId: tx.categoryId ?? null,
          amount,
        });
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

    // Calculs de consommation budget (via categoryId et repli insensible à la casse - [BUD-03])
    const budgetSummary = computeMonthlyBudgetSummary(
      currentMonthStr,
      budgets,
      currentExpensesList
    );

    const budgetData: BudgetInsightData[] = budgetSummary.items.map((item) => ({
      category: item.category,
      amount: item.amount,
      spent: item.spent,
      percentage: item.percentage,
      status: item.status,
    }));

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
