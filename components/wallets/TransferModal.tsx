'use client';

import React, { useState, useTransition } from 'react';
import { X, ArrowRight, Zap } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { WalletItem, transferBetweenWalletsAction } from '@/actions/wallets';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallets: WalletItem[];
  defaultSourceId?: string;
}

export function TransferModal({
  isOpen,
  onClose,
  onSuccess,
  wallets,
  defaultSourceId,
}: TransferModalProps) {
  const [isPending, startTransition] = useTransition();

  const [sourceId, setSourceId] = useState<string>(
    defaultSourceId || wallets[0]?.id || ''
  );
  const [targetId, setTargetId] = useState<string>(
    wallets.find((w) => w.id !== (defaultSourceId || wallets[0]?.id))?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const sourceWallet = wallets.find((w) => w.id === sourceId);
  const targetWallet = wallets.find((w) => w.id === targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sourceId || !targetId) {
      setErrorMessage('Veuillez sélectionner les deux comptes concernés');
      return;
    }

    if (sourceId === targetId) {
      setErrorMessage('Le compte émetteur et le compte récepteur doivent être différents');
      return;
    }

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant supérieur à 0 FCFA');
      return;
    }

    startTransition(async () => {
      const res = await transferBetweenWalletsAction({
        sourceWalletId: sourceId,
        targetWalletId: targetId,
        amount: numericAmount,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-lg">
              <Zap className="w-4 h-4 stroke-2.5" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
              Virement Interne
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-[#131C31] border-2 border-transparent hover:border-[#111827] dark:hover:border-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300 stroke-2.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source ➔ Cible */}
          <div className="grid grid-cols-2 gap-2">
            {/* Source */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                Depuis (Débit)
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] cursor-pointer"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Cible */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                Vers (Crédit)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] cursor-pointer"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Montant à transférer (FCFA)
            </label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="Ex: 50 000"
              autoFocus
            />
          </div>

          {/* Description optionnelle */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Motif du virement (optionnel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Retrait Wave pour courses, virement épargne..."
              className="w-full px-3 py-2 text-xs font-medium border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]"
            />
          </div>

          {/* Récapitulatif pédagogique */}
          <div className="p-3 bg-neutral-100 dark:bg-[#0F172A] border-2 border-dashed border-neutral-300 dark:border-[#334155] rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400">
            ℹ️ Ce mouvement est un <strong>virement interne</strong> : il n&apos;impacte ni vos revenus ni vos dépenses du mois. Votre solde net global reste inchangé.
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-100 dark:bg-red-950/40 border-2 border-red-500 rounded-lg text-xs font-bold text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 text-xs font-black uppercase rounded-xl border-2 border-[#111827] dark:border-[#334155] hover:bg-neutral-100 dark:hover:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC] transition-all cursor-pointer"
            >
              Annuler
            </button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              className="flex-1 py-2.5 text-xs uppercase"
            >
              <ArrowRight className="w-3.5 h-3.5 mr-1" />
              Transférer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
