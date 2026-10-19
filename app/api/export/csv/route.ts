import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDateRangeForPeriod, formatDisplayDate } from '@/lib/dates';
import { serializeTransaction } from '@/lib/utils';
import { PeriodType } from '@/types/period';
import { getAuthenticatedUser } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as PeriodType) || 'month';
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const range =
      period === 'custom' && start && end
        ? getDateRangeForPeriod('custom', start, end)
        : getDateRangeForPeriod(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: range.from,
          lte: range.to,
        },
      },
      orderBy: { date: 'desc' },
    });

    const serializedTxs = transactions.map(serializeTransaction);

    // En-têtes CSV avec point-virgule (compatible Excel FR)
    const headers = ['ID', 'Date', 'Type', 'Montant', 'Devise', 'Catégorie', 'Moyen de paiement', 'Note'];
    const rows = serializedTxs.map((t) => {
      let typeLabel = 'DÉPENSE';
      if (t.type === 'INCOME') typeLabel = 'REVENU';
      else if (t.type === 'TRANSFER') typeLabel = 'VIREMENT';

      return [
        `"${t.id}"`,
        `"${formatDisplayDate(t.date, 'yyyy-MM-dd HH:mm')}"`,
        `"${typeLabel}"`,
        t.amount,
        '"FCFA"',
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.payment || '').replace(/"/g, '""')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    // Ajout du BOM UTF-8 (\uFEFF) pour un encodage parfait sous Excel
    const bom = '\uFEFF';
    const body = bom + csvContent;

    const fromDateStr = format(range.from, 'yyyy-MM-dd');
    const toDateStr = format(range.to, 'yyyy-MM-dd');
    const filename = `gest-tracker_${fromDateStr}_au_${toDateStr}.csv`;

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error('Erreur export CSV :', error);
    return NextResponse.json({ error: "Impossible de générer l'export CSV" }, { status: 500 });
  }
}
