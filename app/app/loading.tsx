import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-4 max-w-xl mx-auto animate-pulse" aria-busy="true" aria-label="Chargement du tableau de bord">
      {/* 1. Carte principale Solde Total */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        </div>
        <div className="h-10 w-48 bg-neutral-300 dark:bg-neutral-600 rounded" />
      </div>

      {/* 2. Mini-cartes Entrées / Sorties */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        <div className="bg-[#F0FDF4] dark:bg-[#062413] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-6 w-28 bg-neutral-300 dark:bg-neutral-600 rounded" />
        </div>
        <div className="bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-6 w-28 bg-neutral-300 dark:bg-neutral-600 rounded" />
        </div>
      </div>

      {/* 3. Boutons d'action rapide */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="h-14 bg-neutral-200 dark:bg-neutral-800 border-2 border-[#111827] dark:border-[#334155] rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]" />
        <div className="h-14 bg-neutral-200 dark:bg-neutral-800 border-2 border-[#111827] dark:border-[#334155] rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]" />
      </div>

      {/* 4. Liste des transactions récentes */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
        <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-neutral-100 dark:bg-[#0F172A] border border-neutral-200 dark:border-neutral-700 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

