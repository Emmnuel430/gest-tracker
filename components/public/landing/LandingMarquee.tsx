import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

const MARQUEE_ITEMS = [
  'Comptes Wave & Orange Money',
  'Plafonds Budgétaires en FCFA',
  'Trilogie Entrant / Sortant / Virement',
  'Rappels d’Échéances par E-mail',
  'Gestion des Dettes & Créances',
  'Chiffrement & Sécurité RLS',
  'Export PDF & Sauvegarde Complète',
  'Mobile-First & Ultra Rapide',
];

export function LandingMarquee() {
  return (
    <div className="w-full overflow-hidden bg-[#111827] text-white py-3 border-y-3 border-[#111827] dark:border-white select-none">
      <div className="animate-marquee flex items-center gap-6">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 shrink-0 text-xs sm:text-sm font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
