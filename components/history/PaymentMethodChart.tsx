'use client';

import React from 'react';
import { PaymentMethodBreakdown } from '@/types/statistics';
import { formatCurrency } from '@/constants/config';
import { Card } from '@/components/ui/Card';
import { CreditCard, Wallet, Smartphone, Landmark } from 'lucide-react';
import { PAYMENT_METHOD_THEMES } from '@/constants/payment-methods';

interface PaymentMethodChartProps {
  breakdown: PaymentMethodBreakdown[];
}

export function PaymentMethodChart({ breakdown }: PaymentMethodChartProps) {
  if (breakdown.length === 0) return null;

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'wave':
      case 'orange money':
        return <Smartphone className="w-4 h-4 stroke-[2.5]" />;
      case 'espèces':
        return <Wallet className="w-4 h-4 stroke-[2.5]" />;
      case 'carte bancaire':
        return <CreditCard className="w-4 h-4 stroke-[2.5]" />;
      default:
        return <Landmark className="w-4 h-4 stroke-[2.5]" />;
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
            Moyens de paiement
          </h3>
          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Dépenses par canal de paiement
          </p>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white border border-[#111827] dark:border-white rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]">
          {breakdown.length} canaux
        </span>
      </div>

      <div className="space-y-3">
        {breakdown.map((item) => {
          const theme = PAYMENT_METHOD_THEMES[item.method] || {
            bg: '#EFF6FF',
            text: '#111827',
          };

          return (
            <div key={item.method} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className="w-6 h-6 border border-[#111827] dark:border-white rounded flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
                    style={{ backgroundColor: theme.bg, color: theme.text }}
                  >
                    {getMethodIcon(item.method)}
                  </span>
                  <span className="text-[#111827] dark:text-[#F8FAFC] font-extrabold">{item.method}</span>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                    ({item.count} op.)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#111827] dark:text-[#F8FAFC]">{formatCurrency(item.total)}</span>
                  <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 ml-1.5">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Barre de progression avec la couleur du moyen de paiement */}
              <div className="w-full h-3 bg-neutral-100 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-full overflow-hidden shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]">
                <div
                  className="h-full border-r-2 border-[#111827] dark:border-white transition-all duration-300"
                  style={{
                    width: `${Math.max(item.percentage, 3)}%`,
                    backgroundColor: theme.bg,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
