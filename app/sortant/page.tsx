import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function SortantPage() {
  return (
    <div className="py-2">
      <TransactionForm type="EXPENSE" />
    </div>
  );
}
