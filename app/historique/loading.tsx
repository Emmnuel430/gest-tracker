import React from 'react';

export default function HistoriqueLoading() {
  return (
    <div className="w-full space-y-4 max-w-xl mx-auto animate-pulse" aria-busy="true" aria-label="Chargement de l'historique">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg border-2 border-[#111827] dark:border-[#334155]" />
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2.5">
        <div className="h-10 bg-neutral-100 dark:bg-[#0F172A] border-2 border-neutral-300 dark:border-neutral-700 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
          <div className="h-7 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
          <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-16 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 border border-[#111827]" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-neutral-300 dark:bg-neutral-600 rounded" />
                <div className="h-2.5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-neutral-300 dark:bg-neutral-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

