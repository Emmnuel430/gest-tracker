import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeTransaction, getErrorMessage } from '@/lib/utils';
import { calculateFinancialSummary } from '@/lib/statistics';
import { getAuthenticatedUser } from '@/lib/auth';
import { APP_CONFIG } from '@/constants/config';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const [transactions, wallets, categories, budgets, debts, recurringRules] =
      await Promise.all([
        prisma.transaction.findMany({
          where: { userId: user.id },
          orderBy: { date: 'desc' },
        }),
        prisma.wallet.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.category.findMany({
          where: { userId: user.id },
          orderBy: { name: 'asc' },
        }),
        prisma.budget.findMany({
          where: { userId: user.id },
          orderBy: [{ month: 'desc' }, { category: 'asc' }],
        }),
        prisma.debt.findMany({
          where: { userId: user.id },
          include: {
            repayments: {
              orderBy: { paidAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.recurringRule.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const serializedTxs = transactions.map(serializeTransaction);
    const summary = calculateFinancialSummary(serializedTxs);

    const exportData = {
      app: APP_CONFIG.appName,
      version: '2.16.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      summary: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
        transactionCount: serializedTxs.length,
        walletCount: wallets.length,
        categoryCount: categories.length,
        budgetCount: budgets.length,
        debtCount: debts.length,
        recurringRuleCount: recurringRules.length,
        currency: 'FCFA',
      },
      wallets: wallets.map((w) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        initialBalance: Number(w.initialBalance),
        declaredBalance: w.declaredBalance !== null ? Number(w.declaredBalance) : null,
        declaredAt: w.declaredAt ? w.declaredAt.toISOString() : null,
        color: w.color,
        isDefault: w.isDefault,
        isArchived: w.isArchived,
        isDeleted: w.isDeleted,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        kind: c.kind,
        color: c.color,
        isArchived: c.isArchived,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      budgets: budgets.map((b) => ({
        id: b.id,
        category: b.category,
        categoryId: b.categoryId,
        amount: Number(b.amount),
        month: b.month,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      debts: debts.map((d) => ({
        id: d.id,
        personName: d.personName,
        type: d.type,
        initialAmount: Number(d.initialAmount),
        remainingAmount: Number(d.remainingAmount),
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        status: d.status,
        note: d.note,
        walletId: d.walletId,
        transactionId: d.transactionId,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        repayments: d.repayments.map((r) => ({
          id: r.id,
          amount: Number(r.amount),
          paidAt: r.paidAt.toISOString(),
          walletId: r.walletId,
          transactionId: r.transactionId,
          note: r.note,
        })),
      })),
      recurringRules: recurringRules.map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        category: r.category,
        categoryId: r.categoryId,
        payment: r.payment,
        walletId: r.walletId,
        dayOfMonth: r.dayOfMonth,
        frequency: r.frequency,
        note: r.note,
        isActive: r.isActive,
        remindersEnabled: r.remindersEnabled,
        lastProcessedMonth: r.lastProcessedMonth,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      transactions: serializedTxs,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="gest-tracker-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error('Erreur export JSON :', error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Impossible de générer l'export JSON" },
      { status: 401 }
    );
  }
}
