import React from 'react';
import { LANDING_STEPS } from '@/constants/landing';

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="space-y-8 max-w-4xl mx-auto scroll-mt-20">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#FEF3C7] dark:bg-[#78350F] text-[#92400E] dark:text-[#FDE68A] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827]">
          Démarrage Express
        </span>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Opérationnel en 3 étapes
        </h2>
        <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Aucun paramétrage complexe : tout est prêt dès la première connexion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LANDING_STEPS.map((step) => (
          <div
            key={step.number}
            className="p-5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3 text-left"
          >
            <div className="inline-block px-3 py-1 bg-[#111827] text-white dark:bg-white dark:text-[#111827] font-black text-sm rounded-lg border border-[#111827]">
              {step.number}
            </div>
            <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
              {step.title}
            </h3>
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
