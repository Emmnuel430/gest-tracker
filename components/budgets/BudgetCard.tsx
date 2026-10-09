'use client';

import React from 'react';
import { Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BudgetProgressItem } from '@/actions/budgets';
import { formatCurrency } from '@/constants/config';
import { CATEGORY_COLORS } from '@/constants/categories';

interface BudgetCardProps {
  budget: BudgetProgressItem;
  onEdit: (budget: BudgetProgressItem) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const catColor = CATEGORY_COLORS[budget.category] || '#2563EB';

  const isExceeded = budget.status === 'EXCEEDED';
  const isWarning = budget.status === 'WARNING';

  // Barre de progression plafonnée visuellement à 100%
  const visualPercentage = Math.min(budget.percentage, 100);

  // Thème de couleur de la jauge
  let progressColor = 'bg-[#10B981]'; // Vert néobrutaliste
  if (isExceeded) progressColor = 'bg-[#DC2626]'; // Rouge alerte
  else if (isWarning) progressColor = 'bg-[#F59E0B]'; // Orange avertissement

  return (
    <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] transition-all">
      {/* En-tête de la carte */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border-2 border-[#111827] dark:border-white shrink-0 shadow-[1px_1px_0px_0px_#111827]"
            style={{ backgroundColor: catColor }}
          />
          <h4 className="text-sm font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
            {budget.category}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Badge de statut */}
          {isExceeded ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FEF2F2] dark:bg-[#2C0B0E] text-[#DC2626] border-2 border-[#111827] dark:border-[#334155] rounded shadow-[1.5px_1.5px_0px_0px_#111827] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 stroke-3" />
              <span>DÉPASSÉ ({budget.percentage}%)</span>
            </span>
          ) : isWarning ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFFBEB] dark:bg-[#78350F] text-[#D97706] dark:text-[#FCD34D] border-2 border-[#111827] dark:border-[#334155] rounded shadow-[1.5px_1.5px_0px_0px_#111827] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 stroke-3" />
              <span>{budget.percentage}%</span>
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669] dark:text-[#6EE7B7] border-2 border-[#111827] dark:border-[#334155] rounded shadow-[1.5px_1.5px_0px_0px_#111827] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 stroke-3" />
              <span>{budget.percentage}%</span>
            </span>
          )}

          {/* Bouton Modifier */}
          <button
            type="button"
            onClick={() => onEdit(budget)}
            title="Modifier le budget"
            className="p-1 hover:bg-neutral-100 dark:hover:bg-[#0F172A] border border-transparent hover:border-[#111827] dark:hover:border-white rounded cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Bouton Supprimer */}
          <button
            type="button"
            onClick={() => onDelete(budget.id)}
            title="Supprimer le budget"
            className="p-1 hover:bg-[#FEF2F2] dark:hover:bg-[#2C0B0E] border border-transparent hover:border-[#DC2626] rounded cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
          </button>
        </div>
      </div>

      {/* Jauge de progression néobrutaliste (barre épaisse avec bordure noire) */}
      <div className="w-full h-4 bg-[#F3F4F6] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-full overflow-hidden mb-3 p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${visualPercentage}%` }}
        />
      </div>

      {/* Détails financiers chiffrés */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-200 dark:border-[#334155] text-xs">
        <div>
          <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
            Consommé
          </span>
          <span className="font-black text-[#111827] dark:text-[#F8FAFC]">
            {formatCurrency(budget.spent)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
            Plafond
          </span>
          <span className="font-black text-[#111827] dark:text-[#F8FAFC]">
            {formatCurrency(budget.amount)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
            {isExceeded ? 'Dépassement' : 'Disponible'}
          </span>
          <span
            className={`font-black ${
              isExceeded
                ? 'text-[#DC2626]'
                : isWarning
                ? 'text-[#D97706] dark:text-[#FBBF24]'
                : 'text-[#10B981]'
            }`}
          >
            {formatCurrency(Math.abs(budget.remaining))}
          </span>
        </div>
      </div>
    </div>
  );
}
