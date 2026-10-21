'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Zap, Info, ChevronDown, ChevronUp, Percent, Banknote } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { WalletItem, transferBetweenWalletsAction } from '@/actions/wallets';
import { computeTransferFee, formatTransferFeePreview, TransferFeeMode } from '@/lib/transfer-fees';

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

  // Frais de virement (Sprint 2.10.0 - D9, Q11)
  const [hasFee, setHasFee] = useState<boolean>(false);
  const [feeMode, setFeeMode] = useState<TransferFeeMode>('AMOUNT');
  const [feeValueInput, setFeeValueInput] = useState<string>('');
  const [showFeeSection, setShowFeeSection] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronisation dynamique du portefeuille émetteur et récepteur à l'ouverture ou au changement de defaultSourceId
  useEffect(() => {
    if (isOpen) {
      const activeSource =
        defaultSourceId && wallets.some((w) => w.id === defaultSourceId)
          ? defaultSourceId
          : wallets[0]?.id || '';

      setSourceId(activeSource);
      const activeTarget = wallets.find((w) => w.id !== activeSource)?.id || '';
      setTargetId(activeTarget);
      setAmount('');
      setNote('');
      setHasFee(false);
      setFeeMode('AMOUNT');
      setFeeValueInput('');
      setShowFeeSection(false);
      setErrorMessage(null);
    }
  }, [isOpen, defaultSourceId, wallets]);

  const sourceWallet = useMemo(() => wallets.find((w) => w.id === sourceId), [wallets, sourceId]);
  const targetWallet = useMemo(() => wallets.find((w) => w.id === targetId), [wallets, targetId]);

  const numericAmount = useMemo(() => parseAmountInput(amount), [amount]);
  const numericFeeValue = useMemo(() => {
    if (feeMode === 'AMOUNT') {
      return parseAmountInput(feeValueInput);
    }
    const parsed = parseFloat(feeValueInput.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [feeMode, feeValueInput]);

  const computedFee = useMemo(() => {
    if (!hasFee || isNaN(numericFeeValue) || numericFeeValue <= 0) return 0;
    return computeTransferFee({
      amount: numericAmount > 0 ? numericAmount : 0,
      mode: feeMode,
      value: numericFeeValue,
    });
  }, [hasFee, feeMode, numericFeeValue, numericAmount]);

  if (!isOpen) return null;

  if (wallets.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-150">
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
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Un virement interne nécessite au moins 2 comptes actifs. Vous disposez actuellement de {wallets.length} compte{wallets.length === 0 ? '' : ' actif'}.
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-black uppercase rounded-xl border-2 border-[#111827] dark:border-[#334155] hover:bg-neutral-100 dark:hover:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC] transition-all cursor-pointer"
              >
                Fermer
              </button>
              <Link
                href="/portefeuilles"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-black uppercase rounded-xl border-2 border-[#111827] dark:border-white bg-[#FFE600] hover:bg-[#FACC15] text-[#111827] shadow-[2px_2px_0px_0px_#111827] text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                Ajouter un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Veuillez entrer un montant supérieur à 0 FCFA');
      return;
    }

    if (hasFee) {
      if (numericFeeValue < 0) {
        setErrorMessage('Les frais doivent être supérieurs ou égaux à 0');
        return;
      }
      if (feeMode === 'PERCENT' && numericFeeValue > 100) {
        setErrorMessage('Le pourcentage de frais ne peut pas dépasser 100 %');
        return;
      }
      if (computedFee > numericAmount) {
        setErrorMessage('Les frais ne peuvent pas dépasser le montant du transfert');
        return;
      }
    }

    startTransition(async () => {
      const res = await transferBetweenWalletsAction({
        sourceWalletId: sourceId,
        targetWalletId: targetId,
        amount: numericAmount,
        hasFee,
        feeMode: hasFee ? feeMode : 'AMOUNT',
        feeValue: hasFee ? numericFeeValue : 0,
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
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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
          {/* Source -> Cible */}
          <div className="grid grid-cols-2 gap-2">
            {/* Source */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                Depuis (Débit)
              </label>
              <select
                value={sourceId}
                onChange={(e) => {
                  const nextSource = e.target.value;
                  setSourceId(nextSource);
                  if (targetId === nextSource) {
                    const alternateTarget = wallets.find((w) => w.id !== nextSource)?.id || '';
                    setTargetId(alternateTarget);
                  }
                }}
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
                  <option key={w.id} value={w.id} disabled={w.id === sourceId}>
                    {w.name} ({formatCurrency(w.currentBalance)}){w.id === sourceId ? ' (Source)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Montant crédité (montant reçu) */}
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

          {/* Section Frais de virement (D9 - repliable) */}
          <div className="border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-neutral-50 dark:bg-[#0F172A] overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setShowFeeSection(!showFeeSection);
              }}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#131C31] transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                Frais de virement (optionnel)
                {hasFee && computedFee > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#FFE600] text-[#111827] border border-[#111827] rounded-md font-black">
                    +{formatCurrency(computedFee)}
                  </span>
                )}
              </span>
              {showFeeSection ? (
                <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>

            {showFeeSection && (
              <div className="p-3 pt-0 space-y-3 border-t border-neutral-200 dark:border-[#334155] mt-1">
                {/* Interrupteur frais */}
                <div className="flex items-center justify-between pt-2">
                  <label htmlFor="transfer-fee-toggle" className="text-xs font-bold text-[#111827] dark:text-[#F8FAFC] cursor-pointer">
                    Ce virement a des frais
                  </label>
                  <input
                    id="transfer-fee-toggle"
                    type="checkbox"
                    checked={hasFee}
                    onChange={(e) => setHasFee(e.target.checked)}
                    className="w-4 h-4 accent-[#FFE600] rounded cursor-pointer"
                  />
                </div>

                {hasFee && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    {/* Choix du mode : Montant ou Pourcentage */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeeMode('AMOUNT')}
                        className={`py-1.5 px-2 text-xs font-black uppercase rounded-lg border-2 flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          feeMode === 'AMOUNT'
                            ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#FFE600]'
                            : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        Montant (FCFA)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeMode('PERCENT')}
                        className={`py-1.5 px-2 text-xs font-black uppercase rounded-lg border-2 flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          feeMode === 'PERCENT'
                            ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#FFE600]'
                            : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        Pourcentage (%)
                      </button>
                    </div>

                    {/* Saisie de la valeur */}
                    <div>
                      <label className="block text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                        {feeMode === 'AMOUNT' ? 'Montant des frais (FCFA)' : 'Taux des frais (%)'}
                      </label>
                      {feeMode === 'AMOUNT' ? (
                        <CurrencyInput
                          value={feeValueInput}
                          onChange={setFeeValueInput}
                          placeholder="Ex: 100"
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={feeValueInput}
                            onChange={(e) => setFeeValueInput(e.target.value)}
                            placeholder="Ex: 1 ou 1.5"
                            className="w-full px-3 py-2 pr-8 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC]"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-black text-neutral-400">
                            %
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Aperçu en direct */}
                    {numericAmount > 0 && (
                      <div className="p-2.5 bg-[#FFFBEB] dark:bg-[#2C2108] border-2 border-[#FFE600] rounded-xl text-xs font-bold text-[#111827] dark:text-[#F8FAFC]">
                        {formatTransferFeePreview({
                          amount: numericAmount,
                          fee: computedFee,
                          sourceName: sourceWallet?.name || 'Compte source',
                          targetName: targetWallet?.name || 'Compte cible',
                          mode: feeMode,
                          percentValue: feeMode === 'PERCENT' ? numericFeeValue : undefined,
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
          <div className="p-3 bg-neutral-100 dark:bg-[#0F172A] border-2 border-dashed border-neutral-300 dark:border-[#334155] rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
            <span>
              {hasFee && computedFee > 0 ? (
                <>
                  Le virement de {formatCurrency(numericAmount)} est neutre, mais les frais de{' '}
                  <strong>{formatCurrency(computedFee)}</strong> seront comptabilisés comme dépense sur {sourceWallet?.name || 'le compte source'}.
                </>
              ) : (
                <>
                  Ce mouvement est un <strong>virement interne</strong> : il n&apos;impacte ni vos revenus ni vos dépenses du mois. Votre solde net global reste inchangé.
                </>
              )}
            </span>
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
