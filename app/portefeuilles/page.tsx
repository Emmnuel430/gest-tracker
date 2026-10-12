'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowRightLeft, RefreshCw, Wallet as WalletIcon, Layers } from 'lucide-react';
import { WalletItem, getWalletsAction } from '@/actions/wallets';
import { WalletCard } from '@/components/wallets/WalletCard';
import { WalletModal } from '@/components/wallets/WalletModal';
import { TransferModal } from '@/components/wallets/TransferModal';
import { formatCurrency } from '@/constants/config';
import { Button } from '@/components/ui/Button';

export default function PortefeuillesPage() {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [defaultTransferSourceId, setDefaultTransferSourceId] = useState<string | undefined>(undefined);

  const loadWallets = async () => {
    setLoading(true);
    const res = await getWalletsAction();
    if (res.success && res.data) {
      setWallets(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWallets();
  }, []);

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

  // Calcul du solde total cumulé de tous les portefeuilles
  const totalWealth = wallets.reduce((sum, w) => sum + w.currentBalance, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] pb-24 transition-colors">
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation & Actions d'en-tête */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-black uppercase text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-2 rounded-lg border-2 border-transparent hover:border-[#111827] dark:hover:border-white"
          >
            <ArrowLeft className="w-4 h-4 stroke-3" />
            Accueil
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

        {/* Titre & Description */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Portefeuilles & Comptes
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1">
            Suivez la répartition réelle de votre argent (Espèces, Wave, Banque) et effectuez des virements internes.
          </p>
        </div>

        {/* Synthèse du Patrimoine Total */}
        <div className="p-5 bg-[#111827] dark:bg-[#1E293B] text-white border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#2563EB] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Patrimoine Total Réuni
            </span>
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded">
              {wallets.length} compte(s)
            </span>
          </div>
          <div className="text-3xl font-black text-[#FFE600] tracking-tight">
            {formatCurrency(totalWealth)}
          </div>
          <p className="text-[11px] text-neutral-400 font-medium">
            Somme nette calculée en direct sur l’ensemble de vos portefeuilles.
          </p>
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
                Créez vos portefeuilles (Espèces, Wave, Orange Money, Banque) pour savoir exactement où se trouve votre argent.
              </p>
            </div>
            <Button onClick={handleOpenCreate} variant="primary" className="text-xs uppercase">
              <Plus className="w-4 h-4 mr-1.5 stroke-3" />
              Créer mon premier compte
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500 dark:text-neutral-400 px-1">
              <span>Répartition des soldes</span>
              <span className="text-[11px] font-bold">{wallets.length} portefeuille(s)</span>
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
      </main>

      {/* Modale Portefeuille */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSuccess={loadWallets}
        initialData={selectedWallet}
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
