import { TransactionForm } from '@/components/transactions/TransactionForm';
import { requireOnboarding } from '@/lib/onboarding';

export default async function SortantPage() {
  await requireOnboarding();

  return (
    <div className="py-2">
      <TransactionForm type="EXPENSE" />
    </div>
  );
}
