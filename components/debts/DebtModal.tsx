'use client';

import React, { useState, useTransition } from 'react';
import { X, Sparkles, User, Calendar } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput } from '@/constants/config';
import { createDebtAction } from '@/actions/debts';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DebtModal({ isOpen, onClose, onSuccess }: DebtModalProps) {
  const [isPending, startTransition] = useTransition();

  const [personName, setPersonName] = useState('');
  const [type, setType] = useState<'LENT' | 'BORROWED'>('LENT');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!personName.trim()) {
      setErrorMessage('Veuillez renseigner le nom de la personne');
      return;
    }

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez saisir un montant supérieur à 0 FCFA');
      return;
    }

    startTransition(async () => {
      const res = await createDebtAction({
        personName: personName.trim(),
        type,
        initialAmount: numericAmount,
        dueDate: dueDate || undefined,
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
          <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Nouveau dossier dette / prêt
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
          {/* 1. Sélecteur Type (Prêt ou Emprunt) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
            <button
              type="button"
              onClick={() => setType('LENT')}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                type === 'LENT'
                  ? 'bg-[#00DF81] text-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              On me doit (Prêt)
            </button>
            <button
              type="button"
              onClick={() => setType('BORROWED')}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                type === 'BORROWED'
                  ? 'bg-[#FF3366] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Je dois (Dette)
            </button>
          </div>

          {/* 2. Nom de la personne */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Nom de la personne
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Ex: Koffi, Aminata, Collègue Yao..."
              className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]"
              autoFocus
            />
          </div>

          {/* 3. Montant */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Montant initial (FCFA)
            </label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="Ex: 50 000"
            />
          </div>

          {/* 4. Date d'échéance prévue */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Date de remboursement prévue (optionnelle)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]"
            />
          </div>

          {/* 5. Note / Motif */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Motif / Note explicative
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Dépannage courses, avance loyer..."
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
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
