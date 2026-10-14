import React from 'react';
import { Lightbulb } from 'lucide-react';
import { FinancialInsight } from '@/lib/insights';
import { InsightsCarousel } from './InsightsCarousel';

interface FinancialInsightsCardProps {
  insights: FinancialInsight[];
}

export function FinancialInsightsCard({ insights }: FinancialInsightsCardProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="w-full p-4 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
      {/* Header Néobrutaliste */}
      <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-200 dark:border-[#334155]">
        <div className="p-1.5 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-lg shadow-[1px_1px_0px_0px_#111827]">
          <Lightbulb className="w-4 h-4 stroke-2.5" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
          Bilan & Conseils Financiers
        </h3>
      </div>

      {/* Carrousel interactif des conseils */}
      <InsightsCarousel insights={insights} />
    </div>
  );
}
