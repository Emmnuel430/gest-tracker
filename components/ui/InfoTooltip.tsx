'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  side?: 'top' | 'bottom';
}

export function InfoTooltip({
  content,
  title,
  className = '',
  side = 'top',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placeBottom: boolean;
  }>({ top: 0, left: 0, placeBottom: false });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 260; // Largeur de référence

    // Détection de l'espace disponible au-dessus
    const placeBottom = side === 'bottom' || rect.top < 130;

    const top = placeBottom ? rect.bottom + 8 : rect.top - 8;

    // Calcul du centrage horizontal avec contrainte de marge écran (min 12px, max window.innerWidth - width - 12)
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const maxLeft = Math.max(12, window.innerWidth - tooltipWidth - 12);
    left = Math.max(12, Math.min(maxLeft, left));

    setCoords({ top, left, placeBottom });
  }, [side]);

  // Recalcul de position et gestion de la fermeture au clic extérieur, Échap, scroll
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const tooltipElement =
    isOpen && mounted ? (
      <div
        ref={tooltipRef}
        role="tooltip"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: coords.placeBottom ? `${coords.top}px` : undefined,
          bottom: !coords.placeBottom ? `${window.innerHeight - coords.top}px` : undefined,
          left: `${coords.left}px`,
        }}
        className="z-9999 w-64 max-w-[85vw] p-2.5 bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] text-[11px] font-medium leading-relaxed rounded-xl border-2 border-[#111827] dark:border-[#334155] shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-100"
      >
        {title && (
          <div className="font-black text-xs uppercase tracking-tight mb-1 text-[#111827] dark:text-[#F8FAFC] border-b border-neutral-200 dark:border-neutral-700 pb-1">
            {title}
          </div>
        )}
        <div className="text-neutral-700 dark:text-neutral-300">
          {content}
        </div>
      </div>
    ) : null;

  return (
    <div
      className={`relative inline-flex items-center text-left ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        onFocus={() => {
          updatePosition();
          setIsOpen(true);
        }}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-label={title || 'Information complémentaire'}
        className="p-0.5 text-neutral-400 hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#111827] dark:focus:ring-white inline-flex items-center justify-center"
      >
        <Info className="w-3.5 h-3.5 stroke-2.5" />
      </button>

      {mounted && typeof document !== 'undefined' && tooltipElement
        ? createPortal(tooltipElement, document.body)
        : null}
    </div>
  );
}
