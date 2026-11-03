import React from 'react';

export default function ParametresLoading() {
  return (
    <div className="space-y-5 max-w-xl mx-auto pb-12 animate-pulse" aria-busy="true" aria-label="Chargement des paramètres">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md border-2 border-[#111827] dark:border-[#334155]" />
      </div>

      {/* Carte Profil */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 border-2 border-[#111827]" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-36 bg-neutral-300 dark:bg-neutral-600 rounded" />
          <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>

      {/* Cartes de réglages */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-neutral-300 dark:bg-neutral-600 rounded" />
              <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="h-8 w-14 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

