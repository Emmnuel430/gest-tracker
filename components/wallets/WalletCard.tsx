'use client';

import React, { useState, useTransition } from 'react';
import {
  Edit2,
  Trash2,
  ArrowRightLeft,
  Star,
  Smartphone,
  CreditCard,
  Banknote,
  PiggyBank,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { WalletItem, deleteWalletAction, archiveWalletAction } from '@/actions/wallets';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface WalletCardProps {
  wallet: WalletItem;
  totalAllWallets: number;
  onEdit: (wallet: WalletItem) => void;
  onTransfer: (sourceWalletId: string) => void;
  onRefresh: () => void;
}

export function WalletCard({
  wallet,
  totalAllWallets,
  onEdit,
  onTransfer,
  onRefresh,
}: WalletCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteWalletAction(wallet.id);
      if (!res.success) {
        setIsDeleteDialogOpen(false);
        setActionErrorMessage(res.error || 'Impossible de supprimer ce compte.');
        return;
      }
      setIsDeleteDialogOpen(false);
      onRefresh();
    });
  };

  const confirmToggleArchive = () => {
    const nextArchived = !wallet.isArchived;
    startTransition(async () => {
      const res = await archiveWalletAction(wallet.id, nextArchived);
      if (!res.success) {
        setIsArchiveDialogOpen(false);
        setActionErrorMessage(res.error || 'Erreur lors de la mise à jour du portefeuille.');
        return;
      }
      setIsArchiveDialogOpen(false);
      onRefresh();
    });
  };

  // Calcul du % du patrimoine
  const sharePercentage =
    totalAllWallets > 0 && wallet.currentBalance > 0
      ? Math.round((wallet.currentBalance / totalAllWallets) * 100)
      : 0;

  // Icône selon le type
  let TypeIcon = Banknote;
  let typeLabel = 'Espèces';
  if (wallet.type === 'MOBILE_MONEY') {
    TypeIcon = Smartphone;
    typeLabel = 'Mobile Money';
  } else if (wallet.type === 'BANK') {
    TypeIcon = CreditCard;
    typeLabel = 'Banque';
  } else if (wallet.type === 'SAVINGS') {
    TypeIcon = PiggyBank;
    typeLabel = 'Épargne';
  }

  return (
    <div
      className={`p-4 rounded-2xl border-3 transition-all space-y-3 ${
        wallet.isArchived
          ? 'bg-neutral-50 dark:bg-[#1E293B]/60 border-dashed border-neutral-400 dark:border-neutral-600 opacity-80'
          : 'bg-white dark:bg-[#1E293B] border-[#111827] dark:border-[#334155] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl border-2 border-[#111827] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#111827]"
            style={{ backgroundColor: wallet.color }}
          >
            <TypeIcon className="w-4 h-4 stroke-2.5 text-[#111827]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black text-sm text-[#111827] dark:text-[#F8FAFC]">
                {wallet.name}
              </h4>
              {wallet.isDefault && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#FFE600] text-[#111827] border border-[#111827] flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#111827]" />
                  Principal
                </span>
              )}
              {wallet.isArchived && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-[#111827] dark:border-neutral-500">
                  Archivé
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Boutons actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!wallet.isDefault && (
            <button
              type="button"
              onClick={() => setIsArchiveDialogOpen(true)}
              disabled={isPending}
              title={wallet.isArchived ? 'Désarchiver' : 'Archiver'}
              className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-neutral-200 dark:hover:bg-[#1E293B] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
            >
              {wallet.isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5 stroke-2.5" />
              ) : (
                <Archive className="w-3.5 h-3.5 stroke-2.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(wallet)}
            disabled={isPending}
            title="Modifier"
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] text-[#111827] dark:text-[#F8FAFC] transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isPending}
            title="Supprimer"
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-red-500 hover:text-white text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
        </div>
      </div>

      {/* Solde & part du patrimoine */}
      <div className="pt-1">
        <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block">
          Solde disponible
        </span>
        <div
          className={`text-2xl font-black ${
            wallet.currentBalance >= 0 ? 'text-[#111827] dark:text-[#F8FAFC]' : 'text-[#FF3366]'
          }`}
        >
          {formatCurrency(wallet.currentBalance)}
        </div>
        {sharePercentage > 0 && (
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
            Représente {sharePercentage}% de votre solde global
          </span>
        )}
      </div>

      {/* Détail entrées / sorties */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-neutral-100 dark:border-[#334155] text-[11px] font-bold">
        <div>
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block">Entrées nettes</span>
          <span className="text-[#00DF81]">+{formatCurrency(wallet.totalIncome)}</span>
        </div>
        <div>
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block">Sorties nettes</span>
          <span className="text-[#FF3366]">-{formatCurrency(wallet.totalExpense)}</span>
        </div>
      </div>

      {/* Bouton virement rapide depuis ce compte */}
      {!wallet.isArchived && (
        <button
          type="button"
          onClick={() => onTransfer(wallet.id)}
          className="w-full py-2 px-3 bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] text-[#111827] dark:text-[#F8FAFC] hover:text-[#111827] font-black text-xs uppercase rounded-xl border-2 border-[#111827] dark:border-[#334155] hover:border-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 stroke-2.5" />
          Faire un virement depuis ce compte
        </button>
      )}

      {/* Modale de confirmation de suppression */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Supprimer le portefeuille"
        message={`Supprimer définitivement le portefeuille "${wallet.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={isPending}
        loadingLabel="Suppression..."
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Modale de confirmation d'archivage / désarchivage */}
      <ConfirmDialog
        isOpen={isArchiveDialogOpen}
        title={wallet.isArchived ? 'Désarchiver le portefeuille' : 'Archiver le portefeuille'}
        message={
          wallet.isArchived
            ? `Désarchiver le portefeuille "${wallet.name}" ? Il sera de nouveau proposé pour vos opérations.`
            : `Archiver le portefeuille "${wallet.name}" ? Il ne sera plus proposé pour les nouvelles opérations.`
        }
        confirmLabel={wallet.isArchived ? 'Désarchiver' : 'Archiver'}
        cancelLabel="Annuler"
        variant="warning"
        isLoading={isPending}
        loadingLabel={wallet.isArchived ? 'Désarchivage...' : 'Archivage...'}
        onCancel={() => setIsArchiveDialogOpen(false)}
        onConfirm={confirmToggleArchive}
      />

      {/* Modale d'erreur d'action */}
      <ConfirmDialog
        isOpen={actionErrorMessage !== null}
        title="Action impossible"
        message={actionErrorMessage || ''}
        confirmLabel="Compris"
        cancelLabel="Fermer"
        variant="danger"
        onCancel={() => setActionErrorMessage(null)}
        onConfirm={() => setActionErrorMessage(null)}
      />
    </div>
  );
}
