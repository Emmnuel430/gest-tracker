'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories';
import { PAYMENT_METHODS, PAYMENT_METHOD_THEMES } from '@/constants/payment-methods';
import { createTransactionAction } from '@/actions/transactions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_CONFIG } from '@/constants/config';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  type: 'INCOME' | 'EXPENSE';
}

export function TransactionForm({ type }: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isIncome = type === 'INCOME';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || '');
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0] || 'Wave');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Status & Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const numericAmount = parseFloat(amount.replace(/\s+/g, ''));
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant supérieur à 0');
      return;
    }

    startTransition(async () => {
      const response = await createTransactionAction({
        type,
        amount: numericAmount,
        category,
        payment,
        date: new Date(date),
        note: note || undefined,
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Opération enregistrée avec succès !');
        // Redirection après 800ms pour savourer le feedback
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 800);
      } else {
        setErrorMessage(response.error);
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 font-black text-xs uppercase px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all">
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          Retour Accueil
        </Link>

        <span
          className={cn(
            'text-xs font-black uppercase px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]',
            isIncome ? 'bg-[#00DF81] text-black' : 'bg-[#FF5964] text-white'
          )}
        >
          {isIncome ? 'Nouveau Revenu' : 'Nouvelle Dépense'}
        </span>
      </div>

      {/* Carte du Formulaire Néobrutaliste */}
      <div className="bg-white border-3 border-black rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_0px_#000]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MONTANT GÉANT */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Montant ({APP_CONFIG.currency}) *
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-black bg-[#FFFDEB] border-3 border-black rounded-xl p-4 pr-20 shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:shadow-[6px_6px_0px_0px_#000] transition-all"
              />
              <span className="absolute right-4 font-black text-sm uppercase px-2.5 py-1 bg-black text-white rounded-md">
                {APP_CONFIG.currency}
              </span>
            </div>
            {fieldErrors.amount && (
              <p className="text-xs font-bold text-[#FF5964] mt-1.5">
                ⚠️ {fieldErrors.amount[0]}
              </p>
            )}
          </div>

          {/* SÉLECTEUR DE CATÉGORIES TACTILE */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Catégorie *
            </label>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1 border-2 border-black rounded-xl bg-neutral-50 shadow-[2px_2px_0px_0px_#000]">
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-black transition-all cursor-pointer select-none',
                      isSelected
                        ? isIncome
                          ? 'bg-[#00DF81] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                          : 'bg-[#FF5964] text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SÉLECTEUR MOYEN DE PAIEMENT */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Moyen de paiement *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = payment === pm;
                const theme = PAYMENT_METHOD_THEMES[pm] || { bg: '#FFF', text: '#000' };
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPayment(pm)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-black transition-all cursor-pointer select-none flex items-center justify-between',
                      isSelected
                        ? 'shadow-[3px_3px_0px_0px_#000] -translate-y-0.5 ring-2 ring-black'
                        : 'bg-white hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                    )}
                    style={isSelected ? { backgroundColor: theme.bg, color: theme.text } : {}}
                  >
                    <span className="truncate">{pm}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DATE & NOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                Date de l'opération
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                Note / Description (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Restaurant avec Paul"
                value={note}
                maxLength={250}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-medium text-black shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
              />
            </div>
          </div>

          {/* RETOURS D'ERREUR OU SUCCÈS */}
          {errorMessage && (
            <div className="p-3 bg-[#FFEAEB] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-[#FF3847]">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#E1FCEF] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-xs font-black text-[#008A50] flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              {successMessage}
            </div>
          )}

          {/* BOUTON D'ACTION PRINCIPAL */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            variant={isIncome ? 'success' : 'danger'}
            disabled={isPending}
            className="text-base py-4"
          >
            {isPending ? (
              'Enregistrement...'
            ) : isIncome ? (
              '＋ Enregistrer ce Revenu'
            ) : (
              '− Enregistrer cette Dépense'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
