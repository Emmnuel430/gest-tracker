'use client';

import React, { useTransition } from 'react';
import { Edit2, Trash2, ArrowRightLeft, Star, Smartphone, CreditCard, Banknote, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { WalletItem, deleteWalletAction } from '@/actions/wallets';

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

  const handleDelete = () => {
    if (!confirm(`Supprimer le portefeuille "${wallet.name}" ? Vos transactions passées seront conservées.`)) return;
    startTransition(async () => {
      const res = await deleteWalletAction(wallet.id);
      if (res.success) onRefresh();
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
    <div className="p-4 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3 transition-all">
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
            </div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Boutons actions */}
        <div className="flex items-center gap-1 shrink-0">
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
            onClick={handleDelete}
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
      <button
        type="button"
        onClick={() => onTransfer(wallet.id)}
        className="w-full py-2 px-3 bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] text-[#111827] dark:text-[#F8FAFC] hover:text-[#111827] font-black text-xs uppercase rounded-xl border-2 border-[#111827] dark:border-[#334155] hover:border-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
      >
        <ArrowRightLeft className="w-3.5 h-3.5 stroke-2.5" />
        Faire un virement depuis ce compte
      </button>
    </div>
  );
}
