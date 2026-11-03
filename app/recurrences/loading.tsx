import React from 'react';

export default function RecurrencesLoading() {
  return (
    <div className="space-y-5 max-w-xl mx-auto pb-12 animate-pulse" aria-busy="true" aria-label="Chargement des règles récurrentes">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-9 w-40 bg-neutral-300 dark:bg-neutral-600 rounded-xl border-2 border-[#111827] dark:border-[#334155]" />
      </div>

      {/* Carte Prévisions Mensuelles */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-2.5">
        <div className="h-4 w-44 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 bg-neutral-100 dark:bg-[#0F172A] rounded-lg" />
          <div className="h-10 bg-neutral-100 dark:bg-[#0F172A] rounded-lg" />
        </div>
      </div>

      {/* Cartes de récurrences */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-2"
          >
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="h-6 w-28 bg-neutral-300 dark:bg-neutral-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

