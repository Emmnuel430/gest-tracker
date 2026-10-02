'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories';
import { PAYMENT_METHODS } from '@/constants/payment-methods';
import { updateTransactionAction } from '@/actions/transactions';
import { formatDisplayDate } from '@/lib/dates';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la transaction">
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
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [payment, setPayment] = useState(transaction.payment);
  const [date, setDate] = useState(
    new Date(transaction.date).toISOString().split('T')[0]
  );
  const [note, setNote] = useState(transaction.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez renseigner un montant valide supérieur à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateTransactionAction({
        id: transaction.id,
        type,
        amount: parsedAmount,
        category,
        payment,
        date: new Date(date),
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
        <div className="p-3 bg-[#FFEAEB] border-2 border-black rounded-lg text-xs font-bold text-[#FF3847]">
          {error}
        </div>
      )}

      {/* Type Toggle */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Type d'opération</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setCategory(INCOME_CATEGORIES[0]);
            }}
            className={`py-2 px-3 border-2 border-black rounded-lg font-black text-xs uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000] ${
              type === 'INCOME' ? 'bg-[#00DF81] text-black' : 'bg-white text-neutral-600'
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
            className={`py-2 px-3 border-2 border-black rounded-lg font-black text-xs uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000] ${
              type === 'EXPENSE' ? 'bg-[#FF3847] text-white' : 'bg-white text-neutral-600'
            }`}
          >
            Sortant (Dépense)
          </button>
        </div>
      </div>

      {/* Montant */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Montant (FCFA)</label>
        <Input
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ex: 5000"
          required
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Catégorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white border-2 border-black rounded-xl p-3 font-bold text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Moyen de paiement */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Moyen de paiement</label>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full bg-white border-2 border-black rounded-xl p-3 font-bold text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
        >
          {PAYMENT_METHODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-black uppercase mb-1">Note (Optionnelle)</label>
        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: Resto avec des collègues"
          maxLength={250}
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
