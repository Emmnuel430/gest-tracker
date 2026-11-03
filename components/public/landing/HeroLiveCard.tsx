'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Wallet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { OdometerCounter } from '@/components/ui/OdometerCounter';
import { SegmentedGauge } from '@/components/ui/SegmentedGauge';
import { formatCurrency } from '@/constants/config';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

type FlowMode = 'INCOME' | 'EXPENSE' | 'TRANSFER';

/**
 * Carte interactive vivante du Hero ("Trilogie 2+1 & Odomètre FCFA")
 * Lecture automatique en boucle toutes les 3s désactivée dès la première interaction utilisateur.
 */
export function HeroLiveCard() {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<FlowMode>('EXPENSE');
  const [hasInteracted, setHasInteracted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cycle automatique si aucune interaction utilisateur (et si reducedMotion = false)
  useEffect(() => {
    if (hasInteracted || reducedMotion) return;

    const timer = setInterval(() => {
      setMode((prev) => {
        if (prev === 'EXPENSE') return 'INCOME';
        if (prev === 'INCOME') return 'TRANSFER';
        return 'EXPENSE';
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [hasInteracted, reducedMotion]);

  const handleSelectMode = (newMode: FlowMode) => {
    setHasInteracted(true);
    setMode(newMode);
  };

  // Données de simulation dynamique selon le mode actif
  const currentBalance =
    mode === 'INCOME' ? 725000 : mode === 'EXPENSE' ? 615000 : 650000;

  const budgetPercentage =
    mode === 'EXPENSE' ? 88 : mode === 'INCOME' ? 55 : 70;

  const budgetStatus: 'NORMAL' | 'WARNING' | 'EXCEEDED' =
    mode === 'EXPENSE' ? 'WARNING' : 'NORMAL';

  // Effet d'inclinaison 3D perspective sur desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current || window.matchMedia('(hover: none)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / rect.height) * -8;
    const rotateY = (x / rect.width) * 8;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-md mx-auto bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#000000] transition-transform duration-150 ease-out text-left"
    >
      {/* Entête de la carte */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#16A34A] border border-[#111827]" />
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Démonstrateur en direct
          </span>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#111827] bg-[#FFE600] text-[#111827]">
          Interactif
        </span>
      </div>

      {/* Switch physique à 3 positions (Trilogie 2+1) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl mb-4">
        <button
          type="button"
          onClick={() => handleSelectMode('INCOME')}
          className={`py-2 px-1 text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            mode === 'INCOME'
              ? 'bg-[#16A34A] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827] -translate-y-0.5'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 stroke-3" />
          <span>Entrant</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('EXPENSE')}
          className={`py-2 px-1 text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            mode === 'EXPENSE'
              ? 'bg-[#DC2626] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827] -translate-y-0.5'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-3" />
          <span>Sortant</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('TRANSFER')}
          className={`py-2 px-1 text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            mode === 'TRANSFER'
              ? 'bg-[#2563EB] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827] -translate-y-0.5'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 stroke-3" />
          <span>Virement</span>
        </button>
      </div>

      {/* Affichage du solde avec OdometerCounter */}
      <div className="p-4 bg-linear-to-br from-neutral-50 to-[#F8FAFC] dark:from-[#131C31] dark:to-[#0B0F19] border-2 border-[#111827] dark:border-[#334155] rounded-2xl mb-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
        <span className="block text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1">
          Solde total disponible
        </span>
        <div className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-[#F8FAFC]">
          <OdometerCounter value={currentBalance} formatFn={(n) => `${n.toLocaleString('fr-FR')} FCFA`} />
        </div>

        {/* Détail de l'opération en cours */}
        <div className="mt-2.5 pt-2 border-t border-dashed border-neutral-200 dark:border-[#334155] flex items-center justify-between text-xs font-bold">
          <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-[#2563EB]" />
            {mode === 'INCOME' ? 'Entrée Wave' : mode === 'EXPENSE' ? 'Dépense Marché' : 'Virement Banque vers Wave'}
          </span>
          <span
            className={`font-black ${
              mode === 'INCOME'
                ? 'text-[#16A34A]'
                : mode === 'EXPENSE'
                  ? 'text-[#DC2626]'
                  : 'text-[#2563EB]'
            }`}
          >
            {mode === 'INCOME' ? '+75 000 FCFA' : mode === 'EXPENSE' ? '-35 000 FCFA' : '50 000 FCFA'}
          </span>
        </div>
      </div>

      {/* Jauge mécanique SegmentedGauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-black uppercase">
          <span className="text-neutral-600 dark:text-neutral-400">Plafond Alimentation</span>
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#111827] text-[10px] ${
              budgetStatus === 'WARNING'
                ? 'bg-[#FEF3C7] text-[#92400E] brutal-wiggle-stepped'
                : 'bg-[#DCFCE7] text-[#166534]'
            }`}
          >
            {budgetStatus === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
            {budgetPercentage}% consommé
          </span>
        </div>
        <SegmentedGauge percentage={budgetPercentage} status={budgetStatus} />
      </div>
    </div>
  );
}
