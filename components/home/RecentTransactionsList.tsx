import React from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/constants/config';
import { formatDisplayDate } from '@/lib/dates';
import { CATEGORY_COLORS } from '@/constants/categories';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Dernières opérations
        </h3>
        <Link
          href="/historique"
          className="text-xs font-black uppercase text-neutral-600 hover:text-black underline"
        >
          Tout voir ➔
        </Link>
      </div>

      <div className="space-y-2.5">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const catColor = CATEGORY_COLORS[tx.category] || '#000000';

          return (
            <div
              key={tx.id}
              className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-black leading-tight">
                      {tx.category}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-neutral-100 border border-black rounded">
                      {tx.payment}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-500">
                    {formatDisplayDate(tx.date, 'dd MMM')}
                    {tx.note ? ` • ${tx.note}` : ''}
                  </p>
                </div>
              </div>

              <span
                className={`font-black text-sm sm:text-base ${
                  isIncome ? 'text-[#008A50]' : 'text-[#FF3847]'
                }`}
              >
                {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
