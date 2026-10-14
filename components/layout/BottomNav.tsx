'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, SlidersHorizontal, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Ne pas afficher sur les pages d'authentification
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isGestionActive =
    pathname === '/gestion' ||
    pathname === '/options' ||
    pathname === '/budgets' ||
    pathname === '/recurrences' ||
    pathname === '/portefeuilles' ||
    pathname === '/dettes';
  const isSettingsActive = pathname === '/parametres';

  const navItems = [
    {
      href: '/',
      label: 'Accueil',
      isActive: isHomeActive,
      icon: Home,
      title: 'Tableau de bord',
    },
    {
      href: '/gestion',
      label: 'Gestion',
      isActive: isGestionActive,
      icon: SlidersHorizontal,
      title: 'Budgets, Portefeuilles et Outils',
    },
    {
      href: '/parametres',
      label: 'Compte',
      isActive: isSettingsActive,
      icon: Settings,
      title: 'Paramètres, Thème et Profil',
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t-3 border-[#111827] dark:border-white shadow-[0_-6px_0_0_#111827] dark:shadow-[0_-6px_0_0_#000000] px-4 pt-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2 sm:gap-3 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer group select-none border-2',
                item.isActive
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-1'
                  : 'bg-white dark:bg-[#1E293B] border-transparent hover:border-[#111827] dark:hover:border-white hover:shadow-[2px_2px_0px_0px_#111827] dark:hover:shadow-[2px_2px_0px_0px_#FFFFFF]'
              )}
              title={item.title}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center transition-transform group-hover:scale-110',
                  item.isActive ? 'text-white' : 'text-[#111827] dark:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 stroke-[2.5]',
                    item.isActive ? 'text-white' : 'text-[#111827] dark:text-white'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[11px] font-black uppercase tracking-wider mt-0.5',
                  item.isActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
