'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Laptop, LogOut, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Theme, getStoredTheme, setStoredTheme, applyTheme } from '@/lib/theme';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getStoredTheme();
    setCurrentTheme(initial);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Ne pas afficher sur les pages de connexion et d'inscription
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleCycleTheme = () => {
    // Ordre de cycle direct : Clair -> Sombre -> Système -> Clair
    let next: Theme = 'light';
    if (currentTheme === 'light') next = 'dark';
    else if (currentTheme === 'dark') next = 'system';
    else next = 'light';

    setCurrentTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowLogoutConfirm(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Erreur déconnexion :', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isHomeActive = pathname === '/';
  const isSettingsActive = pathname === '/parametres';

  // Thème actuel : configuration icône et texte
  const themeConfig = {
    light: {
      icon: <Sun className="w-5 h-5 text-[#F59E0B] stroke-2.5 animate-in zoom-in-75 duration-150" />,
      label: 'Clair',
      nextHint: 'Sombre',
    },
    dark: {
      icon: <Moon className="w-5 h-5 text-[#38BDF8] stroke-2.5 animate-in zoom-in-75 duration-150" />,
      label: 'Sombre',
      nextHint: 'Système',
    },
    system: {
      icon: <Laptop className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA] stroke-2.5 animate-in zoom-in-75 duration-150" />,
      label: 'Système',
      nextHint: 'Clair',
    },
  }[currentTheme] || {
    icon: <Sun className="w-5 h-5 text-[#F59E0B] stroke-2.5" />,
    label: 'Clair',
    nextHint: 'Sombre',
  };

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t-3 border-[#111827] dark:border-[#334155] shadow-[0_-4px_0_0_#111827] dark:shadow-[0_-4px_0_0_#000000] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 items-center">
          {/* 1. BOUTON ACCUEIL AVEC LE LOGO 'G' */}
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer group select-none',
              isHomeActive
                ? 'bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] -translate-y-0.5'
                : 'border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-[#131C31]'
            )}
            title="Aller à l'accueil"
          >
            <div
              className={cn(
                'w-7 h-7 rounded-lg font-black text-sm flex items-center justify-center border-2 transition-all shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000]',
                isHomeActive
                  ? 'bg-[#2563EB] text-white border-[#111827] dark:border-white scale-105'
                  : 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-[#111827] dark:border-white group-hover:-rotate-3'
              )}
            >
              G
            </div>
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-wider mt-1 truncate',
                isHomeActive
                  ? 'text-[#2563EB] dark:text-[#60A5FA]'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              Accueil
            </span>
          </Link>

          {/* 2. BOUTON PARAMÈTRES / PROFIL */}
          <Link
            href="/parametres"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer group select-none',
              isSettingsActive
                ? 'bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] -translate-y-0.5'
                : 'border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-[#131C31]'
            )}
            title="Paramètres et sauvegarde"
          >
            <div
              className={cn(
                'w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] transition-transform group-hover:scale-105',
                isSettingsActive
                  ? 'bg-[#2563EB] text-white border-[#111827] dark:border-white'
                  : 'bg-[#EFF6FF] dark:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC] border-[#111827] dark:border-[#334155]'
              )}
            >
              <Settings className="w-4 h-4 stroke-2.5" />
            </div>
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-wider mt-1 truncate',
                isSettingsActive
                  ? 'text-[#2563EB] dark:text-[#60A5FA]'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              Compte
            </span>
          </Link>

          {/* 3. BOUTON THÈME DIRECT (LIGHT -> DARK -> SYSTEM) */}
          <button
            type="button"
            onClick={handleCycleTheme}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-[#131C31] active:translate-y-0.5 transition-all cursor-pointer select-none group"
            title={`Thème actuel : ${themeConfig.label} (cliquez pour passer en ${themeConfig.nextHint})`}
          >
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:scale-105 transition-transform">
              {mounted ? (
                themeConfig.icon
              ) : (
                <div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mt-1 truncate">
              {mounted ? themeConfig.label : 'Thème'}
            </span>
          </button>

          {/* 4. BOUTON DÉCONNEXION */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl border-2 border-transparent hover:bg-[#FEF2F2] dark:hover:bg-[#2C0B0E] active:translate-y-0.5 transition-all cursor-pointer select-none group"
            title="Se déconnecter"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4 text-[#DC2626] stroke-2.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#DC2626] mt-1 truncate">
              Quitter
            </span>
          </button>
        </div>
      </nav>

      {/* Boîte de confirmation de déconnexion */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Se déconnecter ?"
        message="Voulez-vous vraiment vous déconnecter de votre session GEST TRACKER ?"
        confirmLabel="Se Déconnecter"
        cancelLabel="Rester"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
