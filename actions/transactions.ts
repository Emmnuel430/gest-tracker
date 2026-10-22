'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TransactionSchema, UpdateTransactionSchema, HistoryFiltersInput } from '@/lib/validations';
import { serializeTransaction, getErrorMessage } from '@/lib/utils';
import { getDateRangeForPeriod, getPreviousDateRange } from '@/lib/dates';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculatePaymentMethodBreakdown,
} from '@/lib/statistics';
import { PeriodType, DateRange } from '@/types/period';
import { getAuthenticatedUser } from '@/lib/auth';
import { Transaction } from '@/types/transaction';
import { FinancialSummary, CategoryBreakdown, PaymentMethodBreakdown } from '@/types/statistics';
import { buildPeriodComparison, PeriodComparisonData } from '@/lib/comparisons';
import { getWalletBalancesForUser } from '@/lib/services/wallet-balances';

export type ActionResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface DashboardData {
  globalBalance: number;
  transactionCount: number;
  summaries: {
    today: FinancialSummary;
    week: FinancialSummary;
    month: FinancialSummary;
    year: FinancialSummary;
  };
  summary: FinancialSummary;
  recentTransactions: Transaction[];
}

/**
 * Crée une nouvelle transaction (Revenu ou Dépense)
 * Rattachée hermétiquement au compte de l'utilisateur connecté (Sprint 12 V2)
 */
export async function createTransactionAction(
  rawData: unknown
): Promise<ActionResponse<Transaction>> {
  try {
    const user = await getAuthenticatedUser();

    const parseResult = TransactionSchema.safeParse(rawData);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((err) => {
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

    const { type, amount, category, payment, date, note, categoryId, walletId } = parseResult.data;

    let resolvedCategoryId: string | null = categoryId || null;
    if (resolvedCategoryId) {
      const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } });
      if (!cat || cat.userId !== user.id) {
        return { success: false, error: 'Catégorie non autorisée' };
      }
      if (cat.kind !== 'BOTH' && cat.kind !== type) {
        return { success: false, error: 'Catégorie incompatible avec ce type d’opération' };
      }
    } else if (category) {
      const cat = await prisma.category.findUnique({
        where: { userId_name: { userId: user.id, name: category } },
      });
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    // Résolution du portefeuille et synchronisation du moyen de paiement
    let resolvedWalletId: string | null = walletId || null;
    let resolvedPaymentName: string = payment;

    if (resolvedWalletId) {
      const w = await prisma.wallet.findFirst({
        where: { id: resolvedWalletId, userId: user.id },
      });
      if (!w) {
        return { success: false, error: 'Portefeuille non autorisé ou introuvable' };
      }
      resolvedPaymentName = w.name;
    } else if (payment) {
      const w = await prisma.wallet.findFirst({
        where: { userId: user.id, name: { equals: payment, mode: 'insensitive' } },
      });
      if (w) {
        resolvedWalletId = w.id;
        resolvedPaymentName = w.name;
      }
    }

    // Logique métier : Horodatage exact si non fourni manuellement
    const finalDate =
      date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

    const createdTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type,
        amount,
        category,
        categoryId: resolvedCategoryId,
        payment: resolvedPaymentName,
        walletId: resolvedWalletId,
        date: finalDate,
        note: note ? note.trim() : null,
      },
    });

    revalidatePath('/');
    revalidatePath('/app');
    revalidatePath('/historique');
    revalidatePath('/portefeuilles');
    revalidatePath('/entrant');
    revalidatePath('/sortant');

    return {
      success: true,
      data: serializeTransaction(createdTx),
      message: type === 'INCOME' ? 'Revenu enregistré avec succès !' : 'Sortie enregistrée avec succès !',
    };
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la transaction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || "Une erreur est survenue lors de l'enregistrement",
    };
  }
}

/**
 * Récupère les transactions filtrées avec pagination optionnelle
 * Strictement isolées par l'ID de l'utilisateur connecté (Sprint 12 V2)
 */
export async function getTransactionsAction(options?: {
  period?: PeriodType | 'all';
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  payment?: string;
  limit?: number;
}): Promise<ActionResponse<Transaction[]>> {
  try {
    const user = await getAuthenticatedUser();

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

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
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des transactions :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger les transactions',
    };
  }
}

export interface TransactionsPageResult {
  items: Transaction[];
  nextCursor: string | null;
  totalCount: number;
}

export interface HistoryStatsResult {
  summary: FinancialSummary;
  categoryBreakdown: CategoryBreakdown[];
  paymentBreakdown: PaymentMethodBreakdown[];
  periodComparison: PeriodComparisonData | null;
}

/**
 * Récupère une page de transactions avec pagination par curseur (v2.4.0)
 */
export async function getTransactionsPageAction(
  filters: HistoryFiltersInput,
  cursor?: string | null,
  pageSize = 20
): Promise<ActionResponse<TransactionsPageResult>> {
  try {
    const user = await getAuthenticatedUser();

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    if (filters.period && filters.period !== 'all') {
      const p = filters.period as PeriodType;
      const range = getDateRangeForPeriod(p, filters.startDate, filters.endDate);
      where.date = { gte: range.from, lte: range.to };
    } else if (filters.startDate && filters.endDate) {
      const range = getDateRangeForPeriod('custom', filters.startDate, filters.endDate);
      where.date = { gte: range.from, lte: range.to };
    }

    if (filters.type && filters.type !== 'all') {
      where.type = filters.type;
    }

    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters.payment && filters.payment !== 'all') {
      where.payment = filters.payment;
    }

    const totalCount = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    let nextCursor: string | null = null;
    let items = transactions;

    if (transactions.length > pageSize) {
      const sliced = transactions.slice(0, pageSize);
      nextCursor = sliced[sliced.length - 1].id;
      items = sliced;
    }

    return {
      success: true,
      data: {
        items: items.map(serializeTransaction),
        nextCursor,
        totalCount,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getTransactionsPageAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger la page de transactions',
    };
  }
}

/**
 * Calcule l'intégralité des statistiques d'historique côté serveur (v2.4.0)
 */
export async function getHistoryStatsAction(
  filters: HistoryFiltersInput
): Promise<ActionResponse<HistoryStatsResult>> {
  try {
    const user = await getAuthenticatedUser();

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    let currentRange: DateRange | null = null;
    if (filters.period && filters.period !== 'all') {
      const p = filters.period as PeriodType;
      currentRange = getDateRangeForPeriod(p, filters.startDate, filters.endDate);
      where.date = { gte: currentRange.from, lte: currentRange.to };
    } else if (filters.startDate && filters.endDate) {
      currentRange = getDateRangeForPeriod('custom', filters.startDate, filters.endDate);
      where.date = { gte: currentRange.from, lte: currentRange.to };
    }

    if (filters.type && filters.type !== 'all') {
      where.type = filters.type;
    }
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    if (filters.payment && filters.payment !== 'all') {
      where.payment = filters.payment;
    }

    // Récupérer les catégories de l'utilisateur pour les couleurs
    const userCategories = await prisma.category.findMany({
      where: { userId: user.id },
      select: { name: true, color: true },
    });
    const categoryColorMap = new Map<string, string>();
    for (const c of userCategories) {
      categoryColorMap.set(c.name.toLowerCase(), c.color);
    }
    const getCatColor = (name: string) => categoryColorMap.get(name.toLowerCase()) || '#9E9E9E';

    // Récupérer les portefeuilles pour les couleurs de paiement
    const userWallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      select: { name: true, color: true },
    });
    const walletColorMap = new Map<string, string>();
    for (const w of userWallets) {
      walletColorMap.set(w.name.toLowerCase(), w.color);
    }
    const getWalletColor = (name: string) => walletColorMap.get(name.toLowerCase()) || '#2563EB';

    // Transactions de la période courante filtrée
    const currentTxsRaw = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    const currentTxs = currentTxsRaw.map(serializeTransaction);

    const summary = calculateFinancialSummary(currentTxs);

    // Répartition par catégorie
    const targetType = filters.type === 'INCOME' ? 'INCOME' : 'EXPENSE';
    const categoryBreakdown = calculateCategoryBreakdown(currentTxs, targetType, getCatColor);

    // Répartition par moyen de paiement
    const paymentTargetTxs = filters.type === 'INCOME'
      ? currentTxs.filter((t) => t.type === 'INCOME')
      : currentTxs.filter((t) => t.type === 'EXPENSE');
    const paymentBreakdown = calculatePaymentMethodBreakdown(paymentTargetTxs);

    // Comparatif de période (si applicable et non 'custom' / 'all')
    let periodComparison: PeriodComparisonData | null = null;
    if (currentRange && filters.period !== 'custom' && filters.period !== 'all') {
      const p = filters.period as PeriodType;
      const prevRange = getPreviousDateRange(p, currentRange);

      const wherePrev: Prisma.TransactionWhereInput = {
        userId: user.id,
        date: { gte: prevRange.from, lte: prevRange.to },
      };
      if (filters.type && filters.type !== 'all') wherePrev.type = filters.type;
      if (filters.category && filters.category !== 'all') wherePrev.category = filters.category;
      if (filters.payment && filters.payment !== 'all') wherePrev.payment = filters.payment;

      const prevTxsRaw = await prisma.transaction.findMany({
        where: wherePrev,
      });
      const prevTxs = prevTxsRaw.map(serializeTransaction);

      const currentCompareTxs = filters.type === 'INCOME'
        ? currentTxs.filter((t) => t.type === 'INCOME')
        : currentTxs.filter((t) => t.type === 'EXPENSE');
      const prevCompareTxs = filters.type === 'INCOME'
        ? prevTxs.filter((t) => t.type === 'INCOME')
        : prevTxs.filter((t) => t.type === 'EXPENSE');

      periodComparison = buildPeriodComparison(currentCompareTxs, prevCompareTxs, getWalletColor);
    }

    return {
      success: true,
      data: {
        summary,
        categoryBreakdown,
        paymentBreakdown,
        periodComparison,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getHistoryStatsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer les statistiques d’historique',
    };
  }
}

/**
 * Récupère les données du dashboard d'accueil (Solde global, Revenus et Dépenses selon période, dernières transactions)
 * Strictement calculées sur les données de l'utilisateur connecté (Sprint 12 V2)
 */
export async function getDashboardDataAction(): Promise<ActionResponse<DashboardData>> {
  try {
    const user = await getAuthenticatedUser();

    const todayRange = getDateRangeForPeriod('today');
    const weekRange = getDateRangeForPeriod('week');
    const monthRange = getDateRangeForPeriod('month');
    const yearRange = getDateRangeForPeriod('year');

    // 1. Calcul du Solde Global via le service unique de portefeuilles (patrimoine net)
    // Borne étendue pour inclure la semaine si elle commence sur l'année précédente (Constat C5)
    const queryFromDate = weekRange.from < yearRange.from ? weekRange.from : yearRange.from;
    const queryToDate = weekRange.to > yearRange.to ? weekRange.to : yearRange.to;

    const [walletSummary, allTxs, candidateTransactions, recentTransactions] = await Promise.all([
      getWalletBalancesForUser(user.id),
      prisma.transaction.findMany({
        where: { userId: user.id },
        select: { type: true, amount: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: {
            gte: queryFromDate,
            lte: queryToDate,
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { date: 'desc' },
      }),
    ]);

    const globalBalance = walletSummary.netWorth;

    // 2. Dérivation des résumés yearSummary, monthSummary, weekSummary, todaySummary
    const serializedCandidateTxs = candidateTransactions.map(serializeTransaction);

    const yearTxs = serializedCandidateTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= yearRange.from && d <= yearRange.to;
    });
    const yearSummary = calculateFinancialSummary(yearTxs);

    const monthTxs = serializedCandidateTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= monthRange.from && d <= monthRange.to;
    });
    const monthSummary = calculateFinancialSummary(monthTxs);

    const weekTxs = serializedCandidateTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= weekRange.from && d <= weekRange.to;
    });
    const weekSummary = calculateFinancialSummary(weekTxs);

    const todayTxs = serializedCandidateTxs.filter((tx) => {
      const d = new Date(tx.date);
      return d >= todayRange.from && d <= todayRange.to;
    });
    const todaySummary = calculateFinancialSummary(todayTxs);

    return {
      success: true,
      data: {
        globalBalance,
        transactionCount: allTxs.length,
        summaries: {
          today: todaySummary,
          week: weekSummary,
          month: monthSummary,
          year: yearSummary,
        },
        summary: monthSummary, // Rétrocompatibilité
        recentTransactions: recentTransactions.map(serializeTransaction),
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getDashboardDataAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger les données du tableau de bord',
    };
  }
}

/**
 * Supprime une transaction par son ID, avec vérification stricte de possession
 */
export async function deleteTransactionAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();

    // Vérifier l'existence et l'appartenance
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Transaction introuvable ou non autorisée',
      };
    }

    // Protection des frais de virement : interdire la suppression directe (ADR-04)
    if (existing.linkedTransferId) {
      return {
        success: false,
        error: 'Cette dépense correspond à des frais de virement. Modifiez ou supprimez le virement d’origine.',
      };
    }

    // Suppression sécurisée : si virement, suppression en cascade de ses frais associés
    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: { linkedTransferId: id, userId: user.id },
      }),
      prisma.transaction.delete({
        where: { id },
      }),
    ]);

    revalidatePath('/');
    revalidatePath('/app');
    revalidatePath('/historique');
    revalidatePath('/portefeuilles');

    return {
      success: true,
      data: { id },
      message: 'Transaction supprimée avec succès',
    };
  } catch (error: unknown) {
    console.error('Erreur suppression transaction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la suppression de la transaction',
    };
  }
}

/**
 * Récupère les frais associés à un virement donné s'ils existent
 */
export async function getLinkedTransferFeeAction(
  transferId: string
): Promise<ActionResponse<Transaction | null>> {
  try {
    const user = await getAuthenticatedUser();
    const feeTx = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        linkedTransferId: transferId,
      },
    });

    return {
      success: true,
      data: feeTx ? serializeTransaction(feeTx) : null,
    };
  } catch (error: unknown) {
    console.error('Erreur getLinkedTransferFeeAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger les frais du virement',
    };
  }
}

/**
 * Met à jour une transaction existante, avec vérification stricte de possession
 */
export async function updateTransactionAction(rawData: unknown): Promise<ActionResponse<Transaction>> {
  try {
    const user = await getAuthenticatedUser();

    const parseResult = UpdateTransactionSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: 'Données de mise à jour invalides',
      };
    }

    const { id, ...data } = parseResult.data;

    // Vérifier la possession légitime de la transaction
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Transaction introuvable ou vous ne disposez pas des droits requis',
      };
    }

    // Protection des frais de virement : interdire la modification directe (ADR-04)
    if (existing.linkedTransferId) {
      return {
        success: false,
        error: 'Cette dépense correspond à des frais de virement. Modifiez ou supprimez le virement d’origine.',
      };
    }

    let resolvedCategoryId = data.categoryId !== undefined ? data.categoryId : undefined;
    if (resolvedCategoryId) {
      const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } });
      if (!cat || cat.userId !== user.id) {
        return { success: false, error: 'Catégorie non autorisée' };
      }
      const targetType = data.type || existing.type;
      if (cat.kind !== 'BOTH' && cat.kind !== targetType) {
        return { success: false, error: 'Catégorie incompatible avec ce type d’opération' };
      }
    } else if (data.category && resolvedCategoryId === undefined) {
      const cat = await prisma.category.findUnique({
        where: { userId_name: { userId: user.id, name: data.category } },
      });
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    // Résolution et validation du portefeuille
    let resolvedWalletId = data.walletId !== undefined ? data.walletId : undefined;
    let resolvedPaymentName = data.payment;

    if (resolvedWalletId) {
      const w = await prisma.wallet.findFirst({
        where: { id: resolvedWalletId, userId: user.id },
      });
      if (!w) {
        return { success: false, error: 'Portefeuille non autorisé ou introuvable' };
      }
      resolvedPaymentName = w.name;
    } else if (data.payment && resolvedWalletId === undefined) {
      const w = await prisma.wallet.findFirst({
        where: { userId: user.id, name: { equals: data.payment, mode: 'insensitive' } },
      });
      if (w) {
        resolvedWalletId = w.id;
        resolvedPaymentName = w.name;
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(resolvedCategoryId !== undefined && { categoryId: resolvedCategoryId }),
        ...(resolvedPaymentName && { payment: resolvedPaymentName }),
        ...(resolvedWalletId !== undefined && { walletId: resolvedWalletId }),
        ...(data.date instanceof Date && !isNaN(data.date.getTime()) && { date: data.date }),
        ...(data.note !== undefined && { note: data.note ? data.note.trim() : null }),
      },
    });

    revalidatePath('/');
    revalidatePath('/app');
    revalidatePath('/historique');
    revalidatePath('/portefeuilles');

    return {
      success: true,
      data: serializeTransaction(updated),
      message: 'Transaction mise à jour',
    };
  } catch (error: unknown) {
    console.error('Erreur mise à jour transaction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de mettre à jour la transaction',
    };
  }
}
