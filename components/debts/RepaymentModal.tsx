'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { X, CheckCircle2, Wallet } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { DebtItem, recordDebtRepaymentAction } from '@/actions/debts';
import { useWallets } from '@/components/providers/ReferenceDataProvider';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: DebtItem | null;
}

export function RepaymentModal({
  isOpen,
  onClose,
  onSuccess,
  debt,
}: RepaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const { wallets, defaultWallet, refreshWallets } = useWallets();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [impactWallet, setImpactWallet] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Réinitialisation systématique à chaque ouverture ou changement de dossier ([DEBT-04])
  useEffect(() => {
    if (!isOpen || !debt) return;
    setAmount('');
    setNote('');
    setErrorMessage(null);
    const preferredWalletId = debt.walletId || defaultWallet?.id || wallets[0]?.id || '';
    setWalletId(preferredWalletId);
    setImpactWallet(Boolean(debt.walletId));
  }, [isOpen, debt?.id, debt?.walletId, defaultWallet?.id, wallets]);

  // Fermeture clavier via Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen || !debt) return null;

  const isLent = debt.type === 'LENT';

  const handleSettleFull = () => {
    setAmount(debt.remainingAmount.toString());
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant valide supérieur à 0 FCFA');
      return;
    }

    if (numericAmount > debt.remainingAmount) {
      setErrorMessage(
        `Le montant saisi dépasse le reste dû (${formatCurrency(debt.remainingAmount)})`
      );
      return;
    }

    if (impactWallet && !walletId) {
      setErrorMessage('Veuillez sélectionner le portefeuille à impacter');
      return;
    }

    startTransition(async () => {
      const res = await recordDebtRepaymentAction(debt.id, numericAmount, {
        walletId: impactWallet ? walletId : null,
        note: note.trim() || null,
      });
      if (res.success) {
        if (impactWallet) {
          await refreshWallets();
        }
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="repayment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3
            id="repayment-modal-title"
            className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]"
          >
            Enregistrer un remboursement
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-1 hover:bg-neutral-100 dark:hover:bg-[#131C31] border-2 border-transparent hover:border-[#111827] dark:hover:border-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300 stroke-2.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl text-xs space-y-1">
            <div className="font-bold text-neutral-600 dark:text-neutral-400">
              Personne : <strong className="text-black dark:text-white">{debt.personName}</strong>
            </div>
            <div className="font-bold text-neutral-600 dark:text-neutral-400">
              Reste actuellement dû :{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(debt.remainingAmount)}
              </strong>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Montant remboursé (FCFA)
              </label>
              <button
                type="button"
                onClick={handleSettleFull}
                className="text-[10px] font-black uppercase bg-[#FFE600] px-2 py-0.5 rounded border border-[#111827] text-[#111827] cursor-pointer"
              >
                Tout solder
              </button>
            </div>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="Ex: 25 000"
              autoFocus
            />
          </div>

          {/* Pont comptable optionnel avec un Portefeuille ([DEBT-01]) */}
          {wallets.length > 0 && (
            <div className="p-3 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={impactWallet}
                  onChange={(e) => {
                    setImpactWallet(e.target.checked);
                    if (e.target.checked && !walletId) {
                      setWalletId(defaultWallet?.id || wallets[0]?.id || '');
                    }
                  }}
                  className="mt-0.5 w-4 h-4 accent-[#111827] rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-black uppercase text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    {isLent
                      ? 'Créditer un portefeuille'
                      : 'Débiter un portefeuille'}
                  </span>
                  <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isLent
                      ? 'Enregistre une entrée de trésorerie sur le compte choisi.'
                      : 'Enregistre une dépense de remboursement sur le compte choisi.'}
                  </span>
                </div>
              </label>

              {impactWallet && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-300 mb-1">
                    Portefeuille concerné
                  </label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC]"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatCurrency(w.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Note optionnelle du versement */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Note sur ce versement (optionnelle)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={250}
              placeholder="Ex: Versement Wave, 1re tranche..."
              className="w-full px-3 py-2 text-xs font-medium border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]"
            />
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
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Confirmer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
