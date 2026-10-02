import { getDashboardDataAction } from '@/actions/transactions';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { HomeActions } from '@/components/home/HomeActions';
import { RecentTransactionsList } from '@/components/home/RecentTransactionsList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const result = await getDashboardDataAction();

  const summary = result.success
    ? result.data.summary
    : { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };

  const recentTransactions = result.success ? result.data.recentTransactions : [];

  return (
    <div className="flex flex-col items-center">
      {/* 1. Résumé du Solde et totaux du mois */}
      <BalanceSummary summary={summary} />

      {/* 2. Les 3 boutons d'actions massifs (Section 2 de la Roadmap) */}
      <HomeActions />

      {/* 3. Dernières opérations récentes */}
      <RecentTransactionsList transactions={recentTransactions} />
    </div>
  );
}
