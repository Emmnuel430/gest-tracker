'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, TrendingUp, Sparkles, Info } from 'lucide-react';
import { FinancialInsight } from '@/lib/insights';

interface InsightsCarouselProps {
  insights: FinancialInsight[];
}

export function InsightsCarousel({ insights }: InsightsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const total = insights.length;

  // Détection du mode accessibilité (prefers-reduced-motion)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Défilement précédent / suivant
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Défilement automatique (6 s) avec arrêt sur hover, focus ou motion réduite
  useEffect(() => {
    if (total <= 1 || isPaused || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timer);
  }, [total, isPaused, prefersReducedMotion]);

  // Support clavier (Flèches gauche / droite)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Support tactile Swipe mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    if (deltaX > 40) {
      handleNext();
    } else if (deltaX < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  // Rendu unitaire d'un conseil financier
  const renderInsightContent = (insight: FinancialInsight) => {
    let badgeBg = 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border-blue-500';
    let icon = <Info className="w-3.5 h-3.5 stroke-2.5 shrink-0" />;

    if (insight.severity === 'danger') {
      badgeBg = 'bg-[#FEE2E2] dark:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#FCA5A5] border-[#EF4444]';
      icon = <AlertTriangle className="w-3.5 h-3.5 stroke-2.5 text-[#DC2626] shrink-0" />;
    } else if (insight.severity === 'warning') {
      badgeBg = 'bg-[#FEF3C7] dark:bg-[#78350F]/30 text-[#92400E] dark:text-[#FCD34D] border-[#F59E0B]';
      icon = <TrendingUp className="w-3.5 h-3.5 stroke-2.5 text-[#D97706] shrink-0" />;
    } else if (insight.severity === 'success') {
      badgeBg = 'bg-[#DCFCE7] dark:bg-[#064E3B]/30 text-[#166534] dark:text-[#86EFAC] border-[#22C55E]';
      icon = <Sparkles className="w-3.5 h-3.5 stroke-2.5 text-[#16A34A] shrink-0" />;
    }

    return (
      <div className={`p-3 rounded-xl border-2 ${badgeBg} transition-all h-full flex flex-col justify-center`}>
        <div className="flex items-start gap-2">
          <span className="mt-0.5">{icon}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase tracking-tight">
              {insight.title}
            </h4>
            <p className="text-xs font-medium opacity-90 mt-0.5 leading-snug">
              {insight.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Cas limite : une seule alerte -> aucun contrôle ni autoplay
  if (total <= 1) {
    return (
      <div className="w-full">
        {insights[0] ? renderInsightContent(insights[0]) : null}
      </div>
    );
  }

  return (
    <div
      className="w-full space-y-2.5 focus:outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Conseils et alertes financières"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fenêtre de projection (Track slider) */}
      <div className="relative overflow-hidden rounded-xl">
        <div
          className={`flex ${
            prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'
          }`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {insights.map((insight, index) => (
            <div
              key={insight.id}
              className="w-full shrink-0 min-h-[74px]"
              role="group"
              aria-roledescription="slide"
              aria-label={`Conseil ${index + 1} sur ${total}`}
              aria-hidden={currentIndex !== index}
            >
              {renderInsightContent(insight)}
            </div>
          ))}
        </div>
      </div>

      {/* Barre de navigation & indicateurs néobrutalistes */}
      <div className="flex items-center justify-between pt-1">
        {/* Pastilles cliquables */}
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Sélection du conseil financier"
        >
          {insights.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Aller au conseil ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`h-2 transition-all rounded-full border border-[#111827] dark:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFE600] ${
                currentIndex === index
                  ? 'w-6 bg-[#FFE600] dark:bg-[#FFE600]'
                  : 'w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>

        {/* Compteur numérique & Boutons précédent / suivant */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-100 dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] border border-[#111827] dark:border-[#334155] rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
            aria-hidden="true"
          >
            {currentIndex + 1} / {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Conseil précédent"
              className="p-1 rounded-lg border-2 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-[#334155] active:translate-y-0.5 shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] transition-all focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-2.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Conseil suivant"
              className="p-1 rounded-lg border-2 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-[#334155] active:translate-y-0.5 shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] transition-all focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
