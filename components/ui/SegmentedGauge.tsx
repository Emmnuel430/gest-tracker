'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface SegmentedGaugeProps {
  percentage: number;
  segmentsCount?: number;
  status?: 'NORMAL' | 'WARNING' | 'EXCEEDED';
  activeColor?: string;
  className?: string;
}

/**
 * Jauge néobrutaliste mécanique segmentée en blocs rectangulaires
 * Allumage séquentiel cranté avec gestion stricte des seuils (<75% vert/cat, 75-99% orange, >=100% rouge).
 */
export function SegmentedGauge({
  percentage,
  segmentsCount = 10,
  status = 'NORMAL',
  activeColor,
  className = '',
}: SegmentedGaugeProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, percentage);
  const activeSegments = Math.min(segmentsCount, Math.round((clamped / 100) * segmentsCount));

  // Couleur thématique selon le statut financier
  const segmentColor =
    status === 'EXCEEDED' || percentage >= 100
      ? '#DC2626'
      : status === 'WARNING' || percentage >= 75
        ? '#F59E0B'
        : activeColor || '#10B981';

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`flex items-center gap-1 w-full p-1 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] ${className}`}
    >
      {Array.from({ length: segmentsCount }).map((_, index) => {
        const isActive = index < activeSegments;
        const delay = reducedMotion ? 0 : index * 20;

        return (
          <div
            key={index}
            className="flex-1 h-3 rounded-xs border border-[#111827]/40 dark:border-white/30 transition-all duration-150"
            style={{
              backgroundColor: isActive ? segmentColor : 'transparent',
              transitionDelay: `${delay}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
