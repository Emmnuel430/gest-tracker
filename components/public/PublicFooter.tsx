'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowUpRight, Play, Lock, UserPlus } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="w-full border-t-3 border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] mt-auto transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Marque & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-black text-base flex items-center justify-center rounded-lg border-2 border-white dark:border-[#111827] shadow-[2px_2px_0px_0px_#111827]">
                G
              </span>
              <span className="font-black text-lg uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                GEST TRACKER
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm">
              L'outil néobrutaliste sans compromis pour suivre vos dépenses, vos revenus et votre trésorerie multi-comptes (Espèces, Wave, Orange Money et Banques) en zone FCFA.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Chiffrement SSL & Isolation RLS par utilisateur</span>
            </div>
          </div>

          {/* Découverte */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
              Découverte
            </h4>
            <ul className="space-y-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/demo" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1 transition-colors">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Démo interactive sans compte</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1 transition-colors">
                  <UserPlus className="w-3 h-3" />
                  <span>Créer un compte gratuit</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1 transition-colors">
                  <Lock className="w-3 h-3" />
                  <span>Connexion à mon espace</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sécurité & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
              Confidentialité
            </h4>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Vos données financières restent strictement privées. Aucun compte bancaire n'est synchronisé automatiquement ni partagé avec des tiers.
            </p>
            <div className="pt-1">
              <a
                href="mailto:contact@gesttracker.app"
                className="text-[11px] font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Nous contacter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ligne de séparation & copyright */}
        <div className="pt-6 border-t-2 border-neutral-200 dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400">
          <p>© 2026 GEST TRACKER. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Version 2.14.0</span>
            <span>•</span>
            <span>Simplicité & Zéro over-engineering</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
