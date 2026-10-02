'use client';

import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/constants/config';
import { formatDisplayDate, formatTime } from '@/lib/dates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteTransactionAction } from '@/actions/transactions';

interface TransactionItemProps {
  transaction: Transaction;
  onDeleted?: (id: string) => void;
}

export function TransactionItem({ transaction, onDeleted }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isIncome = transaction.type === 'INCOME';

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteTransactionAction(transaction.id);
    setIsDeleting(false);
    setShowConfirm(false);
    if (res.success && onDeleted) {
      onDeleted(transaction.id);
    }
  };

  return (
    <>
      <div className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 border-2 border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_#000] ${
              isIncome ? 'bg-[#00DF81]' : 'bg-[#FFEAEB]'
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-5 h-5 text-black stroke-[3]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-[#FF3847] stroke-[3]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm text-black leading-tight">
                {transaction.category}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-neutral-100 border border-black rounded">
                {transaction.payment}
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-500">
              {formatDisplayDate(transaction.date, 'dd MMM yyyy')} • {formatTime(transaction.date)}
              {transaction.note ? ` • ${transaction.note}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`font-black text-sm sm:text-base ${
              isIncome ? 'text-[#008A50]' : 'text-[#FF3847]'
            }`}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </span>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            title="Supprimer"
            className="p-1.5 text-neutral-400 hover:text-[#FF3847] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Supprimer la transaction"
        message={`Êtes-vous sûr de vouloir supprimer cette transaction de ${formatCurrency(
          transaction.amount
        )} (${transaction.category}) ? Cette action est irréversible.`}
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
