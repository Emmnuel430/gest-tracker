'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { X, Sparkles, Wallet as WalletIcon, Ban } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { parseAmountInput, formatCurrency } from '@/constants/config';
import { WalletItem, upsertWalletAction, restoreWalletAction } from '@/actions/wallets';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DeletedMatchData {
  id: string;
  name: string;
  deletedAt: string | null;
  transactionCount: number;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: WalletItem | null;
  existingWallets?: WalletItem[];
}

const WALLET_TYPES = [
  { value: 'CASH', label: 'Espèces', color: '#52B788' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money (Wave, OM)', color: '#1DC4F2' },
  { value: 'BANK', label: 'Compte bancaire', color: '#B8C0FF' },
  { value: 'SAVINGS', label: 'Épargne', color: '#FFE600' },
] as const;

const PRESET_COLORS = [
  '#2563EB', // Bleu
  '#1DC4F2', // Cyan Wave
  '#FF7900', // Orange OM
  '#16A34A', // Vert
  '#7C3AED', // Violet
  '#FF3366', // Rose
  '#FFE600', // Jaune
  '#52B788', // Vert menthe
  '#B8C0FF', // Bleu pastel
  '#FB5607', // Orange corail
  '#70E000', // Vert lime
  '#64748B', // Gris ardoise
];

export function WalletModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  existingWallets,
}: WalletModalProps) {
  const [isPending, startTransition] = useTransition();

  // Dictionnaire des couleurs déjà prises par d'autres portefeuilles (insensible à la casse)
  const usedColorsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!existingWallets) return map;
    for (const w of existingWallets) {
      if (initialData?.id && w.id === initialData.id) continue;
      if (w.color) {
        map.set(w.color.toLowerCase(), w.name);
      }
    }
    return map;
  }, [existingWallets, initialData]);

  const [name, setName] = useState<string>(initialData?.name || '');
  const [type, setType] = useState<'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS'>(
    initialData?.type || 'CASH'
  );
  const [balanceInput, setBalanceInput] = useState<string>(
    initialData
      ? (initialData.currentBalance ?? 0).toString()
      : '0'
  );
  const [color, setColor] = useState<string>(initialData?.color || '#2563EB');
  const [isDefault, setIsDefault] = useState<boolean>(initialData?.isDefault || false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletedMatch, setDeletedMatch] = useState<DeletedMatchData | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState<boolean>(false);

  // Synchronisation systématique de l'état avec initialData à l'ouverture ou modification de la sélection
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setType(initialData.type || 'CASH');
        setBalanceInput((initialData.currentBalance ?? 0).toString());
        setColor(initialData.color || '#2563EB');
        setIsDefault(initialData.isDefault || false);
      } else {
        setName('');
        setType('CASH');
        setBalanceInput('0');
        // Trouver la première couleur disponible
        const availableColor =
          PRESET_COLORS.find((c) => !usedColorsMap.has(c.toLowerCase())) || '#2563EB';
        setColor(availableColor);
        setIsDefault(false);
      }
      setErrorMessage(null);
      setDeletedMatch(null);
      setShowRestoreDialog(false);
    }
  }, [isOpen, initialData, usedColorsMap]);

  if (!isOpen) return null;

  const handleConfirmRestore = () => {
    if (!deletedMatch) return;
    startTransition(async () => {
      const res = await restoreWalletAction(deletedMatch.id, color, type);
      if (res.success) {
        setShowRestoreDialog(false);
        onSuccess();
        onClose();
      } else {
        setShowRestoreDialog(false);
        setErrorMessage(res.error);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Veuillez saisir un nom pour le compte');
      return;
    }

    if (usedColorsMap.has(color.toLowerCase())) {
      const ownerName = usedColorsMap.get(color.toLowerCase());
      setErrorMessage(
        `Cette couleur est déjà attribuée au portefeuille "${ownerName}". Veuillez choisir une autre couleur.`
      );
      return;
    }

    const numericBalance = parseAmountInput(balanceInput);
    const parsedAmt = isNaN(numericBalance) ? 0 : numericBalance;
    const hasBalanceChanged = initialData
      ? Math.round(parsedAmt) !== Math.round(initialData.currentBalance)
      : false;

    startTransition(async () => {
      const res = await upsertWalletAction({
        id: initialData?.id,
        name: name.trim(),
        type,
        initialBalance: initialData ? initialData.initialBalance : parsedAmt,
        declaredBalance: parsedAmt,
        adjustCurrentBalance: hasBalanceChanged,
        color,
        isDefault,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        if (res.code === 'DELETED_WALLET_MATCH' && res.data) {
          setDeletedMatch(res.data as DeletedMatchData);
          setShowRestoreDialog(true);
          return;
        }
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neutral-200 dark:border-[#334155]">
          <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {initialData ? 'Modifier le portefeuille' : 'Nouveau portefeuille'}
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
          {/* Nom du compte */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Nom du portefeuille
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mon Wave, Cash Portefeuille, Compte BOA..."
              className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              autoFocus
            />
          </div>

          {/* Type de compte */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Type de compte
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {WALLET_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  type="button"
                  onClick={() => {
                    setType(wt.value);
                    if (!usedColorsMap.has(wt.color.toLowerCase())) {
                      setColor(wt.color);
                    }
                  }}
                  className={`p-2 rounded-lg text-left text-xs font-bold border-2 transition-all cursor-pointer ${
                    type === wt.value
                      ? 'border-[#111827] dark:border-white bg-[#00DF81] text-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                      : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="truncate">{wt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Solde de départ en création OU Solde actuel constaté en édition */}
          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              {initialData ? 'Solde actuel constaté (FCFA)' : 'Solde initial (FCFA)'}
            </label>
            <CurrencyInput
              value={balanceInput}
              onChange={setBalanceInput}
              placeholder="0"
            />
            {initialData ? (
              <div className="mt-1 space-y-1">
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                  Saisissez le montant réellement disponible sur ce compte aujourd’hui. Il servira de jalon de référence pour vos calculs futurs. Vos opérations antérieures restent préservées dans l’historique sans altérer ce montant.
                </p>
                {initialData.declaredAt && (
                  <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-[#131C31] px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700">
                    Dernière référence : {formatCurrency(initialData.declaredBalance ?? 0)} le {new Date(initialData.declaredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Montant actuellement présent sur ce compte au moment de la création.
              </p>
            )}
          </div>

          {/* Couleur */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Couleur d’identification
              </label>
              <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                Couleur unique par compte
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => {
                const isTaken = usedColorsMap.has(c.toLowerCase());
                const takenByName = usedColorsMap.get(c.toLowerCase());
                const isSelected = color.toLowerCase() === c.toLowerCase();

                return (
                  <button
                    key={c}
                    type="button"
                    disabled={isTaken}
                    onClick={() => {
                      setColor(c);
                      setErrorMessage(null);
                    }}
                    title={isTaken ? `Couleur déjà utilisée par "${takenByName}"` : c}
                    className={`relative w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      isSelected
                        ? 'scale-115 border-black dark:border-white ring-2 ring-black dark:ring-white'
                        : isTaken
                        ? 'opacity-30 cursor-not-allowed border-neutral-300 dark:border-neutral-700'
                        : 'border-neutral-400 hover:scale-105 cursor-pointer'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {isTaken && (
                      <Ban className="w-3.5 h-3.5 text-black/70 dark:text-white/70 stroke-2.5" />
                    )}
                  </button>
                );
              })}
            </div>
            {usedColorsMap.has(color.toLowerCase()) && (
              <p className="text-[11px] text-[#FF3366] font-bold mt-1">
                Cette couleur est déjà attribuée au portefeuille "{usedColorsMap.get(color.toLowerCase())}".
              </p>
            )}
          </div>

          {/* Compte par défaut */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-[#2563EB] cursor-pointer"
            />
            <label
              htmlFor="isDefault"
              className="text-xs font-bold text-[#111827] dark:text-[#F8FAFC] cursor-pointer select-none"
            >
              Définir comme compte principal par défaut
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
              {initialData ? 'Mettre à jour' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </div>

      {/* Boîte de dialogue de proposition de restauration */}
      <ConfirmDialog
        isOpen={showRestoreDialog && !!deletedMatch}
        title="Restaurer le compte existant ?"
        message={`Un compte "${deletedMatch?.name}" supprimé${
          deletedMatch?.deletedAt
            ? ` le ${new Date(deletedMatch.deletedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}`
            : ''
        } contient ${deletedMatch?.transactionCount ?? 0} opération(s). Le restaurer les remettra à leur place.`}
        confirmLabel="Restaurer le compte"
        cancelLabel="Annuler"
        variant="warning"
        isLoading={isPending}
        loadingLabel="Restauration..."
        onCancel={() => setShowRestoreDialog(false)}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
}
