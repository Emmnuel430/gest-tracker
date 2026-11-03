'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { HeroLiveCard } from './HeroLiveCard';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

const ROTATING_WORDS = ['Wave', 'Orange Money', 'Espèces', 'Banques'];

export function LandingHero() {
  const reducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <section className="text-center space-y-8 max-w-4xl mx-auto pt-6 sm:pt-10">
      {/* Badge haut à fort contraste */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#111827]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Finances Personnelles en Afrique de l’Ouest</span>
      </div>

      {/* Titre percutant avec mot rotatif mécanique - WCAG conforme */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC] leading-[1.1]">
          <span>Pilotez vos flux</span>
          <br className="hidden sm:inline" />
          <span className="inline-block mx-2 bg-[#FFE600] text-[#111827] border-2 sm:border-3 border-[#111827] px-3 py-0.5 rounded-xl shadow-[4px_4px_0px_0px_#111827] -rotate-1">
            {ROTATING_WORDS[wordIndex]}
          </span>
          <br className="hidden sm:inline" />
          <span>en toute clarté.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg font-bold text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Centralisez vos comptes en FCFA, fixez vos budgets et maîtrisez votre argent au quotidien sans complexité.
        </p>
      </div>

      {/* 2 CTA majeurs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/demo"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563EB] text-white border-3 border-[#111827] dark:border-[#334155] rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#111827] transition-all cursor-pointer"
        >
          <span>Essayer la démo sans compte</span>
          <ArrowRight className="w-4 h-4 stroke-3" />
        </Link>

        <Link
          href="/register"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] border-3 border-[#111827] dark:border-[#334155] rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] hover:bg-neutral-50 dark:hover:bg-[#131C31] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#111827] transition-all cursor-pointer"
        >
          <span>Créer mon compte gratuit</span>
        </Link>
      </div>

      {/* 3 Pastilles de preuve */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 pt-1">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] stroke-2.5" />
          <span>100 % Gratuit</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] stroke-2.5" />
          <span>En Franc CFA (FCFA)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] stroke-2.5" />
          <span>Zéro publicité</span>
        </span>
      </div>

      {/* Carte vivante du Hero */}
      <div className="pt-4">
        <HeroLiveCard />
      </div>
    </section>
  );
}

