'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Wallet,
  PieChart,
  CalendarClock,
  HandCoins,
  BarChart3,
  Receipt,
  Download,
  ArrowRight,
} from 'lucide-react';
import { LANDING_CAPABILITIES } from '@/constants/landing';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Wallet,
  PieChart,
  CalendarClock,
  HandCoins,
  BarChart3,
  Receipt,
  Download,
};

export function CapabilitiesGrid() {
  return (
    <section id="fonctionnalites" className="space-y-8 max-w-5xl mx-auto scroll-mt-20">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#1E40AF] dark:text-[#BFDBFE] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827]">
          Clarté & Simplicité
        </span>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Ce que vous pouvez faire
        </h2>
        <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
          Toutes les opérations financières clés réunies en une seule interface percutante.
        </p>
      </div>

      {/* Grille de 8 tuiles orientées verbes d'action avec liens profonds vers /demo?tab=... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {LANDING_CAPABILITIES.map((cap) => {
          const IconComp = iconMap[cap.iconName] || Zap;
          const href = cap.demoTab ? `/demo?tab=${cap.demoTab}` : '/demo';

          return (
            <Link
              key={cap.id}
              href={href}
              className="group p-4 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#111827] transition-all flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="space-y-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]"
                  style={{ backgroundColor: cap.color }}
                >
                  <IconComp className="w-5 h-5 text-[#111827] stroke-2.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                    {cap.verbTitle}
                  </h3>
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                    {cap.benefit}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-[#334155] flex items-center justify-between text-[11px] font-black uppercase text-[#2563EB] dark:text-[#60A5FA]">
                <span>Explorer en démo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
