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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border-2 border-[#111827] rounded-lg p-2.5 shadow-[3px_3px_0px_0px_#111827]">
          <p className="font-black text-xs uppercase text-[#111827]">{d.name}</p>
          <p className="font-extrabold text-sm text-[#DC2626]">{formatCurrency(d.total)}</p>
          <p className="text-[10px] font-bold text-neutral-500">{d.percentage}% des dépenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-[#111827]">
            Répartition par catégorie
          </h3>
          <p className="text-[11px] font-medium text-neutral-500">
            Top postes de dépenses
          </p>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DBEAFE] text-[#111827] border border-[#111827] rounded shadow-[1px_1px_0px_0px_#111827]">
          Graphique
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#111827"
              fontSize={10}
              tickLine={{ stroke: '#111827', strokeWidth: 1.5 }}
              axisLine={{ stroke: '#111827', strokeWidth: 2 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              tick={{ fontWeight: 800 }}
            />
            <YAxis
              stroke="#111827"
              fontSize={9}
              tickLine={{ stroke: '#111827', strokeWidth: 1.5 }}
              axisLine={{ stroke: '#111827', strokeWidth: 2 }}
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
