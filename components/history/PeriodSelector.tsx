'use client';

import React from 'react';
import { PeriodType } from '@/types/period';
import { cn } from '@/lib/utils';

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
}

export function PeriodSelector({
  currentPeriod,
  onSelectPeriod,
}: PeriodSelectorProps) {
  const periods: { key: PeriodType; label: string }[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' },
  ];

  return (
    <div className="w-full flex items-center justify-between p-1 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] gap-1">
      {periods.map((p) => {
        const isSelected = currentPeriod === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelectPeriod(p.key)}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none text-center',
              isSelected
                ? 'bg-[#FFDE59] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-black border-2 border-transparent'
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
