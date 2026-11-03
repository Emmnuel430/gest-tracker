import React from 'react';

export default function BudgetsLoading() {
  return (
    <div className="space-y-5 max-w-xl mx-auto pb-12 animate-pulse" aria-busy="true" aria-label="Chargement des budgets">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-xl border-2 border-[#111827] dark:border-[#334155]" />
          <div className="h-9 w-36 bg-neutral-300 dark:bg-neutral-600 rounded-xl border-2 border-[#111827] dark:border-[#334155]" />
        </div>
      </div>

      {/* Sélecteur de mois */}
      <div className="h-12 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]" />

      {/* Carte synthèse globale */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-8 bg-neutral-100 dark:bg-[#0F172A] rounded" />
          <div className="h-8 bg-neutral-100 dark:bg-[#0F172A] rounded" />
          <div className="h-8 bg-neutral-100 dark:bg-[#0F172A] rounded" />
        </div>
      </div>

      {/* Liste des cartes de budgets */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

