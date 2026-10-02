import { getTransactionsAction } from '@/actions/transactions';
import { HistoryView } from '@/components/history/HistoryView';

export const dynamic = 'force-dynamic';

export default async function HistoriquePage() {
  // Chargement initial des transactions (toutes périodes pour que le client puisse switcher rapidement)
  const result = await getTransactionsAction({ limit: 200 });
  const transactions = result.success ? result.data : [];

  return <HistoryView initialTransactions={transactions} />;
}
