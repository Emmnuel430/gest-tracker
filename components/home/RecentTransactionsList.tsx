'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full mt-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] text-center">
        <div className="w-12 h-12 bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD] border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_#111827]">
          <Sparkles className="w-6 h-6 stroke-3" />
        </div>
        <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
          Bienvenue sur GEST TRACKER !
        </h3>
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Votre coffre personnel est prêt. Enregistrez votre premier revenu ou votre première dépense pour initialiser votre solde et démarrer votre suivi.
        </p>
      </div>
    );
  }

  const handleDeleted = () => {
    setSelectedTransaction(null);
    router.refresh();
  };

  const handleUpdated = () => {
    setSelectedTransaction(null);
    router.refresh();
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
          Dernières opérations
        </h3>
        <Link
          href="/historique"
          className="text-xs font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1"
        >
          Tout voir
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {transactions.map((tx) => (
          <TransactionListItem
            key={tx.id}
            transaction={tx}
            onClick={(clickedTx) => setSelectedTransaction(clickedTx)}
          />
        ))}
      </div>

      {/* Modal unique de détail des opérations pour l'accueil */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
