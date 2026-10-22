'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Play, ArrowRight, Lock } from 'lucide-react';
import { getStoredTheme, setStoredTheme, applyTheme, Theme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';

export function PublicHeader() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <header className="w-full border-b-3 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] sticky top-0 z-50 transition-colors shadow-[0_4px_0_0_#111827] dark:shadow-[0_4px_0_0_#000000]">
      <div className="max-w-5xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer select-none">
          <span className="w-9 h-9 sm:w-10 sm:h-10 bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-black text-lg sm:text-xl flex items-center justify-center rounded-xl border-2 border-white dark:border-[#111827] shadow-[2px_2px_0px_0px_#111827] group-hover:-translate-y-0.5 transition-transform">
            G
          </span>
          <span className="font-black text-lg sm:text-xl uppercase tracking-tighter text-[#111827] dark:text-[#F8FAFC]">
            GEST TRACKER
          </span>
        </Link>

        {/* Actions de navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bouton Thème */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Basculer le mode sombre ou clair"
              className="p-2 sm:p-2.5 rounded-xl border-2 border-[#111827] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {document.documentElement.classList.contains('dark') ? (
                <Sun className="w-4 h-4 text-[#FFE600] stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 text-[#2563EB] stroke-[2.5]" />
              )}
            </button>
          )}

          {/* Lien Connexion */}
          <Link href="/login">
            <button
              type="button"
              className="px-3 sm:px-4 py-2 rounded-xl border-2 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-500 stroke-[2.5] hidden sm:inline" />
              <span>Connexion</span>
            </button>
          </Link>

          {/* CTA Démo / Essayer */}
          <Link href="/demo">
            <Button
              variant="warning"
              size="sm"
              className="text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]"
            >
              <Play className="w-3.5 h-3.5 stroke-[3] fill-current" />
              <span className="hidden sm:inline">Essayer la démo</span>
              <span className="sm:hidden">Démo</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
