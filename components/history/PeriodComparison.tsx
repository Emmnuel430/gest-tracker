"use client";

import React, { useMemo } from "react";
import { Transaction } from "@/types/transaction";
import { PeriodType, DateRange } from "@/types/period";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/constants/config";
import { getPreviousDateRange, formatDisplayDate } from "@/lib/dates";
import { comparePeriods } from "@/lib/statistics";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

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
  const comparisonData = useMemo(() => {
    const previousRange = getPreviousDateRange(period, currentRange);

    const currentExpenses = transactions.filter((tx) => {
      if (tx.type !== "EXPENSE") return false;
      const d = new Date(tx.date);
      return d >= currentRange.from && d <= currentRange.to;
    });

    const previousExpenses = transactions.filter((tx) => {
      if (tx.type !== "EXPENSE") return false;
      const d = new Date(tx.date);
      return d >= previousRange.from && d <= previousRange.to;
    });

    const currentTotal = currentExpenses.reduce((acc, t) => acc + t.amount, 0);
    const previousTotal = previousExpenses.reduce(
      (acc, t) => acc + t.amount,
      0,
    );

    const comparison = comparePeriods(currentTotal, previousTotal);

    // Grouping by category for both periods
    const categoryMap = new Map<
      string,
      { current: number; previous: number }
    >();

    for (const tx of currentExpenses) {
      const existing = categoryMap.get(tx.category) || {
        current: 0,
        previous: 0,
      };
      categoryMap.set(tx.category, {
        ...existing,
        current: existing.current + tx.amount,
      });
    }

    for (const tx of previousExpenses) {
      const existing = categoryMap.get(tx.category) || {
        current: 0,
        previous: 0,
      };
      categoryMap.set(tx.category, {
        ...existing,
        previous: existing.previous + tx.amount,
      });
    }

    const categories = Array.from(categoryMap.entries())
      .map(([cat, val]) => ({
        category: cat,
        current: val.current,
        previous: val.previous,
        diff: val.current - val.previous,
      }))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 5); // Top 5 categories with highest divergence

    return {
      previousRange,
      currentTotal,
      previousTotal,
      comparison,
      categories,
    };
  }, [transactions, period, currentRange]);

  const { previousRange, currentTotal, previousTotal, comparison, categories } =
    comparisonData;

  const isMoreExpensive = comparison.difference > 0;
  const isLessExpensive = comparison.difference < 0;

  return (
    <Card className="p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-black">
            Comparaison vs Période précédente
          </h3>
          <p className="text-[11px] font-medium text-neutral-500">
            {formatDisplayDate(previousRange.from, "dd MMM")} -{" "}
            {formatDisplayDate(previousRange.to, "dd MMM yyyy")}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 ${
            isMoreExpensive
              ? "bg-[#FFEAEB] text-[#FF3847]"
              : isLessExpensive
                ? "bg-[#E6F9F0] text-[#008A50]"
                : "bg-neutral-100 text-black"
          }`}
        >
          {isMoreExpensive ? (
            <TrendingUp className="w-3.5 h-3.5 stroke-3" />
          ) : isLessExpensive ? (
            <TrendingDown className="w-3.5 h-3.5 stroke-3" />
          ) : (
            <Minus className="w-3.5 h-3.5 stroke-3" />
          )}
          {comparison.difference > 0 ? "+" : ""}
          {comparison.percentageChange}%
        </span>
      </div>

      {/* Main Totals Comparison */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
        <div>
          <p className="text-[10px] font-black uppercase text-neutral-500">
            Période précédente
          </p>
          <p className="font-extrabold text-xs sm:text-sm text-neutral-700">
            {formatCurrency(previousTotal)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-neutral-500">
            Période actuelle
          </p>
          <p
            className={`font-black text-xs sm:text-sm ${
              isMoreExpensive ? "text-[#FF3847]" : "text-black"
            }`}
          >
            {formatCurrency(currentTotal)}
          </p>
        </div>
      </div>

      {/* Explication textuelle claire (Section 35 & 36) */}
      <div className="text-xs font-bold text-neutral-700 bg-white border border-black/40 rounded-lg p-2.5">
        {previousTotal === 0 ? (
          <p>
            Aucune dépense enregistrée sur la période précédente pour comparer.
          </p>
        ) : isMoreExpensive ? (
          <p className="text-[#FF3847]">
            ⚠️ Vos dépenses ont augmenté de{" "}
            <span className="font-black">
              {formatCurrency(comparison.difference)}
            </span>{" "}
            (+
            {comparison.percentageChange}%) par rapport à la période précédente.
          </p>
        ) : isLessExpensive ? (
          <p className="text-[#008A50]">
            👏 Vos dépenses ont diminué de{" "}
            <span className="font-black">
              {formatCurrency(Math.abs(comparison.difference))}
            </span>{" "}
            ({comparison.percentageChange}%) par rapport à la période
            précédente.
          </p>
        ) : (
          <p>
            Vos dépenses sont rigoureusement identiques à la période précédente.
          </p>
        )}
      </div>

      {/* Top variations par catégorie */}
      {categories.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
            Évolution par catégorie
          </p>
          <div className="space-y-1.5">
            {categories.map((c) => {
              const diffPositive = c.diff > 0;
              return (
                <div
                  key={c.category}
                  className="flex items-center justify-between text-xs py-1 px-2 bg-white border border-black rounded-lg"
                >
                  <span className="font-bold text-black">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-[11px]">
                      {formatCurrency(c.previous)}{" "}
                      <ArrowRight className="inline w-3 h-3" />{" "}
                      {formatCurrency(c.current)}
                    </span>
                    <span
                      className={`font-black text-xs min-w-[70px] text-right ${
                        diffPositive ? "text-[#FF3847]" : "text-[#008A50]"
                      }`}
                    >
                      {diffPositive ? "+" : ""}
                      {formatCurrency(c.diff)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
