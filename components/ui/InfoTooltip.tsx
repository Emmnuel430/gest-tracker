'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  side?: 'top' | 'bottom';
  align?: 'center' | 'left' | 'right';
}

export function InfoTooltip({
  content,
  title,
  className = '',
  side = 'top',
  align = 'center',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur ou appui sur Échap
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  // Positionnement
  const sideClasses =
    side === 'bottom'
      ? 'top-full mt-1.5'
      : 'bottom-full mb-1.5';

  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center text-left ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={toggle}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-label={title || 'Information complémentaire'}
        className="p-0.5 text-neutral-400 hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#111827] dark:focus:ring-white inline-flex items-center justify-center"
      >
        <Info className="w-3.5 h-3.5 stroke-2.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 max-w-[85vw] p-2.5 bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] text-[11px] font-medium leading-relaxed rounded-xl border-2 border-[#111827] dark:border-[#334155] shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-100 ${sideClasses} ${alignClasses}`}
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
      )}
    </div>
  );
}
