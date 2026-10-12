import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, Info } from 'lucide-react';
import { FinancialInsight } from '@/lib/insights';

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

      {/* Liste des observations */}
      <div className="space-y-2.5">
        {insights.map((insight) => {
          let badgeBg = 'bg-blue-100 text-blue-900 border-blue-500';
          let icon = <Info className="w-3.5 h-3.5 stroke-2.5 shrink-0" />;

          if (insight.severity === 'danger') {
            badgeBg = 'bg-[#FEE2E2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#FCA5A5] border-[#EF4444]';
            icon = <AlertTriangle className="w-3.5 h-3.5 stroke-2.5 text-[#DC2626] shrink-0" />;
          } else if (insight.severity === 'warning') {
            badgeBg = 'bg-[#FEF3C7] dark:bg-[#78350F]/30 text-[#92400E] dark:text-[#FCD34D] border-[#F59E0B]';
            icon = <TrendingUp className="w-3.5 h-3.5 stroke-2.5 text-[#D97706] shrink-0" />;
          } else if (insight.severity === 'success') {
            badgeBg = 'bg-[#DCFCE7] dark:bg-[#064E3B]/30 text-[#166534] dark:text-[#86EFAC] border-[#22C55E]';
            icon = <Sparkles className="w-3.5 h-3.5 stroke-2.5 text-[#16A34A] shrink-0" />;
          }

          return (
            <div
              key={insight.id}
              className={`p-3 rounded-xl border-2 ${badgeBg} transition-all`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{icon}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black uppercase tracking-tight">
                    {insight.title}
                  </h4>
                  <p className="text-xs font-medium opacity-90 mt-0.5 leading-snug">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
