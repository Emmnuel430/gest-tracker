import React from 'react';
import { ChevronDown } from 'lucide-react';
import { LANDING_FAQ } from '@/constants/landing';

export function LandingFaq() {
  return (
    <section id="faq" className="space-y-6 max-w-3xl mx-auto scroll-mt-20 text-left">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-neutral-100 dark:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827]">
          Questions fréquentes
        </span>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Réponses à vos questions
        </h2>
      </div>

      <div className="space-y-3">
        {LANDING_FAQ.map((item, idx) => (
          <details
            key={idx}
            className="group p-4 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer"
          >
            <summary className="flex items-center justify-between text-sm sm:text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC] list-none select-none">
              <span>{item.question}</span>
              <ChevronDown className="w-4 h-4 stroke-3 text-neutral-500 group-open:rotate-180 transition-transform duration-150" />
            </summary>
            <p className="mt-3 pt-3 border-t border-neutral-100 dark:border-[#334155] text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

