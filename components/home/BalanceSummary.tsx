import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { FinancialSummary } from '@/types/statistics';

interface BalanceSummaryProps {
  summary: FinancialSummary;
}

export function BalanceSummary({ summary }: BalanceSummaryProps) {
  const isPositiveBalance = summary.balance >= 0;

  return (
    <div className="w-full space-y-4">
      {/* Carte Principale du Solde */}
      <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0px_0px_#000] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-600 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-black" />
            Solde Disponible
          </span>
          <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-[#FFDE59] border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000]">
            Mois en cours
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isPositiveBalance ? 'text-black' : 'text-[#FF5964]'
            }`}
          >
            {formatCurrency(summary.balance)}
          </h2>
        </div>
      </div>

      {/* Cartes Miniatures : Revenus et Dépenses du mois */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Revenus du mois */}
        <div className="bg-[#E1FCEF] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1.5">
            <div className="w-5 h-5 bg-[#00DF81] border border-black rounded-md flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5 text-black stroke-[3]" />
            </div>
            <span>Revenus</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-black truncate">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        {/* Dépenses du mois */}
        <div className="bg-[#FFEAEB] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1.5">
            <div className="w-5 h-5 bg-[#FF5964] border border-black rounded-md flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <span>Dépenses</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-[#FF3847] truncate">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>
    </div>
  );
}
