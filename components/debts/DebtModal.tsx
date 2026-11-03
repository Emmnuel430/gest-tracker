'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { X, Sparkles, Wallet } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { createDebtAction, updateDebtAction, DebtItem } from '@/actions/debts';
import { useWallets } from '@/components/providers/ReferenceDataProvider';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: DebtItem | null;
}

export function DebtModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: DebtModalProps) {
  const [isPending, startTransition] = useTransition();
  const { wallets, defaultWallet, refreshWallets } = useWallets();

  const isEditMode = Boolean(initialData);

  const [personName, setPersonName] = useState('');
  const [type, setType] = useState<'LENT' | 'BORROWED'>('LENT');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [impactWallet, setImpactWallet] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronisation et réinitialisation systématique à l'ouverture ([DEBT-04])
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);

    if (initialData) {
      setPersonName(initialData.personName);
      setType(initialData.type);
      setAmount(initialData.initialAmount.toString());
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
      setNote(initialData.note || '');
      setImpactWallet(false);
      setWalletId('');
    } else {
      setPersonName('');
      setType('LENT');
      setAmount('');
      setDueDate('');
      setNote('');
      setImpactWallet(false);
      setWalletId(defaultWallet?.id || wallets[0]?.id || '');
    }
  }, [isOpen, initialData, defaultWallet?.id, wallets]);

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

  if (!isOpen) return null;

  const alreadyRepaid = initialData
    ? Math.max(0, initialData.initialAmount - initialData.remainingAmount)
    : 0;

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

    if (isEditMode && initialData && numericAmount < alreadyRepaid) {
      setErrorMessage(
        `Le montant initial ne peut pas être inférieur au montant déjà remboursé (${formatCurrency(alreadyRepaid)})`
      );
      return;
    }

    if (!isEditMode && impactWallet && !walletId) {
      setErrorMessage('Veuillez sélectionner le portefeuille à impacter');
      return;
    }

    startTransition(async () => {
      const res =
        isEditMode && initialData
          ? await updateDebtAction({
              id: initialData.id,
              personName: personName.trim(),
              type,
              initialAmount: numericAmount,
              dueDate: dueDate || null,
              note: note.trim() || null,
            })
          : await createDebtAction({
              personName: personName.trim(),
              type,
              initialAmount: numericAmount,
              dueDate: dueDate || undefined,
              note: note.trim() || undefined,
              walletId: impactWallet ? walletId : null,
            });

      if (res.success) {
        if (!isEditMode && impactWallet) {
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
      aria-labelledby="debt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3
            id="debt-modal-title"
            className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]"
          >
            {isEditMode ? 'Modifier le dossier' : 'Nouveau dossier dette / prêt'}
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
            {isEditMode && alreadyRepaid > 0 && (
              <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-1">
                Déjà remboursé : {formatCurrency(alreadyRepaid)}
              </p>
            )}
          </div>

          {/* 4. Pont comptable optionnel avec un Portefeuille (Création uniquement - [DEBT-01]) */}
          {!isEditMode && wallets.length > 0 && (
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
                    {type === 'LENT'
                      ? 'Débiter un portefeuille maintenant'
                      : 'Créditer un portefeuille maintenant'}
                  </span>
                  <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {type === 'LENT'
                      ? 'Crée une dépense réelle et met à jour le solde du compte.'
                      : 'Crée une entrée réelle et met à jour le solde du compte.'}
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
                        {w.name} ({formatCurrency(w.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 5. Date d'échéance prévue */}
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

          {/* 6. Note / Motif */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Motif / Note explicative
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={250}
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
              {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
