'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';

interface TransactionItemProps {
  transaction: Transaction;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Transaction) => void;
}

export function TransactionItem({
  transaction,
  onDeleted,
  onUpdated,
}: TransactionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TransactionListItem
        transaction={transaction}
        onClick={() => setIsOpen(true)}
      />
      <TransactionDetailsModal
        transaction={transaction}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDeleted={onDeleted}
        onUpdated={onUpdated}
      />
    </>
  );
}
