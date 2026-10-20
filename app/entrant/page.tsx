import { TransactionForm } from '@/components/transactions/TransactionForm';
import { requireOnboarding } from '@/lib/onboarding';

export default async function EntrantPage() {
  await requireOnboarding();

  return (
    <div className="py-2">
      <TransactionForm type="INCOME" />
    </div>
  );
}
