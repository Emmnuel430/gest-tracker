'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Bell, Check, ArrowRight, Zap, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RecurringRuleItem, processRecurringRuleAction } from '@/actions/recurring';
import { formatDayOfMonthLabel } from '@/lib/recurring';

interface RecurringAlertBannerProps {
  initialDueRules: RecurringRuleItem[];
  currentMonth: string;
}

export function RecurringAlertBanner({
  initialDueRules,
  currentMonth,
}: RecurringAlertBannerProps) {
  const [dueRules, setDueRules] = useState<RecurringRuleItem[]>(initialDueRules);
  const [isPending, startTransition] = useTransition();

  if (!dueRules || dueRules.length === 0) return null;

  const currentRule = dueRules[0]; // On affiche l'échéance la plus urgente

  const handleProcess = (ruleId: string, mode: 'CONFIRM' | 'SKIP') => {
    startTransition(async () => {
      const res = await processRecurringRuleAction(ruleId, mode);
      if (res.success) {
        setDueRules((prev) => prev.filter((r) => r.id !== ruleId));
      }
    });
  };

  return (
    <div className="mb-6 p-4 rounded-xl border-3 border-[#111827] dark:border-[#FFE600] bg-[#FFE600] text-[#111827] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#111827] text-white rounded-lg border-2 border-[#111827] shrink-0 mt-0.5">
            <Zap className="w-5 h-5 text-[#FFE600] fill-[#FFE600]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#111827] text-white px-2 py-0.5 rounded">
                Échéance du mois
              </span>
              {dueRules.length > 1 && (
                <span className="text-[11px] font-bold text-[#111827]/80">
                  +{dueRules.length - 1} autre(s)
                </span>
              )}
            </div>
            <h4 className="font-black text-sm text-[#111827]">
              {currentRule.category} &bull; {formatCurrency(currentRule.amount)} ({currentRule.payment})
            </h4>
            <p className="text-xs font-semibold text-[#111827]/80">
              Prévu {formatDayOfMonthLabel(currentRule.dayOfMonth).toLowerCase()}. Voulez-vous enregistrer cette opération ?
            </p>
          </div>
        </div>

        <Link
          href="/recurrences"
          className="text-xs font-black uppercase underline hover:no-underline shrink-0 text-[#111827] flex items-center gap-0.5"
        >
          Voir tout <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-[#111827]/20">
        <button
          type="button"
          onClick={() => handleProcess(currentRule.id, 'CONFIRM')}
          disabled={isPending}
          className="flex-1 py-2 px-3 bg-[#111827] hover:bg-black text-white font-black text-xs uppercase rounded-lg border-2 border-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-[#00DF81] stroke-3" />
          Confirmer l’opération
        </button>
        <button
          type="button"
          onClick={() => handleProcess(currentRule.id, 'SKIP')}
          disabled={isPending}
          className="py-2 px-3 bg-white/70 hover:bg-white text-[#111827] font-black text-xs uppercase rounded-lg border-2 border-[#111827] cursor-pointer transition-all disabled:opacity-50"
        >
          Ignorer ce mois
        </button>
      </div>
    </div>
  );
}
