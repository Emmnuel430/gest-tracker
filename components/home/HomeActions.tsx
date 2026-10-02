import React from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, History, Sparkles } from 'lucide-react';

export function HomeActions() {
  return (
    <div className="w-full space-y-3.5 my-6">
      {/* BOUTON ENTRANT */}
      <Link href="/entrant" className="block w-full group">
        <div className="w-full bg-[#00DF81] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex items-center justify-between transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[7px_7px_0px_0px_#000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
              <ArrowDownLeft className="w-7 h-7 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
                ENTRANT
              </h3>
              <p className="text-xs font-bold text-black/75">
                Enregistrer un revenu, salaire, freelance...
              </p>
            </div>
          </div>
          <span className="text-xl font-black text-black px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
            +
          </span>
        </div>
      </Link>

      {/* BOUTON SORTANT */}
      <Link href="/sortant" className="block w-full group">
        <div className="w-full bg-[#FF5964] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex items-center justify-between transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[7px_7px_0px_0px_#000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
              <ArrowUpRight className="w-7 h-7 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                SORTANT
              </h3>
              <p className="text-xs font-bold text-white/90">
                Enregistrer une dépense en 5 secondes
              </p>
            </div>
          </div>
          <span className="text-xl font-black text-black px-3.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
            -
          </span>
        </div>
      </Link>

      {/* BOUTON HISTORIQUE */}
      <Link href="/historique" className="block w-full group">
        <div className="w-full bg-[#FFDE59] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex items-center justify-between transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[7px_7px_0px_0px_#000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
              <History className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
                HISTORIQUE
              </h3>
              <p className="text-xs font-bold text-black/75">
                Consulter les dépenses, filtres et stats
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-black px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
            Voir ➔
          </span>
        </div>
      </Link>
    </div>
  );
}
