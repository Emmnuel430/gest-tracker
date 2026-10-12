'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { BudgetSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';

export interface BudgetProgressItem {
  id: string;
  category: string;
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

/**
 * Crée ou met à jour le budget mensuel d'une catégorie
 */
export async function upsertBudgetAction(rawData: unknown): Promise<ActionResponse<{ id: string; category: string; amount: number; month: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = BudgetSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données budgétaires invalides',
      };
    }

    const { category, amount, month } = parseResult.data;

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: user.id,
          category,
          month,
        },
      },
      create: {
        userId: user.id,
        category,
        amount,
        month,
      },
      update: {
        amount,
      },
    });

    revalidatePath('/budgets');
    revalidatePath('/historique');
    revalidatePath('/');

    return {
      success: true,
      data: {
        id: budget.id,
        category: budget.category,
        amount: Number(budget.amount),
        month: budget.month,
      },
      message: `Budget pour ${category} enregistré (${amount.toLocaleString('fr-FR')} FCFA)`,
    };
  } catch (error: unknown) {
    console.error('Erreur upsertBudgetAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’enregistrer le budget',
    };
  }
}

/**
 * Supprime un budget
 */
export async function deleteBudgetAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();

    const deleteResult = await prisma.budget.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (deleteResult.count === 0) {
      return {
        success: false,
        error: 'Budget introuvable ou vous ne disposez pas des droits requis',
      };
    }

    revalidatePath('/budgets');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id },
      message: 'Budget supprimé avec succès',
    };
  } catch (error: unknown) {
    console.error('Erreur deleteBudgetAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la suppression du budget',
    };
  }
}

/**
 * Récupère les budgets du mois avec le calcul exact de la consommation en temps réel
 */
export async function getBudgetsWithProgressAction(
  targetMonth?: string
): Promise<ActionResponse<MonthlyBudgetSummary>> {
  try {
    const user = await getAuthenticatedUser();

    // Détermination du mois ciblé (par défaut YYYY-MM en cours)
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = targetMonth || currentMonthStr;

    // Plage temporelle exacte pour le mois
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const startDate = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, m, 0, 23, 59, 59, 999);

    // 1. Récupération des budgets définis (sécurisé défensivement)
    if (!prisma?.budget?.findMany) {
      return {
        success: true,
        data: {
          month,
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallPercentage: 0,
          items: [],
        },
      };
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
      },
      orderBy: {
        amount: 'desc',
      },
    });

    // 2. Récupération de toutes les dépenses du mois
    const expenses = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // 3. Agrégation par catégorie
    const spentByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const amt = Number(exp.amount);
      spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + amt;
    }

    // 4. Calcul de consommation par budget
    let totalBudget = 0;
    let totalSpent = 0;

    const items: BudgetProgressItem[] = budgets.map((b) => {
      const bAmount = Number(b.amount);
      const spent = spentByCategory[b.category] || 0;
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
      success: true,
      data: {
        month,
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage,
        items,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getBudgetsWithProgressAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer la progression budgétaire',
    };
  }
}
