'use client';

import React, { useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { TransferModal } from '@/components/wallets/TransferModal';
import { useWallets } from '@/components/providers/ReferenceDataProvider';
import { cn } from '@/lib/utils';

function EntrantButton() {
  const { pending } = useLinkStatus();
  return (
    <div
      className={cn(
        'w-full bg-[#16A34A] border-2 border-[#111827] dark:border-[#334155] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-2 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0px_0px_#111827] dark:group-hover:shadow-[4px_4px_0px_0px_#000000] group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none cursor-pointer',
        pending && 'scale-95 bg-[#15803D] opacity-90'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] flex items-center justify-center shrink-0">
          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A] stroke-3" />
        </div>
        <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-white truncate">
          {pending ? 'Ouverture…' : 'ENTRANT'}
        </span>
      </div>
      <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2 py-0.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-md shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000]">
        +
      </span>
    </div>
  );
}

function SortantButton() {
  const { pending } = useLinkStatus();
  return (
    <div
      className={cn(
        'w-full bg-[#DC2626] border-2 border-[#111827] dark:border-[#334155] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-2 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0px_0px_#111827] dark:group-hover:shadow-[4px_4px_0px_0px_#000000] group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none cursor-pointer',
        pending && 'scale-95 bg-[#B91C1C] opacity-90'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] flex items-center justify-center shrink-0">
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#DC2626] stroke-3" />
        </div>
        <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-white truncate">
          {pending ? 'Ouverture…' : 'SORTANT'}
        </span>
      </div>
      <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2 py-0.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-md shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000]">
        -
      </span>
    </div>
  );
}

export function HomeActions() {
  const router = useRouter();
  const { wallets, refreshWallets } = useWallets();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);

  const handleTransferSuccess = async () => {
    await refreshWallets();
    router.refresh();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gt-refresh-reference-data'));
    }
  };

  return (
    <section aria-label="Actions rapides financières" className="w-full space-y-2.5 my-3 sm:my-4">
      {/* Ligne 1 : ENTRANT (50%) & SORTANT (50%) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* BOUTON ENTRANT */}
        <Link
          href="/entrant"
          aria-label="Enregistrer un flux entrant ou revenu"
          className="group block w-full outline-hidden"
        >
          <EntrantButton />
        </Link>

        {/* BOUTON SORTANT */}
        <Link
          href="/sortant"
          aria-label="Enregistrer un flux sortant ou dépense"
          className="group block w-full outline-hidden"
        >
          <SortantButton />
        </Link>
      </div>

      {/* Ligne 2 : VIREMENT INTERNE (100% pleine largeur, déclenchant la TransferModal) */}
      <button
        type="button"
        onClick={() => setIsTransferModalOpen(true)}
        aria-label="Effectuer un virement interne entre portefeuilles"
        className="group block w-full outline-hidden"
      >
        <div className="w-full bg-[#2563EB] border-2 border-[#111827] dark:border-[#334155] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-2 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0px_0px_#111827] dark:group-hover:shadow-[4px_4px_0px_0px_#000000] group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none cursor-pointer">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-lg shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB] stroke-3" />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-white truncate">
              VIREMENT INTERNE
            </span>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-black text-[#111827] dark:text-white px-2 py-0.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-white rounded-md shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000]">
            ⇄
          </span>
        </div>
      </button>

      {/* MODAL VIREMENT INTERNE */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onSuccess={handleTransferSuccess}
      />
    </section>
  );
}
