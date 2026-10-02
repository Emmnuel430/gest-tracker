import { getTransactionsAction } from '@/actions/transactions';
import { HistoryView } from '@/components/history/HistoryView';

export const dynamic = 'force-dynamic';

export default async function HistoriquePage() {
  // Chargement initial complet des transactions pour permettre le filtrage dynamique sur toutes les périodes
  const result = await getTransactionsAction({ period: 'all', limit: 1000 });
  const transactions = result.success ? result.data : [];

  return <HistoryView initialTransactions={transactions} />;
}
