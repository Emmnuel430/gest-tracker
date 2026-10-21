'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { X, Calendar, Sparkles, Bell } from 'lucide-react';
import { useCategories, useWallets } from '@/components/providers/ReferenceDataProvider';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput } from '@/constants/config';
import { upsertRecurringRuleAction, RecurringRuleItem } from '@/actions/recurring';
import { formatDayOfMonthLabel } from '@/lib/recurring';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RecurringRuleItem | null;
}

export function RecurringModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: RecurringModalProps) {
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(
    initialData?.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
  );
  const { categories: userCategories, getCategoryColor, refreshCategories } = useCategories(type);
  const { wallets: userWallets, defaultWallet, refreshWallets } = useWallets();

  useEffect(() => {
    if (isOpen) {
      if (userCategories.length === 0) {
        void refreshCategories();
      }
      if (userWallets.length === 0) {
        void refreshWallets();
      }
    }
  }, [isOpen, userCategories.length, userWallets.length, refreshCategories, refreshWallets]);

  const [amount, setAmount] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ''
  );
  const [category, setCategory] = useState<string>(
    initialData?.category || ''
  );
  const [payment, setPayment] = useState<string>(
    initialData?.payment || ''
  );
  const [walletId, setWalletId] = useState<string>(
    initialData?.walletId || ''
  );
  const [dayOfMonth, setDayOfMonth] = useState<number>(
    initialData?.dayOfMonth || 5
  );
  const [note, setNote] = useState<string>(
    initialData?.note || ''
  );
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(
    initialData?.remindersEnabled ?? true
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.category) {
      setCategory(initialData.category);
    } else if (userCategories.length > 0 && !category) {
      setCategory(userCategories[0].name);
    }
    if (initialData) {
      setRemindersEnabled(initialData.remindersEnabled ?? true);
    }
  }, [initialData, userCategories, category]);

  useEffect(() => {
    if (initialData?.walletId) {
      setWalletId(initialData.walletId);
    } else if (userWallets.length > 0 && !walletId) {
      const match = payment
        ? userWallets.find((w) => w.name.toLowerCase() === payment.toLowerCase())
        : defaultWallet || userWallets[0];
      if (match) {
        setWalletId(match.id);
        setPayment(match.name);
      }
    }
  }, [initialData, userWallets, defaultWallet, payment, walletId]);

  if (!isOpen) return null;

  const selectedCatObj = userCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );

  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME') => {
    setType(newType);
    setCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant valide supérieur à 0 FCFA');
      return;
    }

    if (dayOfMonth < 1 || dayOfMonth > 31) {
      setErrorMessage('Le jour du mois doit être compris entre 1 et 31');
      return;
    }

    startTransition(async () => {
      const res = await upsertRecurringRuleAction({
        id: initialData?.id,
        type,
        amount: numericAmount,
        category,
        categoryId: selectedCatObj?.id || null,
        payment,
        walletId: walletId || null,
        dayOfMonth,
        frequency: 'MONTHLY',
        note: note.trim() || undefined,
        isActive: initialData ? initialData.isActive : true,
        remindersEnabled,
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
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {initialData ? 'Modifier l’opération récurrente' : 'Nouvelle charge / rentrée récurrente'}
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
          {/* 1. Sélecteur Type (Sortie ou Entrée) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-[#FF3366] text-white border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Dépense récurrente
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-[#00DF81] text-[#111827] border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Revenu récurrent
            </button>
          </div>

          {/* 2. Montant */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Montant récurrent (FCFA)
            </label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="Ex: 150 000"
              autoFocus
            />
          </div>

          {/* 3. Jour de l'échéance dans le mois */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Jour du mois : {formatDayOfMonthLabel(dayOfMonth).toLowerCase()}
              </label>
              <div className="flex gap-1">
                {[1, 5, 10, 25, 28].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDayOfMonth(day)}
                    className={`px-1.5 py-0.5 text-[10px] font-black rounded border border-[#111827] dark:border-[#475569] ${
                      dayOfMonth === day
                        ? 'bg-[#FFE600] text-[#111827]'
                        : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
              className="w-full accent-[#00DF81] cursor-pointer"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Rappel mensuel programmé {formatDayOfMonthLabel(dayOfMonth).toLowerCase()}.
            </p>
          </div>

          {/* 4. Catégorie */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1.5">
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]">
              {userCategories.map((cat) => {
                const isSelected = category.toLowerCase() === cat.name.toLowerCase();
                const catColor = cat.color || getCategoryColor(cat.name);

                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-2 rounded-lg text-left text-xs font-bold border-2 transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-[#111827] dark:border-white bg-white dark:bg-[#1E293B] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
                        : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-[#111827]"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Moyen de paiement / Portefeuille */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1.5">
              Portefeuille / Moyen de paiement
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {userWallets.map((w) => {
                const isSelected = walletId === w.id || payment.toLowerCase() === w.name.toLowerCase();
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setWalletId(w.id);
                      setPayment(w.name);
                    }}
                    className={`p-2 rounded-lg text-left text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#111827] dark:border-white bg-[#00DF81] text-[#111827] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
                        : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border border-[#111827]"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="truncate">{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Note descriptive */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Description / Libellé (optionnel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Loyer 2 pièces, Abonnement Netflix, Salaire Net..."
              className="w-full px-3 py-2 text-xs font-medium border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#00DF81]"
            />
          </div>

          {/* 7. Rappels par e-mail */}
          <div className="p-3 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-start gap-3">
            <input
              id="remindersEnabled"
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#00DF81] rounded border-2 border-[#111827] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="remindersEnabled" className="text-xs cursor-pointer select-none">
              <span className="font-black uppercase text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                Rappels e-mail automatiques
              </span>
              <span className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mt-0.5">
                Recevoir des alertes par e-mail à J-7, J-3 et le jour de l’échéance (J0).
              </span>
            </label>
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
              {initialData ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
