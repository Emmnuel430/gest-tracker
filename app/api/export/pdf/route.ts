import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDateRangeForPeriod } from '@/lib/dates';
import { calculateFinancialSummary, calculateCategoryBreakdown } from '@/lib/statistics';
import { serializeTransaction } from '@/lib/utils';
import { formatCurrency, APP_CONFIG } from '@/constants/config';
import { PeriodType } from '@/types/period';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as PeriodType) || 'month';
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const payment = searchParams.get('payment');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const range =
      period === 'custom' && start && end
        ? getDateRangeForPeriod('custom', start, end)
        : getDateRangeForPeriod(period);

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
      date: {
        gte: range.from,
        lte: range.to,
      },
    };

    if (type && type !== 'all' && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type;
    }
    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (payment && payment !== 'all') {
      where.payment = { equals: payment, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const serializedTxs = transactions.map(serializeTransaction);
    const summary = calculateFinancialSummary(serializedTxs);
    const expenseBreakdown = calculateCategoryBreakdown(serializedTxs, 'EXPENSE');

    // Génération d'une page HTML haute fidélité optimisée pour impression / enregistrement PDF
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport Financier - ${APP_CONFIG.appName}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #000;
      background: #FFF;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #000;
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #FFDE59;
      border: 2px solid #000;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .card {
      border: 2px solid #000;
      padding: 15px;
      border-radius: 8px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #555;
    }
    .card-value {
      font-size: 20px;
      font-weight: 900;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 12px;
    }
    th {
      background: #000;
      color: #FFF;
      text-align: left;
      padding: 8px;
      font-weight: 900;
      text-transform: uppercase;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #DDD;
      font-weight: 600;
    }
    .text-right { text-align: right; }
    .income { color: #008A50; }
    .expense { color: #FF3847; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${APP_CONFIG.appName}</div>
      <div style="font-size: 12px; font-weight: 700; color: #666; margin-top: 4px;">
        Période : ${period.toUpperCase()} • Généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
    <div class="badge">Rapport Officiel</div>
  </div>

  <div class="summary-grid">
    <div class="card" style="background: #E1FCEF;">
      <div class="card-label">Total Entrées</div>
      <div class="card-value income">+${formatCurrency(Math.abs(Number(summary.totalIncome)))}</div>
    </div>
    <div class="card" style="background: #FFEAEB;">
      <div class="card-label">Total Sorties</div>
      <div class="card-value expense">-${formatCurrency(Math.abs(Number(summary.totalExpense)))}</div>
    </div>
    <div class="card" style="background: #FFF9D2;">
      <div class="card-label">Solde Période</div>
      <div class="card-value">${formatCurrency(summary.balance)}</div>
    </div>
  </div>

  <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px;">
    Détail des Opérations (${serializedTxs.length})
  </h3>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Catégorie</th>
        <th>Moyen</th>
        <th>Note</th>
        <th class="text-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      ${serializedTxs
        .map(
          (t) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString('fr-FR')}</td>
          <td>${t.type === 'INCOME' ? 'REVENU' : 'DÉPENSE'}</td>
          <td>${t.category}</td>
          <td>${t.payment}</td>
          <td>${t.note || '-'}</td>
          <td class="text-right ${t.type === 'INCOME' ? 'income' : 'expense'}">
            ${t.type === 'INCOME' ? '+' : '-'} ${formatCurrency(Math.abs(Number(t.amount)))}
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    console.error('Erreur export rapport :', error);
    return NextResponse.json(
      { error: "Impossible de générer l'export" },
      { status: 500 }
    );
  }
}
