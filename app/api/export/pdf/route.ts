import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDateRangeForPeriod, formatExportPeriodLabel, formatDisplayDate } from '@/lib/dates';
import { calculateFinancialSummary } from '@/lib/statistics';
import { serializeTransaction, escapeHtml } from '@/lib/utils';
import { formatCurrency, APP_CONFIG } from '@/constants/config';
import { PeriodType } from '@/types/period';
import { getAuthenticatedUser } from '@/lib/auth';
import { describeExportFilters } from '@/lib/export-helpers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as PeriodType) || 'month';
    const rawType = searchParams.get('type');
    const rawCategory = searchParams.get('category');
    const rawPayment = searchParams.get('payment');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const range =
      period === 'custom' && start && end
        ? getDateRangeForPeriod('custom', start, end)
        : getDateRangeForPeriod(period);

    // Validation et cohérence des filtres (règle 2.4.0 : catégorie ignorée si aucun type spécifique)
    const type = rawType && rawType !== 'all' && (rawType === 'INCOME' || rawType === 'EXPENSE') ? rawType : null;
    const category = type && rawCategory && rawCategory !== 'all' ? rawCategory : null;
    const payment = rawPayment && rawPayment !== 'all' ? rawPayment : null;

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
      date: {
        gte: range.from,
        lte: range.to,
      },
    };

    if (type) {
      where.type = type;
    }
    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (payment) {
      where.payment = { equals: payment, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const serializedTxs = transactions.map(serializeTransaction);
    const summary = calculateFinancialSummary(serializedTxs);
    const filterDesc = describeExportFilters({ type, category, payment });
    const periodLabel = formatExportPeriodLabel(period, range);
    const generatedAtLabel = format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    const hasTransfers = serializedTxs.some((t) => t.type === 'TRANSFER');

    // Génération du HTML haute fidélité pour impression / enregistrement PDF
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport Financier - ${escapeHtml(APP_CONFIG.appName)} - ${escapeHtml(periodLabel)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #111827;
      background: #FFF;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #111827;
      padding-bottom: 15px;
      margin-bottom: 20px;
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
      padding: 6px 12px;
      background: #FFE600;
      border: 2px solid #111827;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .filters-box {
      background: #F8FAFC;
      border: 2px solid #111827;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 22px;
    }
    .filters-title {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 6px;
    }
    .filters-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 6px;
    }
    .filter-tag {
      background: #DBEAFE;
      color: #1E3A8A;
      border: 1.5px solid #111827;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 800;
    }
    .filters-note {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      font-style: italic;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(${type === 'INCOME' || type === 'EXPENSE' ? '1' : '3'}, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    .card {
      border: 2px solid #111827;
      padding: 14px;
      border-radius: 8px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
    }
    .card-value {
      font-size: 20px;
      font-weight: 900;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 12px;
    }
    th {
      background: #111827;
      color: #FFF;
      text-align: left;
      padding: 8px 10px;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 11px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2E8F0;
      font-weight: 600;
    }
    .text-right { text-align: right; }
    .income { color: #16A34A; }
    .expense { color: #DC2626; }
    .transfer { color: #2563EB; font-weight: 800; }
    .transfer-note {
      margin-top: 15px;
      padding: 8px 12px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #1E40AF;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${escapeHtml(APP_CONFIG.appName)}</div>
      <div style="font-size: 12px; font-weight: 700; color: #4B5563; margin-top: 4px;">
        Période : ${escapeHtml(periodLabel)} • Généré le ${escapeHtml(generatedAtLabel)}
      </div>
    </div>
    <div class="badge">Rapport Financier</div>
  </div>

  <div class="filters-box">
    <div class="filters-title">Périmètre & Filtres du Rapport</div>
    ${
      filterDesc.hasFilters
        ? `<div class="filters-list">
            ${filterDesc.filterLabels.map((l) => `<span class="filter-tag">${escapeHtml(l)}</span>`).join('')}
           </div>`
        : ''
    }
    <div class="filters-note">${escapeHtml(filterDesc.summaryNote)}</div>
  </div>

  <div class="summary-grid">
    ${
      type !== 'EXPENSE'
        ? `
      <div class="card" style="background: #E1FCEF;">
        <div class="card-label">Total Entrées</div>
        <div class="card-value income">+${formatCurrency(Math.abs(Number(summary.totalIncome)))}</div>
      </div>`
        : ''
    }
    ${
      type !== 'INCOME'
        ? `
      <div class="card" style="background: #FFEAEB;">
        <div class="card-label">Total Sorties</div>
        <div class="card-value expense">-${formatCurrency(Math.abs(Number(summary.totalExpense)))}</div>
      </div>`
        : ''
    }
    ${
      !type
        ? `
      <div class="card" style="background: #FFF9D2;">
        <div class="card-label">Solde Période</div>
        <div class="card-value">${formatCurrency(summary.balance)}</div>
      </div>`
        : ''
    }
  </div>

  <h3 style="font-size: 13px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #111827; padding-bottom: 6px; margin-top: 25px;">
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
      ${
        serializedTxs.length === 0
          ? `<tr><td colspan="6" style="text-align: center; color: #64748B; padding: 20px;">Aucune opération trouvée pour cette sélection.</td></tr>`
          : serializedTxs
              .map((t) => {
                const isIncome = t.type === 'INCOME';
                const isExpense = t.type === 'EXPENSE';
                const isTransfer = t.type === 'TRANSFER';

                let typeLabel = 'DÉPENSE';
                let amountClass = 'expense';
                let prefix = '- ';

                if (isIncome) {
                  typeLabel = 'REVENU';
                  amountClass = 'income';
                  prefix = '+ ';
                } else if (isTransfer) {
                  typeLabel = 'VIREMENT';
                  amountClass = 'transfer';
                  prefix = '';
                }

                return `
        <tr>
          <td>${escapeHtml(formatDisplayDate(t.date, 'dd/MM/yyyy HH:mm'))}</td>
          <td><span class="${amountClass}">${escapeHtml(typeLabel)}</span></td>
          <td>${escapeHtml(t.category)}</td>
          <td>${escapeHtml(t.payment)}</td>
          <td>${escapeHtml(t.note || '-')}</td>
          <td class="text-right ${amountClass}">
            ${prefix}${formatCurrency(Math.abs(Number(t.amount)))}
          </td>
        </tr>`;
              })
              .join('')
      }
    </tbody>
  </table>

  ${
    hasTransfers
      ? `<div class="transfer-note">
          ℹ️ <strong>Note sur les virements :</strong> Les virements internes sont listés dans le tableau pour votre suivi, mais ne constituent ni des revenus ni des dépenses et n'altèrent pas les totaux d'entrées et de sorties ci-dessus.
        </div>`
      : ''
  }

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
    console.error('Erreur export rapport PDF :', error);
    return NextResponse.json(
      { error: "Impossible de générer l'export" },
      { status: 500 }
    );
  }
}
