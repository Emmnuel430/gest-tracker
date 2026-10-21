import { TransactionForm } from '@/components/transactions/TransactionForm';
import { requireOnboarding } from '@/lib/onboarding';
import { getCategoriesAction } from '@/actions/categories';
import { getWalletsAction } from '@/actions/wallets';

export default async function SortantPage() {
  await requireOnboarding();

  const [categoriesRes, walletsRes] = await Promise.all([
    getCategoriesAction('EXPENSE'),
    getWalletsAction(),
  ]);

  return (
    <div className="py-2">
      <TransactionForm
        type="EXPENSE"
        serverCategories={categoriesRes.success && categoriesRes.data ? categoriesRes.data : []}
        serverWallets={walletsRes.success && walletsRes.data ? walletsRes.data : []}
      />
    </div>
  );
}
