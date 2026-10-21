import { getTransactionsPageAction, getHistoryStatsAction } from '@/actions/transactions';
import { HistoryView } from '@/components/history/HistoryView';
import { HistoryFiltersSchema } from '@/lib/validations';
import { requireOnboarding } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

interface HistoriquePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoriquePage({ searchParams }: HistoriquePageProps) {
  await requireOnboarding();

  const resolvedParams = await searchParams;
  const rawPeriod = typeof resolvedParams.period === 'string' ? resolvedParams.period : 'month';
  const rawType = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'all';
  const rawCategory = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';
  const rawPayment = typeof resolvedParams.payment === 'string' ? resolvedParams.payment : 'all';
  const rawTab = typeof resolvedParams.tab === 'string' ? resolvedParams.tab : 'list';
  const rawStart = typeof resolvedParams.start === 'string' ? resolvedParams.start : undefined;
  const rawEnd = typeof resolvedParams.end === 'string' ? resolvedParams.end : undefined;

  const parsedFilters = HistoryFiltersSchema.safeParse({
    period: rawPeriod,
    type: rawType,
    category: rawCategory,
    payment: rawPayment,
    tab: rawTab,
    startDate: rawStart,
    endDate: rawEnd,
  });

  const filters = parsedFilters.success
    ? parsedFilters.data
    : {
        period: 'month' as const,
        type: 'all' as const,
        category: 'all',
        payment: 'all',
        tab: 'list' as const,
      };

  const [pageRes, statsRes] = await Promise.all([
    getTransactionsPageAction(filters, null, 20),
    getHistoryStatsAction(filters),
  ]);

  const initialTransactions = pageRes.success && pageRes.data ? pageRes.data.items : [];
  const initialNextCursor = pageRes.success && pageRes.data ? pageRes.data.nextCursor : null;
  const initialTotalCount = pageRes.success && pageRes.data ? pageRes.data.totalCount : 0;
  const initialStats = statsRes.success && statsRes.data ? statsRes.data : null;

  return (
    <HistoryView
      initialTransactions={initialTransactions}
      initialNextCursor={initialNextCursor}
      initialTotalCount={initialTotalCount}
      initialStats={initialStats}
    />
  );
}
