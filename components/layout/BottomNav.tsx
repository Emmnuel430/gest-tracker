'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, SlidersHorizontal, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Ne pas afficher sur les pages publiques, de démo, d'authentification ou d'onboarding
  if (
    pathname === '/' ||
    pathname === '/demo' ||
    pathname.startsWith('/demo') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/mot-de-passe-oublie') ||
    pathname === '/bienvenue' ||
    pathname.startsWith('/bienvenue')
  ) {
    return null;
  }

  const isHomeActive = pathname === '/' || pathname === '/app';
  const isHistoryActive = pathname === '/historique' || pathname.startsWith('/historique');
  const isGestionActive =
    pathname === '/gestion' ||
    pathname.startsWith('/gestion') ||
    pathname === '/options' ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/recurrences') ||
    pathname.startsWith('/portefeuilles') ||
    pathname.startsWith('/dettes');
  const isSettingsActive = pathname === '/parametres' || pathname.startsWith('/parametres');

  const navItems = [
    {
      href: '/',
      label: 'Accueil',
      isActive: isHomeActive,
      icon: Home,
      title: 'Tableau de bord',
    },
    {
      href: '/historique',
      label: 'Historique',
      isActive: isHistoryActive,
      icon: Receipt,
      title: 'Historique, filtres et graphiques',
    },
    {
      href: '/gestion',
      label: 'Gestion',
      isActive: isGestionActive,
      icon: SlidersHorizontal,
      title: 'Budgets, portefeuilles et outils',
    },
    {
      href: '/parametres',
      label: 'Profil',
      isActive: isSettingsActive,
      icon: User,
      title: 'Profil, paramètres et sécurité',
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t-3 border-[#111827] dark:border-white shadow-[0_-6px_0_0_#111827] dark:shadow-[0_-6px_0_0_#000000] px-2 sm:px-4 pt-2 sm:pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2.5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl transition-all cursor-pointer group select-none border-2',
                item.isActive
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-1'
                  : 'bg-white dark:bg-[#1E293B] border-transparent hover:border-[#111827] dark:hover:border-white hover:shadow-[2px_2px_0px_0px_#111827] dark:hover:shadow-[2px_2px_0px_0px_#FFFFFF]'
              )}
              title={item.title}
            >
              <div
                className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-black text-sm flex items-center justify-center transition-transform group-hover:scale-110',
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
                  'text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-0.5 truncate max-w-full',
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
