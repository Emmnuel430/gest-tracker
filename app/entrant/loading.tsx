import React from 'react';

export default function EntrantLoading() {
  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12 animate-pulse" aria-busy="true" aria-label="Chargement du formulaire entrant">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-6 w-24 bg-[#16A34A]/20 border-2 border-[#16A34A] rounded-md" />
      </div>

      {/* Formulaire carte néobrutaliste */}
      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-4">
        {/* Champ Montant */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-14 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl" />
        </div>

        {/* Portefeuille & Catégorie */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-11 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-11 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl" />
          </div>
        </div>

        {/* Date & Note */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-11 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl" />
        </div>

        {/* Bouton de validation */}
        <div className="h-12 bg-neutral-300 dark:bg-neutral-600 border-2 border-[#111827] dark:border-[#334155] rounded-xl" />
      </div>
    </div>
  );
}

