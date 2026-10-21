'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight, X, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DemoActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

export function DemoActionModal({
  isOpen,
  onClose,
  actionTitle = 'Action réservée au compte personnel',
  actionDescription = 'L\'enregistrement, la modification ou la suppression de transactions nécessite un compte personnel sécurisé.',
}: DemoActionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#000000] space-y-5 animate-in zoom-in-95 duration-200">
        {/* En-tête avec bouton fermer */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 bg-[#FEF3C7] dark:bg-[#78350F] text-[#D97706] dark:text-[#FDE68A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#111827] shrink-0">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1.5 rounded-xl border-2 border-transparent hover:border-[#111827] dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-300 stroke-[2.5]" />
          </button>
        </div>

        {/* Titre & Explication */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] block">
            Mode Démo — Lecture Seule
          </span>
          <h3
            id="demo-modal-title"
            className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]"
          >
            {actionTitle}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {actionDescription} En créant votre compte gratuit en 30 secondes, vous bénéficierez de votre propre espace chiffré et sauvegardé pour gérer vos finances réelles.
          </p>
        </div>

        {/* 3 garanties du compte */}
        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl space-y-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Données isolées et strictement privées (RLS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Historique illimité et export PDF / CSV</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Comptes Espèces, Wave, Orange Money et Banques</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <Link href="/register" className="block w-full">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="text-xs uppercase flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white shadow-[3px_3px_0px_0px_#111827]"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Créer mon compte gratuit</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="neutral"
            size="md"
            fullWidth
            onClick={onClose}
            className="text-xs uppercase"
          >
            Continuer à explorer la démo
          </Button>
        </div>
      </div>
    </div>
  );
}
