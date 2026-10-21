'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ReferenceDataProvider } from '@/components/providers/ReferenceDataProvider';
import { BottomNav } from '@/components/layout/BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Détection des routes publiques, de démo ou d'authentification
  const isPublicOrAuthPage =
    pathname === '/' ||
    pathname === '/demo' ||
    pathname.startsWith('/demo') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/mot-de-passe-oublie') ||
    pathname.startsWith('/auth');

  // Layout allégé pour la vitrine, la démo et l'authentification
  if (isPublicOrAuthPage) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        {children}
      </div>
    );
  }

  // Layout applicatif authentifié avec ReferenceDataProvider et barre de navigation
  return (
    <div className="min-h-full flex flex-col flex-1 pb-24 sm:pb-28">
      <ReferenceDataProvider>
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-5 sm:py-6">
          {children}
        </main>
      </ReferenceDataProvider>
      <BottomNav />
    </div>
  );
}
