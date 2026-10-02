'use client';

import React from 'react';
import { PaymentMethodBreakdown } from '@/types/statistics';
import { formatCurrency } from '@/constants/config';
import { Card } from '@/components/ui/Card';
import { CreditCard, Wallet, Smartphone, Landmark } from 'lucide-react';

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

  const getMethodBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'wave':
        return 'bg-[#00D1FF]';
      case 'orange money':
        return 'bg-[#FF7900] text-white';
      case 'espèces':
        return 'bg-[#00DF81]';
      case 'carte bancaire':
        return 'bg-[#9B51E0] text-white';
      default:
        return 'bg-[#FFDE59]';
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-black">
            Moyens de paiement
          </h3>
          <p className="text-[11px] font-medium text-neutral-500">
            Dépenses par canal de paiement
          </p>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-black rounded shadow-[1px_1px_0px_0px_#000]">
          {breakdown.length} canaux
        </span>
      </div>

      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.method} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span
                  className={`w-6 h-6 border border-black rounded flex items-center justify-center shadow-[1px_1px_0px_0px_#000] ${getMethodBadgeColor(
                    item.method
                  )}`}
                >
                  {getMethodIcon(item.method)}
                </span>
                <span className="text-black font-extrabold">{item.method}</span>
                <span className="text-[10px] font-semibold text-neutral-400">
                  ({item.count} op.)
                </span>
              </div>
              <div className="text-right">
                <span className="font-black text-black">{formatCurrency(item.total)}</span>
                <span className="text-[10px] font-bold text-neutral-500 ml-1.5">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Custom Neobrutalism Progress Bar */}
            <div className="w-full h-3 bg-neutral-100 border-2 border-black rounded-full overflow-hidden shadow-[1px_1px_0px_0px_#000]">
              <div
                className={`h-full border-r-2 border-black transition-all duration-300 ${getMethodBadgeColor(
                  item.method
                )}`}
                style={{ width: `${Math.max(item.percentage, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
