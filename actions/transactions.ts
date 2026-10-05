'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { TransactionSchema, UpdateTransactionSchema } from '@/lib/validations';
import { serializeTransaction } from '@/lib/utils';
import { getDateRangeForPeriod } from '@/lib/dates';
import { calculateFinancialSummary } from '@/lib/statistics';
import { PeriodType } from '@/types/period';
import { ActionResult } from '@/types/transaction';

export type ActionResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Crée une nouvelle transaction (Revenu ou Dépense)
 * Utilisé par les formulaires /entrant et /sortant
 */
export async function createTransactionAction(
  rawData: unknown
): Promise<ActionResponse> {
  try {
    const parseResult = TransactionSchema.safeParse(rawData);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((err: any) => {
        const fieldName = err.path.join('.');
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
        fieldErrors[fieldName].push(err.message);
      });

      return {
        success: false,
        error: 'Veuillez corriger les erreurs de saisie',
        fieldErrors,
      };
    }

    const { type, amount, category, payment, date, note } = parseResult.data;

    // Logique métier : Vérification si une date précise a été fournie manuellement.
    // Si la date est omise, nulle ou non spécifiée (création instantanée), le système génère l'horodatage courant exact.
    const finalDate =
      date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

    const createdTx = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        payment,
        date: finalDate,
        note: note ? note.trim() : null,
      },
    });

    revalidatePath('/');
    revalidatePath('/historique');
    revalidatePath('/entrant');
    revalidatePath('/sortant');

    return {
      success: true,
      data: serializeTransaction(createdTx),
      message: type === 'INCOME' ? 'Revenu enregistré avec succès !' : 'Sortie enregistrée avec succès !',
    };
  } catch (error: any) {
    console.error('Erreur lors de la création de la transaction :', error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de l'enregistrement",
    };
  }
}

/**
 * Récupère les transactions filtrées avec pagination optionnelle
 */
export async function getTransactionsAction(options?: {
  period?: PeriodType | 'all';
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  payment?: string;
  limit?: number;
}): Promise<ActionResponse> {
  try {
    const where: any = {};

    if (options?.period && options.period !== 'all') {
      const dateRange = getDateRangeForPeriod(
        options.period,
        options.startDate,
        options.endDate
      );
      where.date = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    } else if (options?.startDate && options?.endDate) {
      const dateRange = getDateRangeForPeriod(
        'custom',
        options.startDate,
        options.endDate
      );
      where.date = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    if (options?.type) {
      where.type = options.type;
    }
    if (options?.category && options.category !== 'all') {
      where.category = options.category;
    }
    if (options?.payment && options.payment !== 'all') {
      where.payment = options.payment;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: options?.limit ?? 500,
    });

    return {
      success: true,
      data: transactions.map(serializeTransaction),
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des transactions :', error);
    return {
      success: false,
      error: 'Impossible de charger les transactions',
    };
  }
}

/**
 * Récupère les données du dashboard d'accueil (Solde global, Revenus et Dépenses selon période, dernières transactions)
 * Conforme aux sections 10 et 11 de la roadmap V1.2.
 */
export async function getDashboardDataAction(): Promise<ActionResponse> {
  try {
    const todayRange = getDateRangeForPeriod('today');
    const monthRange = getDateRangeForPeriod('month');
    const yearRange = getDateRangeForPeriod('year');

    // 1. Calcul du Solde Global sur l'ensemble de toutes les transactions (Section 11)
    const allTxs = await prisma.transaction.findMany({
      select: { type: true, amount: true },
    });

    let totalAllIncome = 0;
    let totalAllExpense = 0;
    for (const t of allTxs) {
      const amt = Number(t.amount);
      if (t.type === 'INCOME') totalAllIncome += amt;
      else totalAllExpense += amt;
    }
    const globalBalance = totalAllIncome - totalAllExpense;

    // 2. Transactions de l'année pour dériver yearSummary, monthSummary, todaySummary
    const yearTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: yearRange.from,
          lte: yearRange.to,
        },
      },
      orderBy: { date: 'desc' },
    });

    const serializedYearTxs = yearTransactions.map(serializeTransaction);
    const yearSummary = calculateFinancialSummary(serializedYearTxs);

    const monthTxs = serializedYearTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= monthRange.from && d <= monthRange.to;
    });
    const monthSummary = calculateFinancialSummary(monthTxs);

    const todayTxs = monthTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= todayRange.from && d <= todayRange.to;
    });
    const todaySummary = calculateFinancialSummary(todayTxs);

    // 3. 5 dernières transactions globales
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
    });

    return {
      success: true,
      data: {
        globalBalance,
        summaries: {
          today: todaySummary,
          month: monthSummary,
          year: yearSummary,
        },
        summary: monthSummary, // Rétrocompatibilité
        recentTransactions: recentTransactions.map(serializeTransaction),
      },
    };
  } catch (error: any) {
    console.error('Erreur getDashboardDataAction :', error);
    return {
      success: false,
      error: 'Impossible de charger les données du tableau de bord',
    };
  }
}

/**
 * Supprime une transaction par son ID
 */
export async function deleteTransactionAction(id: string): Promise<ActionResponse> {
  try {
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id },
      message: 'Transaction supprimée avec succès',
    };
  } catch (error: any) {
    console.error('Erreur suppression transaction :', error);
    return {
      success: false,
      error: 'Erreur lors de la suppression de la transaction',
    };
  }
}

/**
 * Met à jour une transaction existante
 */
export async function updateTransactionAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parseResult = UpdateTransactionSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: 'Données de mise à jour invalides',
      };
    }

    const { id, ...data } = parseResult.data;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.payment && { payment: data.payment }),
        ...(data.date instanceof Date && !isNaN(data.date.getTime()) && { date: data.date }),
        ...(data.note !== undefined && { note: data.note ? data.note.trim() : null }),
      },
    });

    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: serializeTransaction(updated),
      message: 'Transaction mise à jour',
    };
  } catch (error: any) {
    console.error('Erreur mise à jour transaction :', error);
    return {
      success: false,
      error: 'Impossible de mettre à jour la transaction',
    };
  }
}
