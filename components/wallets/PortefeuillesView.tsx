'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowRightLeft, RefreshCw, Wallet as WalletIcon } from 'lucide-react';
import { WalletItem, NetWorthSummary, getWalletsAction, getNetWorthAction } from '@/actions/wallets';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { TransferModal } from '@/components/wallets/TransferModal';
import { formatCurrency } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

export function PortefeuillesView() {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [netWorthData, setNetWorthData] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [defaultTransferSourceId, setDefaultTransferSourceId] = useState<string | undefined>(undefined);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const loadWallets = useCallback(async (includeArchived = showArchived) => {
    setLoading(true);
    const [walletsRes, netWorthRes] = await Promise.all([
      getWalletsAction({ includeArchived }),
      getNetWorthAction(),
    ]);

    if (walletsRes.success && walletsRes.data) {
      setWallets(walletsRes.data);
    }
    if (netWorthRes.success && netWorthRes.data) {
      setNetWorthData(netWorthRes.data);
    }
    setLoading(false);
  }, [showArchived]);

  useEffect(() => {
    loadWallets(showArchived);
  }, [loadWallets, showArchived]);

  const handleOpenCreate = () => {
    setSelectedWallet(null);
    setWalletModalOpen(true);
  };

  const handleEdit = (w: WalletItem) => {
    setSelectedWallet(w);
    setWalletModalOpen(true);
  };

  const handleOpenTransfer = (sourceId?: string) => {
    setDefaultTransferSourceId(sourceId);
    setTransferModalOpen(true);
  };

  // Patrimoine net total immuable calculé côté serveur (conformément à ADR-02 et Q10)
  const totalWealth = netWorthData
    ? netWorthData.netWorth
    : wallets.reduce((sum, w) => sum + w.currentBalance, 0);

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Navigation & Actions d'en-tête */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          href="/gestion"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Gestion</span>
        </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenTransfer()}
              variant="warning"
              size="sm"
              className="text-xs uppercase"
            >
              <ArrowRightLeft className="w-4 h-4 mr-1 stroke-3" />
              Virement
            </Button>
            <Button
              onClick={handleOpenCreate}
              variant="primary"
              size="sm"
              className="text-xs uppercase"
            >
              <Plus className="w-4 h-4 mr-1 stroke-3" />
              Nouveau compte
            </Button>
          </div>
        </div>

        {/* Titre épuré */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Portefeuilles
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
            Répartition de votre trésorerie et virements internes.
          </p>
        </div>

        {/* Synthèse du Patrimoine Total */}
        <div className="p-5 bg-[#111827] dark:bg-[#1E293B] text-white border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#2563EB] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Patrimoine Total
              </span>
              <InfoTooltip
                title="Patrimoine Total"
                content="Somme de l'ensemble de vos comptes actifs, archivés et opérations historiques conservées."
              />
            </div>
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded">
              {netWorthData ? netWorthData.walletCount : wallets.length} compte(s)
            </span>
          </div>

          <div className="text-3xl font-black text-[#FFE600] tracking-tight">
            {formatCurrency(totalWealth)}
          </div>

          {/* Badges contextuels discrets uniquement si nécessaire */}
          {netWorthData && (netWorthData.archivedBalance > 0 || netWorthData.unassignedBalance !== 0) && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/10 text-[10px] font-bold">
              {netWorthData.archivedBalance > 0 && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                  Archivés : {formatCurrency(netWorthData.archivedBalance)}
                </span>
              )}
              {netWorthData.unassignedBalance !== 0 && (
                <span className="px-2 py-0.5 rounded bg-[#FBBF24]/20 text-[#FBBF24]">
                  Sans compte : {formatCurrency(netWorthData.unassignedBalance)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Liste des comptes */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Chargement des portefeuilles...
          </div>
        ) : wallets.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1E293B] border-3 border-dashed border-[#111827] dark:border-[#334155] rounded-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#2563EB] text-white flex items-center justify-center border-2 border-[#111827]">
              <WalletIcon className="w-6 h-6 stroke-2.5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Aucun compte configuré
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                Ajoutez vos comptes (Espèces, Mobile Money, Banque) pour suivre vos soldes.
              </p>
            </div>
            <Button onClick={handleOpenCreate} variant="primary" className="text-xs uppercase">
              <Plus className="w-4 h-4 mr-1.5 stroke-3" />
              Créer mon premier compte
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500 dark:text-neutral-400 px-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span>Répartition des soldes</span>
                <span className="text-[11px] font-bold">({wallets.length} compte(s))</span>
              </div>
              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  showArchived
                    ? 'bg-[#111827] text-white border-[#111827] dark:bg-white dark:text-[#111827]'
                    : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-[#111827]'
                }`}
              >
                {showArchived ? 'Masquer les comptes archivés' : 'Afficher les comptes archivés'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  totalAllWallets={totalWealth}
                  onEdit={handleEdit}
                  onTransfer={handleOpenTransfer}
                  onRefresh={loadWallets}
                />
              ))}
            </div>
          </div>
        )}

      {/* Modale Portefeuille */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSuccess={loadWallets}
        initialData={selectedWallet}
        existingWallets={wallets}
      />

      {/* Modale Virement */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={loadWallets}
        wallets={wallets}
        defaultSourceId={defaultTransferSourceId}
      />
    </div>
  );
}
