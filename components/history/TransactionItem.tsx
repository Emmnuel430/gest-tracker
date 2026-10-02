'use client';

import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/constants/config';
import { formatDisplayDate, formatTime } from '@/lib/dates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import { deleteTransactionAction } from '@/actions/transactions';
import { PAYMENT_METHOD_THEMES } from '@/constants/payment-methods';
import { CATEGORY_COLORS } from '@/constants/categories';

interface TransactionItemProps {
  transaction: Transaction;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Transaction) => void;
}

export function TransactionItem({ transaction, onDeleted, onUpdated }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isIncome = transaction.type === 'INCOME';
  const paymentTheme = PAYMENT_METHOD_THEMES[transaction.payment] || {
    bg: '#EFF6FF',
    text: '#111827',
  };
  const catColor = CATEGORY_COLORS[transaction.category] || '#2563EB';

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteTransactionAction(transaction.id);
    setIsDeleting(false);
    setShowConfirm(false);
    if (res.success && onDeleted) {
      onDeleted(transaction.id);
    }
  };

  const handleUpdated = (updated: Transaction) => {
    if (onUpdated) {
      onUpdated(updated);
    }
  };

  return (
    <>
      <div className="bg-white border-2 border-[#111827] rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#111827] flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          {/* L'icône prend visuellement la couleur officielle du moyen de paiement (Section 3) */}
          <div
            className="w-10 h-10 border-2 border-[#111827] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0"
            style={{
              backgroundColor: paymentTheme.bg,
              color: paymentTheme.text,
            }}
            title={`Moyen de paiement : ${transaction.payment}`}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-5 h-5 stroke-3" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-3" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Badge Catégorie avec pastille couleur */}
              <span className="inline-flex items-center gap-1.5 font-black text-sm text-[#111827] leading-tight">
                <span
                  className="w-2 h-2 rounded-full border border-[#111827] shadow-[1px_1px_0px_0px_#111827]"
                  style={{ backgroundColor: catColor }}
                />
                {transaction.category}
              </span>

              {/* Badge Moyen de paiement aux couleurs PAYMENT_METHOD_THEMES */}
              <span
                className="text-[10px] font-black px-1.5 py-0.5 border border-[#111827] rounded shadow-[1px_1px_0px_0px_#111827]"
                style={{
                  backgroundColor: paymentTheme.bg,
                  color: paymentTheme.text,
                }}
              >
                {transaction.payment}
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
              {formatDisplayDate(transaction.date, 'dd MMM yyyy')} • {formatTime(transaction.date)}
              {transaction.note ? ` • ${transaction.note}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`font-black text-sm sm:text-base ${
              isIncome ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {isIncome ? '+' : '-'} {formatCurrency(Math.abs(Number(transaction.amount)))}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              title="Modifier"
              className="p-1.5 text-neutral-400 hover:text-[#111827] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              title="Supprimer"
              className="p-1.5 text-neutral-400 hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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

      <EditTransactionModal
        transaction={transaction}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={handleUpdated}
      />
    </>
  );
}
