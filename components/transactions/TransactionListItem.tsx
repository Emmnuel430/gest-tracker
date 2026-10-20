'use client';

import React from 'react';
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/constants/config';
import { formatDisplayDate, formatTime } from '@/lib/dates';
import { useCategories } from '@/components/providers/ReferenceDataProvider';

interface TransactionListItemProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
}

export function TransactionListItem({
  transaction,
  onClick,
}: TransactionListItemProps) {
  const { getCategoryColor } = useCategories();

  const isIncome = transaction.type === 'INCOME';
  const isTransfer = transaction.type === 'TRANSFER';
  const catColor = isTransfer ? '#2563EB' : getCategoryColor(transaction.category);

  // Construction du libellé pour l'accessibilité vocale (aria-label)
  const typeLabel = isIncome
    ? 'entrée'
    : isTransfer
    ? 'virement interne'
    : 'dépense';
  const displayCategory = isTransfer ? 'Virement interne' : transaction.category;
  const formattedDate = `${formatDisplayDate(transaction.date, 'dd/MM/yyyy')} à ${formatTime(transaction.date)}`;
  const ariaLabel = `Voir le détail : ${displayCategory}, ${typeLabel} de ${formatCurrency(transaction.amount)}, le ${formattedDate}`;

  return (
    <button
      type="button"
      onClick={() => onClick(transaction)}
      aria-label={ariaLabel}
      className="w-full text-left bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3 sm:p-3.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer group"
    >
      {/* Partie gauche : Icône + Informations standardisées */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Logo / Icône du type d'opération */}
        <div
          className={`w-9 h-9 border-2 border-[#111827] dark:border-white rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] shrink-0 ${
            isIncome
              ? 'bg-[#16A34A] text-white'
              : isTransfer
              ? 'bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD]'
              : 'bg-[#FEF2F2] dark:bg-[#2C0B0E] text-[#DC2626]'
          }`}
        >
          {isIncome ? (
            <ArrowDownLeft className="w-5 h-5 stroke-3 text-white" />
          ) : isTransfer ? (
            <ArrowRightLeft className="w-5 h-5 stroke-3" />
          ) : (
            <ArrowUpRight className="w-5 h-5 stroke-3 text-[#DC2626]" />
          )}
        </div>

        {/* Détails : Catégorie (pastille + nom) et Jour & Heure */}
        <div className="min-w-0 flex-1">
          {/* Ligne 1 : Catégorie avec pastille */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-[#111827] dark:text-[#F8FAFC]">
              <span
                className="w-2 h-2 rounded-full border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827] shrink-0"
                style={{ backgroundColor: catColor }}
              />
              <span className="truncate">{displayCategory}</span>
            </span>
          </div>

          {/* Ligne 2 : Jour et Heure */}
          <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
            {formatDisplayDate(transaction.date, 'dd MMM yyyy')} · {formatTime(transaction.date)}
          </p>
        </div>
      </div>

      {/* Partie droite : Montant */}
      <div className="shrink-0 ml-2">
        <span
          className={`font-black text-sm sm:text-base whitespace-nowrap ${
            isIncome
              ? 'text-[#16A34A]'
              : isTransfer
              ? 'text-[#111827] dark:text-[#F8FAFC]'
              : 'text-[#DC2626]'
          }`}
        >
          {isIncome ? '+ ' : isTransfer ? '' : '- '}
          {formatCurrency(Math.abs(Number(transaction.amount)))}
        </span>
      </div>
    </button>
  );
}
