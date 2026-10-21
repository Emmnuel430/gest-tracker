'use server';

import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWalletBalancesForUser } from '@/lib/services/wallet-balances';
import { ActionResponse } from '@/types/transaction';
import { formatCurrency, getErrorMessage } from '@/lib/utils';

export interface GestionMetrics {
  budgets: {
    count: number;
    overallPercentage: number;
    hasExceeded: boolean;
    badgeText: string;
    badgeVariant: 'neutral' | 'warning' | 'danger' | 'success';
  };
  recurrences: {
    activeCount: number;
    dueCount: number;
    badgeText: string;
    badgeVariant: 'neutral' | 'warning' | 'danger';
  };
  wallets: {
    count: number;
    totalWealth: number;
    badgeText: string;
    badgeVariant: 'neutral' | 'success';
  };
  debts: {
    pendingCount: number;
    netPosition: number;
    badgeText: string;
    badgeVariant: 'neutral' | 'success' | 'danger';
  };
}

/**
 * Calcule en temps réel les indicateurs clés pour les 4 modules du hub Gestion
 */
export async function getGestionMetricsAction(): Promise<ActionResponse<GestionMetrics>> {
  try {
    const user = await getAuthenticatedUser();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const startDate = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, m, 0, 23, 59, 59, 999);

    const [budgets, expenses, allRules, allDebts, walletData] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: user.id, month: currentMonth },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        select: { category: true, amount: true },
      }),
      prisma.recurringRule.findMany({
        where: { userId: user.id },
      }),
      prisma.debt.findMany({
        where: { userId: user.id },
      }),
      getWalletBalancesForUser(user.id),
    ]);

    // 1. Calculs Budgets
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
    const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const hasExceeded = overallPercentage >= 100;

    let budgetBadgeText = 'À configurer';
    let budgetVariant: 'neutral' | 'warning' | 'danger' | 'success' = 'neutral';
    if (budgets.length > 0) {
      budgetBadgeText = `${budgets.length} actif(s) • ${overallPercentage}%`;
      if (hasExceeded) {
        budgetVariant = 'danger';
      } else if (overallPercentage >= 75) {
        budgetVariant = 'warning';
      } else {
        budgetVariant = 'success';
      }
    }

    // 2. Calculs Récurrences
    const activeRules = allRules.filter((r) => r.isActive);
    const dueRules = activeRules.filter(
      (r) => !r.lastProcessedMonth || r.lastProcessedMonth !== currentMonth
    );
    let recurrenceBadgeText = 'À configurer';
    let recurrenceVariant: 'neutral' | 'warning' | 'danger' = 'neutral';
    if (activeRules.length > 0) {
      if (dueRules.length > 0) {
        recurrenceBadgeText = `${activeRules.length} règles • ${dueRules.length} due(s)`;
        recurrenceVariant = 'warning';
      } else {
        recurrenceBadgeText = `${activeRules.length} règle(s) à jour`;
        recurrenceVariant = 'neutral';
      }
    }

    // 3. Calculs Portefeuilles
    const activeWallets = walletData.wallets.filter((w) => !w.isArchived);
    let walletBadgeText = 'À configurer';
    let walletVariant: 'neutral' | 'success' = 'neutral';
    if (activeWallets.length > 0) {
      walletBadgeText = `${activeWallets.length} compte(s) • ${formatCurrency(walletData.netWorth)}`;
      walletVariant = 'success';
    }

    // 4. Calculs Dettes
    const pendingDebts = allDebts.filter((d) => d.status !== 'SETTLED');
    const lentPending = pendingDebts
      .filter((d) => d.type === 'LENT')
      .reduce((acc, d) => acc + Number(d.remainingAmount), 0);
    const borrowedPending = pendingDebts
      .filter((d) => d.type === 'BORROWED')
      .reduce((acc, d) => acc + Number(d.remainingAmount), 0);
    const netPosition = lentPending - borrowedPending;

    let debtBadgeText = 'À jour';
    let debtVariant: 'neutral' | 'success' | 'danger' = 'neutral';
    if (pendingDebts.length > 0) {
      const sign = netPosition > 0 ? '+' : '';
      debtBadgeText = `${pendingDebts.length} dossier(s) • ${sign}${formatCurrency(netPosition)}`;
      debtVariant = netPosition >= 0 ? 'success' : 'danger';
    }

    return {
      success: true,
      data: {
        budgets: {
          count: budgets.length,
          overallPercentage,
          hasExceeded,
          badgeText: budgetBadgeText,
          badgeVariant: budgetVariant,
        },
        recurrences: {
          activeCount: activeRules.length,
          dueCount: dueRules.length,
          badgeText: recurrenceBadgeText,
          badgeVariant: recurrenceVariant,
        },
        wallets: {
          count: activeWallets.length,
          totalWealth: walletData.netWorth,
          badgeText: walletBadgeText,
          badgeVariant: walletVariant,
        },
        debts: {
          pendingCount: pendingDebts.length,
          netPosition,
          badgeText: debtBadgeText,
          badgeVariant: debtVariant,
        },
      },
    };
  } catch (error) {
    console.error('Erreur getGestionMetricsAction:', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de récupérer les métriques de gestion',
    };
  }
}
