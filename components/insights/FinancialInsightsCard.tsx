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
    <section
      aria-label="Bilan et conseils financiers"
      className="w-full p-3.5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-start gap-3 transition-colors"
    >
      {/* Icône Bilan fixe à gauche */}
      <div
        className="p-2 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-xl shadow-[2px_2px_0px_0px_#111827] shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <Lightbulb className="w-5 h-5 stroke-2.5" />
      </div>

      {/* Carrousel interactif des conseils à droite */}
      <div className="flex-1 min-w-0">
        <InsightsCarousel insights={insights} />
      </div>
    </section>
  );
}
