'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/constants/categories';
import { PAYMENT_METHODS } from '@/constants/payment-methods';
import { updateTransactionAction } from '@/actions/transactions';
import { parseAmountInput, formatAmountInput } from '@/constants/config';
import { formatDateForInput, formatTimeForInput, combineDateAndTime } from '@/lib/dates';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: Transaction) => void;
}

export function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onUpdated,
}: EditTransactionModalProps) {
  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'opération">
      <EditForm transaction={transaction} onClose={onClose} onUpdated={onUpdated} />
    </Modal>
  );
}

function EditForm({
  transaction,
  onClose,
  onUpdated,
}: {
  transaction: Transaction;
  onClose: () => void;
  onUpdated: (updated: Transaction) => void;
}) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(transaction.type);
  const [amount, setAmount] = useState(() => formatAmountInput(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [payment, setPayment] = useState(transaction.payment);

  // Sélecteur date & heure toujours visible et pré-rempli en édition
  const [date, setDate] = useState(() => formatDateForInput(transaction.date));
  const [time, setTime] = useState(() => formatTimeForInput(transaction.date));

  const [note, setNote] = useState(transaction.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const currentCatColor = CATEGORY_COLORS[category] || '#2563EB';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseAmountInput(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez renseigner un montant valide supérieur à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDate = combineDateAndTime(date, time);

      const res = await updateTransactionAction({
        id: transaction.id,
        type,
        amount: parsedAmount,
        category,
        payment,
        date: finalDate,
        note: note.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || 'Erreur lors de la mise à jour.');
        setIsSubmitting(false);
        return;
      }

      onUpdated(res.data as Transaction);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg text-xs font-bold text-[#DC2626]">
          ⚠️ {error}
        </div>
      )}

      {/* Type Toggle */}
      <div>
        <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
          Type d'opération
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setCategory(INCOME_CATEGORIES[0]);
            }}
            className={`py-2 px-3 border-2 border-[#111827] dark:border-white rounded-lg font-black text-xs uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] ${
              type === 'INCOME'
                ? 'bg-[#16A34A] text-white'
                : 'bg-white dark:bg-[#131C31] text-[#111827] dark:text-neutral-300'
            }`}
          >
            Entrant (Revenu)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
            className={`py-2 px-3 border-2 border-[#111827] dark:border-white rounded-lg font-black text-xs uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] ${
              type === 'EXPENSE'
                ? 'bg-[#DC2626] text-white'
                : 'bg-white dark:bg-[#131C31] text-[#111827] dark:text-neutral-300'
            }`}
          >
            Sortant (Dépense)
          </button>
        </div>
      </div>

      {/* Montant avec formatage dynamique en points */}
      <CurrencyInput
        label="Montant (FCFA) *"
        value={amount}
        onChange={(val) => setAmount(val)}
        placeholder="5.000"
        required
      />

      {/* Catégorie */}
      <div>
        <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
          Catégorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-white rounded-xl p-3 font-bold text-sm shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-[#111827] dark:border-white"
            style={{ backgroundColor: currentCatColor }}
          />
          <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">{category}</span>
        </div>
      </div>

      {/* Moyen de paiement */}
      <div>
        <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
          Moyen de paiement
        </label>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-white rounded-xl p-3 font-bold text-sm shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B]"
        >
          {PAYMENT_METHODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Heure toujours visibles en édition (pré-remplis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-white rounded-lg p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B]"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
            Heure
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-white rounded-lg p-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B]"
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-black uppercase mb-1 text-[#111827] dark:text-[#F8FAFC]">
          Note (Optionnelle)
        </label>
        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: Resto avec des collègues"
          maxLength={250}
          className="dark:bg-[#131C31] dark:text-white dark:border-[#334155]"
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="neutral"
          className="flex-1"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isSubmitting}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
