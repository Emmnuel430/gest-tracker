'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { BudgetSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';
import { formatCurrentMonthISO } from '@/lib/recurring';
import {
  BudgetProgressItem,
  MonthlyBudgetSummary,
  computeMonthlyBudgetSummary,
} from '@/lib/budgets';

export type { BudgetProgressItem, MonthlyBudgetSummary };

/**
 * Crée ou met à jour le budget mensuel d'une catégorie
 */
export async function upsertBudgetAction(
  rawData: unknown
): Promise<ActionResponse<{ id: string; category: string; amount: number; month: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = BudgetSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données budgétaires invalides',
      };
    }

    const { category, amount, month, categoryId } = parseResult.data;

    let resolvedCategoryId = categoryId || null;
    let resolvedCategoryName = category.trim();

    if (resolvedCategoryId) {
      const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } });
      if (!cat || cat.userId !== user.id) {
        return { success: false, error: 'Catégorie non autorisée' };
      }
      if (cat.kind === 'INCOME') {
        return { success: false, error: 'Les budgets ne peuvent être définis que pour des dépenses' };
      }
      if (cat.isArchived) {
        return { success: false, error: 'Impossible de définir un budget sur une catégorie archivée' };
      }
      resolvedCategoryName = cat.name;
    } else if (resolvedCategoryName) {
      const cat = await prisma.category.findUnique({
        where: { userId_name: { userId: user.id, name: resolvedCategoryName } },
      });
      if (cat) {
        if (cat.kind === 'INCOME') {
          return {
            success: false,
            error: 'Les budgets ne peuvent être définis que pour des dépenses',
          };
        }
        if (cat.isArchived) {
          return {
            success: false,
            error: 'Impossible de définir un budget sur une catégorie archivée',
          };
        }
        resolvedCategoryId = cat.id;
        resolvedCategoryName = cat.name;
      }
    }

    const decimalAmount = new Prisma.Decimal(amount);

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: user.id,
          category: resolvedCategoryName,
          month,
        },
      },
      create: {
        userId: user.id,
        category: resolvedCategoryName,
        categoryId: resolvedCategoryId,
        amount: decimalAmount,
        month,
      },
      update: {
        amount: decimalAmount,
        ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      },
    });

    revalidatePath('/budgets');
    revalidatePath('/gestion');
    revalidatePath('/historique');
    revalidatePath('/');
    revalidatePath('/app');

    return {
      success: true,
      data: {
        id: budget.id,
        category: budget.category,
        amount: Number(budget.amount),
        month: budget.month,
      },
      message: `Budget pour ${resolvedCategoryName} enregistré (${amount.toLocaleString('fr-FR')} FCFA)`,
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
    revalidatePath('/gestion');
    revalidatePath('/historique');
    revalidatePath('/');
    revalidatePath('/app');

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
 * Reconduit les budgets du dernier mois configuré vers `targetMonth` en excluant les catégories archivées ([BUD-04])
 */
export async function copyPreviousMonthBudgetsAction(
  targetMonth: string
): Promise<ActionResponse<{ count: number; sourceMonth: string }>> {
  try {
    const user = await getAuthenticatedUser();

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(targetMonth)) {
      return {
        success: false,
        error: 'Le format du mois cible doit être YYYY-MM',
      };
    }

    // 1. Trouver le mois antérieur le plus récent disposant d'au moins un budget
    const latestPreviousBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        month: { lt: targetMonth },
      },
      orderBy: {
        month: 'desc',
      },
      select: {
        month: true,
      },
    });

    if (!latestPreviousBudget) {
      return {
        success: false,
        error: 'Aucun budget défini sur un mois précédent à reconduire',
      };
    }

    const sourceMonth = latestPreviousBudget.month;

    const [sourceBudgets, existingTargetBudgets, userCategories] = await Promise.all([
      prisma.budget.findMany({
        where: {
          userId: user.id,
          month: sourceMonth,
        },
      }),
      prisma.budget.findMany({
        where: {
          userId: user.id,
          month: targetMonth,
        },
        select: {
          category: true,
          categoryId: true,
        },
      }),
      prisma.category.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
          kind: true,
          isArchived: true,
        },
      }),
    ]);

    const categoryById = new Map(userCategories.map((c) => [c.id, c]));
    const categoryByName = new Map(
      userCategories.map((c) => [c.name.trim().toLowerCase(), c])
    );

    const existingCategoryNames = new Set(
      existingTargetBudgets.map((b) => b.category.trim().toLowerCase())
    );

    const eligibleBudgets = sourceBudgets.filter((b) => {
      if (existingCategoryNames.has(b.category.trim().toLowerCase())) {
        return false;
      }

      const linkedCat =
        (b.categoryId ? categoryById.get(b.categoryId) : undefined) ||
        categoryByName.get(b.category.trim().toLowerCase());

      if (linkedCat && (linkedCat.isArchived || linkedCat.kind === 'INCOME')) {
        return false;
      }

      return true;
    });

    if (eligibleBudgets.length === 0) {
      return {
        success: false,
        error: 'Tous les budgets actifs du mois précédent sont déjà configurés ou leurs catégories ont été archivées',
      };
    }

    await prisma.$transaction(
      eligibleBudgets.map((b) => {
        const linkedCat =
          (b.categoryId ? categoryById.get(b.categoryId) : undefined) ||
          categoryByName.get(b.category.trim().toLowerCase());

        return prisma.budget.create({
          data: {
            userId: user.id,
            category: linkedCat ? linkedCat.name : b.category,
            categoryId: linkedCat ? linkedCat.id : b.categoryId,
            amount: new Prisma.Decimal(Number(b.amount)),
            month: targetMonth,
          },
        });
      })
    );

    revalidatePath('/budgets');
    revalidatePath('/gestion');
    revalidatePath('/historique');
    revalidatePath('/');
    revalidatePath('/app');

    return {
      success: true,
      data: {
        count: eligibleBudgets.length,
        sourceMonth,
      },
      message: `${eligibleBudgets.length} budget(s) reconduit(s) depuis ${sourceMonth}`,
    };
  } catch (error: unknown) {
    console.error('Erreur copyPreviousMonthBudgetsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de reconduire les budgets du mois précédent',
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

    // Détermination du mois ciblé dans le fuseau horaire métier Africa/Abidjan ([BUD-06])
    const month = targetMonth || formatCurrentMonthISO();

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

    const [budgets, expenses] = await Promise.all([
      prisma.budget.findMany({
        where: {
          userId: user.id,
          month,
        },
        orderBy: {
          amount: 'desc',
        },
      }),
      prisma.transaction.findMany({
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
          categoryId: true,
          amount: true,
        },
      }),
    ]);

    const summary = computeMonthlyBudgetSummary(month, budgets, expenses);

    return {
      success: true,
      data: summary,
    };
  } catch (error: unknown) {
    console.error('Erreur getBudgetsWithProgressAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer la progression budgétaire',
    };
  }
}
