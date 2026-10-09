import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeTransaction } from '@/lib/utils';
import { calculateFinancialSummary } from '@/lib/statistics';
import { getAuthenticatedUser } from '@/lib/auth';
import { APP_CONFIG } from '@/constants/config';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const serializedTxs = transactions.map(serializeTransaction);
    const summary = calculateFinancialSummary(serializedTxs);

    const exportData = {
      app: APP_CONFIG.appName,
      version: '2.0',
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
        currency: 'FCFA',
      },
      transactions: serializedTxs,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="gest-tracker-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur export JSON :', error);
    return NextResponse.json(
      { error: error?.message || "Impossible de générer l'export JSON" },
      { status: 401 }
    );
  }
}
