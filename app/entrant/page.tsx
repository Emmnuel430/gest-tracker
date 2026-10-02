import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function EntrantPage() {
  return (
    <div className="py-2">
      <TransactionForm type="INCOME" />
    </div>
  );
}
