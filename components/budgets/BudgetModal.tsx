'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { X, Sparkles, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCategories } from '@/components/providers/ReferenceDataProvider';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput } from '@/constants/config';
import { upsertBudgetAction } from '@/actions/budgets';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMonth: string;
  initialData?: {
    id?: string;
    category: string;
    amount: number;
  } | null;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  currentMonth,
  initialData,
}: BudgetModalProps) {
  const { categories: expenseCategories } = useCategories('EXPENSE');
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState<string>(
    initialData?.category || ''
  );
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.category) {
      setCategory(initialData.category);
    } else if (expenseCategories.length > 0 && !category) {
      setCategory(expenseCategories[0].name);
    }
  }, [initialData, expenseCategories, category]);

  if (!isOpen) return null;

  const selectedCatObj = expenseCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant supérieur à 0 FCFA');
      return;
    }

    startTransition(async () => {
      const res = await upsertBudgetAction({
        category,
        categoryId: selectedCatObj?.id || null,
        amount: numericAmount,
        month: currentMonth,
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
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {initialData ? 'Modifier le budget' : 'Nouveau budget mensuel'}
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
          {/* 1. Sélection de la catégorie */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-2">
              Catégorie de dépense
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]">
              {expenseCategories.map((cat) => {
                const isSelected = category === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] bg-white dark:bg-[#1E293B] -translate-y-0.5'
                        : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 bg-transparent'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-[#111827] dark:border-white"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-[#111827] dark:text-[#F8FAFC]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Plafond mensuel en FCFA */}
          <div>
            <CurrencyInput
              label="Plafond mensuel (FCFA)"
              value={amount}
              onChange={setAmount}
              placeholder="ex: 60.000"
              required
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] text-xs font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="neutral"
              size="md"
              fullWidth
              disabled={isPending}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isPending}
            >
              {isPending ? (
                'Enregistrement...'
              ) : initialData ? (
                'Mettre à jour'
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <span>Créer le budget</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
