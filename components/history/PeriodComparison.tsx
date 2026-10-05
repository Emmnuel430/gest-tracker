'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { PeriodType, DateRange } from '@/types/period';
import { formatCurrency } from '@/constants/config';
import { getPreviousDateRange, formatDisplayDate } from '@/lib/dates';
import { buildPeriodComparison } from '@/lib/comparisons';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles } from 'lucide-react';

interface PeriodComparisonProps {
  transactions: Transaction[];
  period: PeriodType;
  currentRange: DateRange;
}

export function PeriodComparison({
  transactions,
  period,
  currentRange,
}: PeriodComparisonProps) {
  const previousRange = useMemo(() => {
    return getPreviousDateRange(period, currentRange);
  }, [period, currentRange]);

  const comparisonData = useMemo(() => {
    const currentExpenses = transactions.filter((tx) => {
      if (tx.type !== 'EXPENSE') return false;
      const d = new Date(tx.date);
      return d >= currentRange.from && d <= currentRange.to;
    });

    const previousExpenses = transactions.filter((tx) => {
      if (tx.type !== 'EXPENSE') return false;
      const d = new Date(tx.date);
      return d >= previousRange.from && d <= previousRange.to;
    });

    return buildPeriodComparison(currentExpenses, previousExpenses);
  }, [transactions, currentRange, previousRange]);

  const {
    currentTotal,
    previousTotal,
    difference,
    statusText,
    isNew,
    categoryComparisons,
    paymentComparisons,
  } = comparisonData;

  const isMoreExpensive = difference > 0;
  const isLessExpensive = difference < 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Résumé Global Comparatif (Section 5.3) */}
      <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
              Comparatif vs Période précédente
            </h3>
            <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
              Réf : {formatDisplayDate(previousRange.from, 'dd MMM')} → {formatDisplayDate(previousRange.to, 'dd MMM yyyy')}
            </p>
          </div>

          <span
            className={`px-2.5 py-1 border-2 border-[#111827] dark:border-white rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5 ${
              isNew
                ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                : isMoreExpensive
                ? 'bg-[#FEF2F2] text-[#DC2626]'
                : isLessExpensive
                ? 'bg-[#F0FDF4] text-[#16A34A]'
                : 'bg-neutral-100 text-[#111827]'
            }`}
          >
            {isNew ? (
              <Sparkles className="w-3.5 h-3.5 stroke-2.5" />
            ) : isMoreExpensive ? (
              <TrendingUp className="w-3.5 h-3.5 stroke-3" />
            ) : isLessExpensive ? (
              <TrendingDown className="w-3.5 h-3.5 stroke-3" />
            ) : (
              <Minus className="w-3.5 h-3.5 stroke-3" />
            )}
            {statusText}
          </span>
        </div>

        {/* Comparaison des totaux */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              Période précédente
            </p>
            <p className="font-extrabold text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
              {formatCurrency(previousTotal)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              Période actuelle
            </p>
            <p
              className={`font-black text-sm sm:text-base ${
                isMoreExpensive ? 'text-[#DC2626]' : 'text-[#111827] dark:text-white'
              }`}
            >
              {formatCurrency(currentTotal)}
            </p>
          </div>
        </div>

        {/* Message d'interprétation contextuelle */}
        <div className="text-xs font-bold text-[#111827] dark:text-neutral-200 bg-white dark:bg-[#1E293B] border border-[#111827]/40 dark:border-[#334155] rounded-lg p-3">
          {previousTotal === 0 && currentTotal === 0 ? (
            <p>Aucune dépense enregistrée sur les deux périodes.</p>
          ) : previousTotal === 0 ? (
            <p className="text-[#2563EB] dark:text-[#60A5FA]">
              ✨ Première activité enregistrée sur cette période : {formatCurrency(currentTotal)}.
            </p>
          ) : isMoreExpensive ? (
            <p className="text-[#DC2626]">
              ⚠️ Vos dépenses ont augmenté de <span className="font-black">{formatCurrency(difference)}</span> ({statusText}) par rapport à la période précédente.
            </p>
          ) : isLessExpensive ? (
            <p className="text-[#16A34A]">
              👏 Vos dépenses ont diminué de <span className="font-black">{formatCurrency(Math.abs(difference))}</span> ({statusText}) par rapport à la période précédente.
            </p>
          ) : (
            <p>Vos dépenses sont rigoureusement identiques à la période précédente.</p>
          )}
        </div>
      </div>

      {/* 2. Comparatif par Catégorie (Section 5.1) */}
      <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
        <h4 className="font-black text-xs uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
          Comparaison par catégorie
        </h4>

        {categoryComparisons.length === 0 ? (
          <p className="text-xs text-neutral-500 font-medium italic">
            Aucune dépense catégorisée à comparer.
          </p>
        ) : (
          <div className="space-y-2">
            {categoryComparisons.map((cat) => {
              const diffPositive = cat.difference > 0;
              return (
                <div
                  key={cat.category}
                  className="p-3 bg-[#F8FAFC] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-[#111827] dark:border-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-black text-xs text-[#111827] dark:text-[#F8FAFC]">
                        {cat.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-1">
                      <span>{formatCurrency(cat.previousAmount)}</span>
                      <ArrowRight className="w-3 h-3 inline text-neutral-400" />
                      <span className="text-[#111827] dark:text-white font-black">{formatCurrency(cat.currentAmount)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block font-black text-xs px-2 py-0.5 rounded border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] ${
                        cat.isNew
                          ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                          : diffPositive
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : cat.difference < 0
                          ? 'bg-[#F0FDF4] text-[#16A34A]'
                          : 'bg-neutral-100 text-[#111827]'
                      }`}
                    >
                      {cat.statusText}
                    </span>
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {cat.difference > 0 ? '+' : ''}{formatCurrency(cat.difference)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Comparatif par Moyen de Paiement (Section 5.2) */}
      <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
        <h4 className="font-black text-xs uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
          Comparaison par moyen de paiement
        </h4>

        {paymentComparisons.length === 0 ? (
          <p className="text-xs text-neutral-500 font-medium italic">
            Aucun moyen de paiement à comparer.
          </p>
        ) : (
          <div className="space-y-2">
            {paymentComparisons.map((pm) => {
              const diffPositive = pm.difference > 0;
              return (
                <div
                  key={pm.payment}
                  className="p-3 bg-[#F8FAFC] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
                >
                  <div>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 border border-[#111827] dark:border-white rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
                      style={{
                        backgroundColor: pm.theme.bg,
                        color: pm.theme.text,
                      }}
                    >
                      {pm.payment}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-1">
                      <span>{formatCurrency(pm.previousAmount)}</span>
                      <ArrowRight className="w-3 h-3 inline text-neutral-400" />
                      <span className="text-[#111827] dark:text-white font-black">{formatCurrency(pm.currentAmount)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block font-black text-xs px-2 py-0.5 rounded border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] ${
                        pm.isNew
                          ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                          : diffPositive
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : pm.difference < 0
                          ? 'bg-[#F0FDF4] text-[#16A34A]'
                          : 'bg-neutral-100 text-[#111827]'
                      }`}
                    >
                      {pm.statusText}
                    </span>
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {pm.difference > 0 ? '+' : ''}{formatCurrency(pm.difference)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
