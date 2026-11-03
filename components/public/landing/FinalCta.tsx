import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="bg-[#111827] text-white border-3 border-[#111827] dark:border-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[8px_8px_0px_0px_#FFE600] max-w-4xl mx-auto">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-[#111827] font-black text-xs uppercase rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prise en main immédiate</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
          Prêt à maîtriser vos finances en FCFA ?
        </h2>
        <p className="text-sm font-medium text-neutral-300 max-w-md mx-auto">
          Rejoignez dès aujourd’hui une gestion claire, ultra-rapide et sécurisée.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/demo"
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#111827] rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#FFE600] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          Essayer sans inscription
        </Link>
        <Link
          href="/register"
          className="w-full sm:w-auto px-6 py-3.5 bg-[#FFE600] text-[#111827] rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#FFFFFF] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <span>Créer mon compte</span>
          <ArrowRight className="w-4 h-4 stroke-3" />
        </Link>
      </div>
    </section>
  );
}
