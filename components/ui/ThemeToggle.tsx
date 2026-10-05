'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Theme, getStoredTheme, setStoredTheme, applyTheme } from '@/lib/theme';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getStoredTheme();
    setCurrentTheme(initial);
    applyTheme(initial);

    // Écouteur sur prefers-color-scheme pour le mode système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSelect = (theme: Theme) => {
    setCurrentTheme(theme);
    setStoredTheme(theme);
    applyTheme(theme);
  };

  if (!mounted) {
    return (
      <div className="w-20 h-7 bg-[#DBEAFE] dark:bg-[#1E3A8A] rounded-md border-2 border-[#111827] dark:border-[#334155] animate-pulse" />
    );
  }

  return (
    <div
      className="inline-flex items-center p-0.5 bg-[#DBEAFE] dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
      title="Choisir le thème"
    >
      <button
        type="button"
        onClick={() => handleSelect('light')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          currentTheme === 'light'
            ? 'bg-white text-[#111827] border border-[#111827] shadow-[1px_1px_0px_0px_#111827]'
            : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111827]'
        }`}
        title="Mode Clair"
      >
        <Sun className="w-3.5 h-3.5 stroke-2.5" />
      </button>

      <button
        type="button"
        onClick={() => handleSelect('system')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          currentTheme === 'system'
            ? 'bg-white text-[#2563EB] border border-[#111827] shadow-[1px_1px_0px_0px_#111827]'
            : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111827]'
        }`}
        title="Système (automatique)"
      >
        <Laptop className="w-3.5 h-3.5 stroke-2.5" />
      </button>

      <button
        type="button"
        onClick={() => handleSelect('dark')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          currentTheme === 'dark'
            ? 'bg-[#111827] text-white border border-[#334155] shadow-[1px_1px_0px_0px_#000000]'
            : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111827]'
        }`}
        title="Mode Sombre"
      >
        <Moon className="w-3.5 h-3.5 stroke-2.5" />
      </button>
    </div>
  );
}
