import React from 'react';

export default function GestionLoading() {
  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10 animate-pulse" aria-busy="true" aria-label="Chargement de l'espace gestion">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md border-2 border-[#111827] dark:border-[#334155]" />
      </div>

      <div className="space-y-1">
        <div className="h-7 w-48 bg-neutral-300 dark:bg-neutral-600 rounded" />
        <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>

      {/* Cartes des 4 modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 border-2 border-[#111827]" />
              <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-neutral-300 dark:bg-neutral-600 rounded" />
              <div className="h-3 w-44 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

