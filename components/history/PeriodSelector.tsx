'use client';

import React from 'react';
import { PeriodType } from '@/types/period';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export function PeriodSelector({
  currentPeriod,
  onSelectPeriod,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange,
}: PeriodSelectorProps) {
  const periods: { key: PeriodType; label: string }[] = [
    { key: 'today', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' },
    { key: 'custom', label: 'Personnalisé' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Barre de sélection de période */}
      <div className="w-full flex items-center justify-between p-1 bg-white border-2 border-[#111827] rounded-xl shadow-[3px_3px_0px_0px_#111827] gap-1 overflow-x-auto">
        {periods.map((p) => {
          const isSelected = currentPeriod === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelectPeriod(p.key)}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none text-center whitespace-nowrap',
                isSelected
                  ? 'bg-[#2563EB] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827] -translate-y-0.5'
                  : 'text-neutral-700 hover:bg-[#EFF6FF] hover:text-[#111827] border-2 border-transparent'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Panneau Date Début / Date Fin si Option Personnalisé active */}
      {currentPeriod === 'custom' && (
        <div className="p-3.5 bg-white border-2 border-[#111827] rounded-xl shadow-[3px_3px_0px_0px_#111827] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs font-black uppercase text-[#2563EB]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Plage personnalisée</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  if (onCustomDateChange) {
                    onCustomDateChange(e.target.value, customEndDate);
                  }
                }}
                className="w-full bg-[#EFF6FF] border-2 border-[#111827] rounded-lg p-2 text-xs font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827] focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  if (onCustomDateChange) {
                    onCustomDateChange(customStartDate, e.target.value);
                  }
                }}
                className="w-full bg-[#EFF6FF] border-2 border-[#111827] rounded-lg p-2 text-xs font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827] focus:outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
