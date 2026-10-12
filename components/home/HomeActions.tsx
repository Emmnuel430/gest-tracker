import React from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, History } from 'lucide-react';

export function HomeActions() {
  return (
    <div className="w-full space-y-3 sm:space-y-3.5 my-4 sm:my-5">
      {/* BOUTON ENTRANT */}
      <Link href="/entrant" className="block w-full group">
        <div className="w-full bg-[#16A34A] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#16A34A] stroke-2.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                ENTRANT
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Enregistrer un revenu, salaire, freelance...
              </p>
            </div>
          </div>
          <span className="shrink-0 text-lg sm:text-xl font-black text-[#111827] dark:text-white px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
            +
          </span>
        </div>
      </Link>

      {/* BOUTON SORTANT */}
      <Link href="/sortant" className="block w-full group">
        <div className="w-full bg-[#DC2626] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#DC2626] stroke-2.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                SORTANT
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Enregistrer une dépense en quelques secondes
              </p>
            </div>
          </div>
          <span className="shrink-0 text-lg sm:text-xl font-black text-[#111827] dark:text-white px-3.5 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
            -
          </span>
        </div>
      </Link>

      {/* BOUTON HISTORIQUE */}
      <Link href="/historique" className="block w-full group">
        <div className="w-full bg-[#2563EB] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <History className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#2563EB] stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                HISTORIQUE
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Consulter les opérations, filtres et graphiques
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
            <span className="hidden sm:block">Voir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
