'use client';

import React, { useTransition } from 'react';
import { Calendar, Edit2, Trash2, Power, CheckCircle, Clock } from 'lucide-react';
import { CATEGORY_COLORS } from '@/constants/categories';
import { PAYMENT_METHOD_THEMES } from '@/constants/payment-methods';
import { formatCurrency } from '@/lib/utils';
import {
  RecurringRuleItem,
  toggleRecurringRuleStatusAction,
  deleteRecurringRuleAction,
  processRecurringRuleAction,
} from '@/actions/recurring';

interface RecurringCardProps {
  rule: RecurringRuleItem;
  currentMonth: string;
  onEdit: (rule: RecurringRuleItem) => void;
  onRefresh: () => void;
}

export function RecurringCard({ rule, currentMonth, onEdit, onRefresh }: RecurringCardProps) {
  const [isPending, startTransition] = useTransition();

  const isDueThisMonth = rule.isActive && rule.lastProcessedMonth !== currentMonth;
  const catColor = CATEGORY_COLORS[rule.category] || '#2563EB';
  const paymentTheme = PAYMENT_METHOD_THEMES[rule.payment] || { bg: '#E0E0E0', text: '#000000' };

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleRecurringRuleStatusAction(rule.id);
      if (res.success) onRefresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement la règle récurrente "${rule.category}" ?`)) return;
    startTransition(async () => {
      const res = await deleteRecurringRuleAction(rule.id);
      if (res.success) onRefresh();
    });
  };

  const handleProcess = (mode: 'CONFIRM' | 'SKIP') => {
    startTransition(async () => {
      const res = await processRecurringRuleAction(rule.id, mode);
      if (res.success) onRefresh();
    });
  };

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        rule.isActive
          ? 'bg-white dark:bg-[#1E293B] border-[#111827] dark:border-[#334155] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]'
          : 'bg-neutral-100 dark:bg-[#0F172A]/70 border-dashed border-neutral-400 dark:border-neutral-700 opacity-70'
      }`}
    >
      {/* Header carte */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="w-3 h-3 rounded-full border border-[#111827]"
            style={{ backgroundColor: catColor }}
          />
          <h4 className="font-black text-sm text-[#111827] dark:text-[#F8FAFC]">
            {rule.category}
          </h4>
          <span
            className={`px-1.5 py-0.5 text-[10px] font-black uppercase rounded border border-[#111827] ${
              rule.type === 'EXPENSE'
                ? 'bg-[#FF3366] text-white'
                : 'bg-[#00DF81] text-[#111827]'
            }`}
          >
            {rule.type === 'EXPENSE' ? 'Dépense' : 'Revenu'}
          </span>
        </div>

        {/* Boutons actions rapides */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            title={rule.isActive ? 'Mettre en pause' : 'Réactiver'}
            className={`p-1 rounded-lg border border-[#111827] transition-all cursor-pointer ${
              rule.isActive
                ? 'bg-[#00DF81] text-[#111827] hover:bg-emerald-300'
                : 'bg-neutral-300 text-neutral-600 hover:bg-neutral-400'
            }`}
          >
            <Power className="w-3.5 h-3.5 stroke-2.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(rule)}
            disabled={isPending}
            title="Modifier"
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] text-[#111827] dark:text-[#F8FAFC] transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            title="Supprimer"
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-red-500 hover:text-white text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
        </div>
      </div>

      {/* Montant & Note */}
      <div className="mb-3">
        <div className="text-xl font-black text-[#111827] dark:text-[#F8FAFC]">
          {rule.type === 'EXPENSE' ? '-' : '+'}
          {formatCurrency(rule.amount)}
        </div>
        {rule.note && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium italic mt-0.5">
            « {rule.note} »
          </p>
        )}
      </div>

      {/* Badges métadonnées */}
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-3">
        <span className="flex items-center gap-1 bg-neutral-100 dark:bg-[#131C31] px-2 py-0.5 rounded border border-[#111827] dark:border-[#334155]">
          <Calendar className="w-3 h-3 text-[#111827] dark:text-neutral-300" />
          Le {rule.dayOfMonth} du mois
        </span>
        <span
          className="px-2 py-0.5 rounded border border-[#111827]"
          style={{ backgroundColor: paymentTheme.bg, color: paymentTheme.text }}
        >
          {rule.payment}
        </span>
      </div>

      {/* Statut Échéance du mois */}
      {rule.isActive ? (
        isDueThisMonth ? (
          <div className="p-2.5 bg-[#FFFBEB] dark:bg-[#78350F]/25 border-2 border-[#F59E0B] rounded-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black uppercase text-[#B45309] dark:text-[#FBBF24] flex items-center gap-1">
                <Clock className="w-3 h-3 stroke-2.5" />
                En attente pour {currentMonth}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleProcess('CONFIRM')}
                disabled={isPending}
                className="flex-1 py-1.5 px-2 bg-[#00DF81] text-[#111827] hover:bg-emerald-300 border-2 border-[#111827] rounded-md text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827]"
              >
                <CheckCircle className="w-3 h-3 stroke-2.5" />
                Confirmer l’opération
              </button>
              <button
                type="button"
                onClick={() => handleProcess('SKIP')}
                disabled={isPending}
                className="py-1.5 px-2 bg-neutral-200 dark:bg-[#334155] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 border-2 border-[#111827] rounded-md text-[11px] font-black uppercase cursor-pointer transition-all"
              >
                Ignorer
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Échéance de ce mois déjà traitée
          </div>
        )
      ) : (
        <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 italic pt-1">
          Règle en pause (aucun rappel généré)
        </div>
      )}
    </div>
  );
}
