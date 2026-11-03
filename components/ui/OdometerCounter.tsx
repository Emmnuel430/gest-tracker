'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface OdometerCounterProps {
  value: number;
  duration?: number;
  formatFn?: (val: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Compteur odomètre néobrutaliste mécanique ("Snappy & Mechanical")
 * Défilement fluide de l'ancienne vers la nouvelle valeur sans décalage CLS (tabular-nums).
 */
export function OdometerCounter({
  value,
  duration = 380,
  formatFn,
  className = '',
  prefix = '',
  suffix = '',
}: OdometerCounterProps) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startVal = prevValueRef.current;
    const targetVal = value;
    if (startVal === targetVal) return;

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      // Courbe d'accélération snappy cubique : cubic-bezier(0.2, 0, 0, 1)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
        prevValueRef.current = targetVal;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, reducedMotion]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toLocaleString('fr-FR');

  return (
    <span className={`tabular-nums inline-block transition-none ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
