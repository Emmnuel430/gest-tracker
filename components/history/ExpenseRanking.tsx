import React from 'react';
import { CategoryBreakdown } from '@/types/statistics';
import { formatCurrency } from '@/constants/config';

interface ExpenseRankingProps {
  breakdown: CategoryBreakdown[];
  type?: 'INCOME' | 'EXPENSE';
}

export function ExpenseRanking({ breakdown, type = 'EXPENSE' }: ExpenseRankingProps) {
  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  const isIncome = type === 'INCOME';
  // Limiter au top 5 des catégories
  const topCategories = breakdown.slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] w-full">
      <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC] mb-3">
        {isIncome ? "Top Catégories d'Entrées" : 'Top Catégories de Dépenses'}
      </h3>

      <div className="space-y-3">
        {topCategories.map((item, index) => (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1.5 text-[#111827] dark:text-[#F8FAFC]">
                <span className="w-4 h-4 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-[10px] flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400 font-bold">{item.percentage}%</span>
                <span className="text-[#111827] dark:text-white font-black">{formatCurrency(item.total)}</span>
              </div>
            </div>

            {/* Barre de progression néobrutaliste */}
            <div className="w-full h-3 bg-neutral-100 dark:bg-[#131C31] border border-[#111827] dark:border-[#334155] rounded-md overflow-hidden p-0.5">
              <div
                className="h-full rounded-xs transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(5, item.percentage))}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ExpenseRanking as CategoryRanking };
