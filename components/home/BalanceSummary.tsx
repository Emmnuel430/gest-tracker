'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Wallet, ChevronDown, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { FinancialSummary } from '@/types/statistics';

type HomePeriod = 'today' | 'month' | 'year';

interface BalanceSummaryProps {
  globalBalance: number;
  summaries: {
    today: FinancialSummary;
    month: FinancialSummary;
    year: FinancialSummary;
  };
}

export function BalanceSummary({ globalBalance, summaries }: BalanceSummaryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<HomePeriod>('month');

  const currentSummary = summaries[selectedPeriod] || summaries.month;
  const isPositiveGlobalBalance = globalBalance >= 0;

  const periodLabels: Record<HomePeriod, string> = {
    today: "Aujourd'hui",
    month: 'Mois en cours',
    year: 'Année en cours',
  };

  const isNetPositive = currentSummary.balance >= 0;

  return (
    <div className="w-full space-y-3.5">
      {/* 1. Carte Principale du Solde Total Disponible (Section 11) */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
            Solde Total Disponible
          </span>

          {/* Sélecteur de Période (Section 10.1) */}
          <div className="relative inline-flex items-center">
            <span className="text-[11px] font-black uppercase text-neutral-500 dark:text-neutral-400 mr-1.5 hidden sm:inline">
              Vue :
            </span>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as HomePeriod)}
                className="appearance-none bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white font-black text-xs uppercase pl-2.5 pr-7 py-1 border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] cursor-pointer focus:outline-none"
              >
                <option value="today">Aujourd'hui</option>
                <option value="month">Mois en cours</option>
                <option value="year">Année en cours</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-3 text-[#111827] dark:text-white" />
            </div>
          </div>
        </div>

        {/* Montant du Solde Global & Lien vers Portefeuilles */}
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isPositiveGlobalBalance
                ? 'text-[#111827] dark:text-[#F8FAFC]'
                : 'text-[#DC2626]'
            }`}
          >
            {formatCurrency(globalBalance)}
          </h2>
          <Link
            href="/portefeuilles"
            className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] flex items-center gap-1 transition-colors"
          >
            <span>Répartition comptes</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-2.5" />
          </Link>
        </div>
      </div>

      {/* 2. Cartes Miniatures : Entrées et Sorties de la période sélectionnée */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Entrées de la période */}
        <div className="bg-[#F0FDF4] dark:bg-[#062413] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] transition-colors">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#111827] dark:text-white mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#16A34A] border border-[#111827] dark:border-white rounded-md flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5 text-white stroke-3" />
              </div>
              <span>Entrées</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              ({periodLabels[selectedPeriod]})
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-[#16A34A] truncate">
            +{formatCurrency(currentSummary.totalIncome)}
          </p>
        </div>

        {/* Sorties de la période */}
        <div className="bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] transition-colors">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#111827] dark:text-white mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#DC2626] border border-[#111827] dark:border-white rounded-md flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-3" />
              </div>
              <span>Sorties</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              ({periodLabels[selectedPeriod]})
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-[#DC2626] truncate">
            -{formatCurrency(currentSummary.totalExpense)}
          </p>
        </div>
      </div>

      {/* 3. Synthèse du flux net de la période */}
      <div className="w-full text-center text-[11px] font-bold py-1.5 px-3 rounded-xl border-2 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-between">
        <span className="text-neutral-600 dark:text-neutral-400 uppercase text-[10px] font-black">
          Flux net ({periodLabels[selectedPeriod].toLowerCase()})
        </span>
        <span
          className={`font-black text-xs ${
            isNetPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}
        >
          {isNetPositive ? '+' : ''}
          {formatCurrency(currentSummary.balance)}
        </span>
      </div>
    </div>
  );
}
