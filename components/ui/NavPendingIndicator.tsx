'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Indicateur mécanique ultra-rapide de navigation néobrutaliste.
 * Affiche immédiatement une barre de progression mécanique (#FFE600 / #2563EB)
 * dès qu'un lien interne est activé, éliminant tout sentiment de latence perçue.
 */
export function NavPendingIndicator() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Dès que le pathname change, la navigation est résolue
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignorer si la touche Ctrl, Meta, Shift ou Alt est enfoncée (nouvel onglet)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Uniquement pour les liens de navigation interne
      if (
        href.startsWith('/') &&
        !href.startsWith('#') &&
        !target.getAttribute('target') &&
        href !== pathname
      ) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div
      role="progressbar"
      aria-label="Navigation en cours"
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#111827] overflow-hidden pointer-events-none"
    >
      <div className="h-full bg-[#FFE600] border-b border-[#111827] animate-pulse w-full" />
    </div>
  );
}

