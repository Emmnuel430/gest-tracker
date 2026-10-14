'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { CategoryBreakdown } from '@/types/statistics';
import { formatCurrency } from '@/constants/config';
import { Card } from '@/components/ui/Card';

interface ExpenseChartProps {
  data: CategoryBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      total: number;
      percentage: number;
      color: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
        <p className="font-black text-xs uppercase text-[#111827] dark:text-[#F8FAFC]">{d.name}</p>
        <p className="font-extrabold text-sm text-[#DC2626]">{formatCurrency(d.total)}</p>
        <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">{d.percentage}% des dépenses</p>
      </div>
    );
  }
  return null;
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || data.length === 0) {
    return null;
  }

  // Ne garder que le top 6 pour que le graphique reste hyper lisible
  const chartData = data.slice(0, 6).map((item) => ({
    name: item.category,
    total: item.total,
    percentage: item.percentage,
    color: item.color,
  }));

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
            Répartition par catégorie
          </h3>
          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Top postes de dépenses
          </p>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white border border-[#111827] dark:border-white rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]">
          Graphique
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={10}
              tickLine={{ stroke: '#64748B', strokeWidth: 1.5 }}
              axisLine={{ stroke: '#64748B', strokeWidth: 2 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              tick={{ fontWeight: 800 }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={9}
              tickLine={{ stroke: '#64748B', strokeWidth: 1.5 }}
              axisLine={{ stroke: '#64748B', strokeWidth: 2 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontWeight: 800 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} />
            <Bar dataKey="total" stroke="#111827" strokeWidth={2} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
