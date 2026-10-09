'use client';

import React, { useState, useTransition } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { DebtItem, recordDebtRepaymentAction } from '@/actions/debts';

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
  const [amount, setAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !debt) return null;

  const handleSettleFull = () => {
    setAmount(debt.remainingAmount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant valide supérieur à 0 FCFA');
      return;
    }

    startTransition(async () => {
      const res = await recordDebtRepaymentAction(debt.id, numericAmount);
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
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Enregistrer un remboursement
          </h3>
          <button
            type="button"
            onClick={onClose}
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
