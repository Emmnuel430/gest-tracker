"use client";

import React, { useRef, useEffect } from "react";
import { PeriodType } from "@/types/period";
import { cn } from "@/lib/utils";
import { Calendar, Search, AlertCircle } from "lucide-react";

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
  onApplyCustomRange?: () => void;
  isLoading?: boolean;
}

export function PeriodSelector({
  currentPeriod,
  onSelectPeriod,
  customStartDate = "",
  customEndDate = "",
  onCustomDateChange,
  onApplyCustomRange,
  isLoading = false,
}: PeriodSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Section 2.1 : Remplacement officiel de 'Jour' par 'Aujourd'hui'
  const periods: { key: PeriodType; label: string }[] = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "Semaine" },
    { key: "month", label: "Mois" },
    { key: "year", label: "Année" },
    { key: "custom", label: "Personnalisé" },
  ];

  // Section 3 : Scroll automatique afin que la période active soit toujours visible
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentPeriod]);

  // Section 7 : Validation date de fin >= date de début
  const isInvalidRange =
    customStartDate &&
    customEndDate &&
    new Date(customEndDate) < new Date(customStartDate);

  return (
    <div className="w-full space-y-3">
      {/* Barre de sélection de période avec scroll horizontal fluide */}
      <div
        ref={containerRef}
        className="w-full flex items-center p-1.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] gap-1.5 overflow-x-auto scrollbar-none"
      >
        {periods.map((p) => {
          const isSelected = currentPeriod === p.key;
          return (
            <button
              key={p.key}
              ref={isSelected ? activeBtnRef : undefined}
              type="button"
              onClick={() => onSelectPeriod(p.key)}
              className={cn(
                "flex-1 shrink-0 min-w-fit py-2 px-3.5 sm:px-4 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer select-none inline-flex items-center justify-center whitespace-nowrap",
                isSelected
                  ? "bg-[#2563EB] text-white border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] -translate-y-0.5"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-[#EFF6FF] dark:hover:bg-[#131C31] hover:text-[#111827] dark:hover:text-white border-2 border-transparent",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Panneau Date Début / Date Fin si Option Personnalisé active (Section 7) */}
      {currentPeriod === "custom" && (
        <div className="p-3.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs font-black uppercase text-[#2563EB] dark:text-[#60A5FA]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Plage personnalisée</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-300 mb-1">
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
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-white dark:focus:bg-[#1E293B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-300 mb-1">
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
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-white dark:focus:bg-[#1E293B]"
              />
            </div>
          </div>

          {/* Validation d'erreur Section 7 */}
          {isInvalidRange && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
              <AlertCircle className="w-3.5 h-3.5 stroke-2.5" />
              <span>
                La date de fin doit être supérieure ou égale à la date de début.
              </span>
            </div>
          )}

          {/* Bouton pour lancer la requête sur la plage personnalisée */}
          <div className="mt-3">
            <button
              type="button"
              onClick={onApplyCustomRange}
              disabled={isLoading || Boolean(isInvalidRange)}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs uppercase rounded-lg border-2 border-[#111827] dark:border-[#334155] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5 stroke-3" />
              <span>
                {isLoading
                  ? "Chargement des opérations..."
                  : "Appliquer la plage personnalisée"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
