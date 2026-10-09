import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, History, PieChart } from "lucide-react";

export function HomeActions() {
  return (
    <div className="w-full space-y-3 sm:space-y-3.5 my-5 sm:my-6">
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
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1">
            <span className="hidden sm:block">Voir</span> ➔
          </span>
        </div>
      </Link>

      {/* BOUTON BUDGETS */}
      <Link href="/budgets" className="block w-full group">
        <div className="w-full bg-[#D97706] dark:bg-[#B45309] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <PieChart className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#D97706] dark:text-[#FDE68A] stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                BUDGETS
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Surveiller mes plafonds et jauges mensuelles
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1">
            <span className="hidden sm:block">Gérer</span> ➔
          </span>
        </div>
      </Link>

      {/* BOUTON RÉCURRENCES */}
      <Link href="/recurrences" className="block w-full group">
        <div className="w-full bg-[#7C3AED] dark:bg-[#6D28D9] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <History className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#7C3AED] dark:text-[#DDD6FE] stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                RÉCURRENCES
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Loyer, abonnements et rentrées mensuelles fixes
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1">
            <span className="hidden sm:block">Rappels</span> ➔
          </span>
        </div>
      </Link>

      {/* BOUTON PORTEFEUILLES */}
      <Link href="/portefeuilles" className="block w-full group">
        <div className="w-full bg-[#059669] dark:bg-[#047857] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <PieChart className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#059669] dark:text-[#A7F3D0] stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                PORTEFEUILLES
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Comptes (Espèces, Wave, Banque) et virements
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1">
            <span className="hidden sm:block">Comptes</span> ➔
          </span>
        </div>
      </Link>

      {/* BOUTON DETTES & CRÉANCES */}
      <Link href="/dettes" className="block w-full group">
        <div className="w-full bg-[#DB2777] dark:bg-[#BE185D] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <History className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-[#DB2777] dark:text-[#FBCFE8] stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white leading-tight">
                DETTES & CRÉANCES
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-white/90 truncate sm:whitespace-normal">
                Prêts accordés, dettes et remboursements partiels
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2.5 sm:px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1">
            <span className="hidden sm:block">Suivre</span> ➔
          </span>
        </div>
      </Link>
    </div>
  );
}
