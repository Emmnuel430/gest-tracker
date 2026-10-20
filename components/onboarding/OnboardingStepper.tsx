'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Plus,
  Trash2,
  Smartphone,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet,
  Tag,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { formatCurrency, parseAmountInput } from '@/constants/config';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { completeOnboardingAction, skipOnboardingAction } from '@/actions/onboarding';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

const STORAGE_KEY = 'gest_tracker_onboarding_draft_v1';

interface CustomWalletDraft {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  balance: string;
  color: string;
  selected: boolean;
  isDefault: boolean;
}

interface CustomCategoryDraft {
  name: string;
  kind: 'INCOME' | 'EXPENSE' | 'BOTH';
  color: string;
  selected: boolean;
}

const INITIAL_WALLETS: CustomWalletDraft[] = [
  {
    id: 'w_cash',
    name: 'Espèces',
    type: 'CASH',
    balance: '0',
    color: '#52B788',
    selected: true,
    isDefault: true,
  },
  {
    id: 'w_wave',
    name: 'Wave',
    type: 'MOBILE_MONEY',
    balance: '0',
    color: '#1DC4F2',
    selected: true,
    isDefault: false,
  },
  {
    id: 'w_om',
    name: 'Orange Money',
    type: 'MOBILE_MONEY',
    balance: '0',
    color: '#FF7900',
    selected: true,
    isDefault: false,
  },
];

const PRESET_WALLET_COLORS = [
  '#52B788',
  '#1DC4F2',
  '#FF7900',
  '#2563EB',
  '#B8C0FF',
  '#FFE600',
  '#FF5964',
  '#9B5DE5',
];

export function OnboardingStepper() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Étape 2 : Portefeuilles
  const [wallets, setWallets] = useState<CustomWalletDraft[]>(INITIAL_WALLETS);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS'>('BANK');
  const [newWalletColor, setNewWalletColor] = useState('#2563EB');
  const [showAddWallet, setShowAddWallet] = useState(false);

  // Étape 3 : Catégories
  const [categories, setCategories] = useState<CustomCategoryDraft[]>(() =>
    DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      kind: c.kind,
      color: c.color,
      selected: true,
    }))
  );
  const [newCatName, setNewCatName] = useState('');
  const [newCatKind, setNewCatKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newCatColor, setNewCatColor] = useState('#FF5964');
  const [showAddCat, setShowAddCat] = useState(false);

  // Restauration du brouillon depuis sessionStorage au montage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.wallets) setWallets(parsed.wallets);
        if (parsed.categories) setCategories(parsed.categories);
      }
    } catch {
      // Ignorer si parsing invalide
    }
  }, []);

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, wallets, categories })
      );
    } catch {
      // Ignore sessionStorage issues
    }
  }, [step, wallets, categories]);

  // Total patrimoine de départ calculé en direct
  const startingWealth = useMemo(() => {
    return wallets
      .filter((w) => w.selected)
      .reduce((sum, w) => sum + Math.max(0, parseAmountInput(w.balance)), 0);
  }, [wallets]);

  // Gestion du compte principal
  const setDefaultWallet = (id: string) => {
    setWallets((prev) =>
      prev.map((w) => ({
        ...w,
        isDefault: w.id === id,
        selected: w.id === id ? true : w.selected, // Le compte par défaut doit être sélectionné
      }))
    );
  };

  const toggleWalletSelection = (id: string) => {
    setWallets((prev) => {
      const target = prev.find((w) => w.id === id);
      if (target?.isDefault) {
        setErrorMessage('Vous ne pouvez pas désélectionner votre compte principal.');
        return prev;
      }
      return prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w));
    });
  };

  const updateWalletBalance = (id: string, value: string) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, balance: value } : w))
    );
  };

  const handleAddCustomWallet = () => {
    if (!newWalletName.trim()) {
      setErrorMessage('Veuillez donner un nom à votre compte.');
      return;
    }
    const exists = wallets.some(
      (w) => w.name.trim().toLowerCase() === newWalletName.trim().toLowerCase()
    );
    if (exists) {
      setErrorMessage(`Un compte nommé "${newWalletName.trim()}" existe déjà.`);
      return;
    }
    const colorExists = wallets.some(
      (w) => w.color.toLowerCase() === newWalletColor.toLowerCase()
    );
    if (colorExists) {
      setErrorMessage('Cette couleur est déjà attribuée à un autre compte.');
      return;
    }

    const newDraft: CustomWalletDraft = {
      id: `w_custom_${Date.now()}`,
      name: newWalletName.trim(),
      type: newWalletType,
      balance: '0',
      color: newWalletColor,
      selected: true,
      isDefault: false,
    };

    setWallets((prev) => [...prev, newDraft]);
    setNewWalletName('');
    setShowAddWallet(false);
    setErrorMessage(null);
  };

  const removeCustomWallet = (id: string) => {
    setWallets((prev) => {
      const target = prev.find((w) => w.id === id);
      if (target?.isDefault) {
        setErrorMessage('Désignez d’abord un autre compte principal avant de retirer celui-ci.');
        return prev;
      }
      return prev.filter((w) => w.id !== id);
    });
  };

  const toggleCategorySelection = (name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleAddCustomCategory = () => {
    if (!newCatName.trim()) {
      setErrorMessage('Veuillez saisir un nom pour la catégorie.');
      return;
    }
    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setErrorMessage(`La catégorie "${newCatName.trim()}" existe déjà.`);
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        name: newCatName.trim(),
        kind: newCatKind,
        color: newCatColor,
        selected: true,
      },
    ]);
    setNewCatName('');
    setShowAddCat(false);
    setErrorMessage(null);
  };

  // Validation étape 2 (Comptes)
  const validateStep2 = () => {
    setErrorMessage(null);
    const selectedWallets = wallets.filter((w) => w.selected);
    if (selectedWallets.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un compte à utiliser.');
      return false;
    }
    const hasDefault = selectedWallets.some((w) => w.isDefault);
    if (!hasDefault) {
      // Définir le premier comme défaut
      setDefaultWallet(selectedWallets[0].id);
    }
    return true;
  };

  // Validation étape 3 (Catégories)
  const validateStep3 = () => {
    setErrorMessage(null);
    const selectedCats = categories.filter((c) => c.selected);
    const hasExpense = selectedCats.some((c) => c.kind === 'EXPENSE' || c.kind === 'BOTH');
    const hasIncome = selectedCats.some((c) => c.kind === 'INCOME' || c.kind === 'BOTH');

    if (!hasExpense || !hasIncome) {
      setErrorMessage(
        'Veuillez activer au moins une catégorie de dépense et une de revenu.'
      );
      return false;
    }
    return true;
  };

  // Soumission finale de l'onboarding
  const handleFinalSubmit = () => {
    setErrorMessage(null);

    const payloadWallets = wallets
      .filter((w) => w.selected)
      .map((w) => ({
        name: w.name,
        type: w.type,
        balance: Math.max(0, parseAmountInput(w.balance)),
        color: w.color,
        isDefault: w.isDefault,
      }));

    const payloadCategories = categories
      .filter((c) => c.selected)
      .map((c) => ({
        name: c.name,
        kind: c.kind,
        color: c.color,
      }));

    startTransition(async () => {
      const res = await completeOnboardingAction({
        wallets: payloadWallets,
        categories: payloadCategories,
      });

      if (res.success) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push('/');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Erreur lors de la validation.');
      }
    });
  };

  // Option "Configurer plus tard"
  const handleSkip = () => {
    startTransition(async () => {
      const res = await skipOnboardingAction();
      if (res.success) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push('/');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Erreur lors de la configuration rapide.');
      }
    });
  };

  // Rendu de l'icône de portefeuille
  const renderWalletIcon = (type: string) => {
    switch (type) {
      case 'MOBILE_MONEY':
        return <Smartphone className="w-5 h-5 stroke-2.5 text-[#111827]" />;
      case 'BANK':
        return <CreditCard className="w-5 h-5 stroke-2.5 text-[#111827]" />;
      case 'SAVINGS':
        return <PiggyBank className="w-5 h-5 stroke-2.5 text-[#111827]" />;
      default:
        return <Banknote className="w-5 h-5 stroke-2.5 text-[#111827]" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* 1. Stepper Header Indicator */}
      <div className="p-3 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500 dark:text-neutral-400 mb-2 px-1">
          <span>Configuration initiale</span>
          <span className="text-[#2563EB] dark:text-[#60A5FA]">Étape {step} sur 4</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full border-2 border-[#111827] dark:border-[#334155] transition-all ${
                s === step
                  ? 'bg-[#FFE600]'
                  : s < step
                  ? 'bg-[#00DF81]'
                  : 'bg-neutral-100 dark:bg-[#0F172A]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Message d'erreur contextuel */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#FF3366] text-[#FF3366] text-xs font-black flex items-center justify-between animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-[#FF3366]/10 rounded cursor-pointer"
          >
            x
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 1 : BIENVENUE                                                      */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-[#FFE600] border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]">
              <Sparkles className="w-6 h-6 stroke-2.5 text-[#111827]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Bienvenue sur Gest Tracker
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                Votre outil néobrutaliste pour maîtriser chaque dépense et suivre votre trésorerie réelle.
              </p>
            </div>

            {/* 3 piliers condensés */}
            <div className="space-y-2.5 pt-2 border-t-2 border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#131C31] border border-neutral-200 dark:border-neutral-700">
                <div className="p-1.5 rounded-lg bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB] shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4 stroke-2.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Tous vos comptes réunis
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Espèces, Wave, Orange Money ou banque au même endroit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#131C31] border border-neutral-200 dark:border-neutral-700">
                <div className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A] shrink-0 mt-0.5">
                  <Tag className="w-4 h-4 stroke-2.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Catégories sur-mesure
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Des enveloppes claires pour vos dépenses et rentrées.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#131C31] border border-neutral-200 dark:border-neutral-700">
                <div className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706] border border-[#D97706] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 stroke-2.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Zéro perte de données
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Vos soldes physiques démarrent avec votre montant réel actuel.
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="pt-4 space-y-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => setStep(2)}
                className="w-full text-xs uppercase flex items-center justify-center gap-2"
              >
                <span>Démarrer ma configuration (2 min)</span>
                <ArrowRight className="w-4 h-4 stroke-3" />
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isPending}
                className="w-full py-2 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-center block"
              >
                {isPending ? 'Configuration...' : 'Configurer plus tard (démarrage rapide avec 3 comptes à 0)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : MES COMPTES                                                    */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                  Mes Portefeuilles
                </h2>
                <InfoTooltip
                  title="Solde de départ"
                  content="Indiquez ce que vous possédez réellement aujourd’hui. Ce montant servira de jalon de départ."
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Cochez vos comptes et indiquez le montant actuel présent dessus.
              </p>
            </div>

            {/* Liste des cartes de comptes */}
            <div className="space-y-3">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-2xl border-3 transition-all space-y-3 ${
                    w.selected
                      ? 'bg-white dark:bg-[#131C31] border-[#111827] dark:border-[#334155] shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]'
                      : 'bg-neutral-50 dark:bg-[#0F172A] border-dashed border-neutral-300 dark:border-neutral-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={w.selected}
                        onChange={() => toggleWalletSelection(w.id)}
                        className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                        id={`check_${w.id}`}
                      />
                      <div
                        className="w-9 h-9 rounded-xl border-2 border-[#111827] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#111827]"
                        style={{ backgroundColor: w.color }}
                      >
                        {renderWalletIcon(w.type)}
                      </div>
                      <label htmlFor={`check_${w.id}`} className="cursor-pointer">
                        <span className="font-black text-sm text-[#111827] dark:text-[#F8FAFC] block">
                          {w.name}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">
                          {w.type === 'MOBILE_MONEY'
                            ? 'Mobile Money'
                            : w.type === 'BANK'
                            ? 'Banque'
                            : w.type === 'SAVINGS'
                            ? 'Épargne'
                            : 'Espèces'}
                        </span>
                      </label>
                    </div>

                    {/* Étoile compte principal */}
                    <div className="flex items-center gap-1">
                      {w.selected && (
                        <button
                          type="button"
                          onClick={() => setDefaultWallet(w.id)}
                          className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg border-2 transition-all flex items-center gap-1 cursor-pointer ${
                            w.isDefault
                              ? 'bg-[#FFE600] text-[#111827] border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                              : 'bg-neutral-100 dark:bg-[#1E293B] text-neutral-500 border-neutral-300 dark:border-neutral-700 hover:border-black'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${w.isDefault ? 'fill-[#111827]' : ''}`} />
                          <span>{w.isDefault ? 'Principal' : 'Définir principal'}</span>
                        </button>
                      )}

                      {w.id.startsWith('w_custom_') && (
                        <button
                          type="button"
                          onClick={() => removeCustomWallet(w.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Saisie du montant si sélectionné */}
                  {w.selected && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                        Solde actuel présent (FCFA)
                      </label>
                      <CurrencyInput
                        value={w.balance}
                        onChange={(val) => updateWalletBalance(w.id, val)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formulaire d'ajout de compte sur-mesure */}
            {showAddWallet ? (
              <div className="p-4 bg-neutral-50 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Ajouter un autre compte
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddWallet(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    Annuler
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    placeholder="Nom du compte (ex: BOA, Djamo, Coffre)"
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newWalletType}
                      onChange={(e) => setNewWalletType(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-white dark:bg-[#0F172A] text-[#111827] dark:text-white"
                    >
                      <option value="BANK">Banque</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="SAVINGS">Épargne</option>
                      <option value="CASH">Espèces</option>
                    </select>

                    <div className="flex items-center gap-1 overflow-x-auto p-1">
                      {PRESET_WALLET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewWalletColor(c)}
                          className={`w-5 h-5 rounded-full border shrink-0 ${
                            newWalletColor === c ? 'scale-125 border-black dark:border-white ring-2 ring-black' : 'border-neutral-300'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={handleAddCustomWallet}
                    className="w-full text-xs uppercase"
                  >
                    Ajouter ce compte
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddWallet(true)}
                className="w-full py-2.5 px-3 border-2 border-dashed border-[#111827] dark:border-[#334155] rounded-xl text-xs font-black uppercase text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#131C31] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-2.5" />
                Ajouter un autre compte (Banque, Coffre...)
              </button>
            )}

            {/* Total Patrimoine de départ en direct */}
            <div className="p-3 bg-[#111827] dark:bg-[#0F172A] text-white rounded-xl flex items-center justify-between border-2 border-[#111827]">
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-400 block">
                  Patrimoine de départ
                </span>
                <span className="text-xl font-black text-[#FFE600]">
                  {formatCurrency(startingWealth)}
                </span>
              </div>
              <span className="text-[11px] font-bold bg-white/20 px-2 py-1 rounded">
                {wallets.filter((w) => w.selected).length} compte(s) actif(s)
              </span>
            </div>

            {/* Boutons Précédent / Suivant */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="neutral"
                size="md"
                onClick={() => setStep(1)}
                className="text-xs uppercase flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 stroke-3" />
                <span>Précédent</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="text-xs uppercase flex items-center gap-1.5"
              >
                <span>Continuer vers les catégories</span>
                <ArrowRight className="w-4 h-4 stroke-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 : MES CATÉGORIES                                                 */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Mes Catégories
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Cochez les catégories que vous utilisez. Vous pourrez toujours en ajouter plus tard.
              </p>
            </div>

            {/* Bloc Dépenses */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase text-[#FF3366] block">
                Catégories de Dépenses
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                {categories
                  .filter((c) => c.kind === 'EXPENSE' || c.kind === 'BOTH')
                  .map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategorySelection(cat.name)}
                      className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        cat.selected
                          ? 'border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                          : 'opacity-40 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#0F172A]'
                      }`}
                      style={{
                        backgroundColor: cat.selected ? cat.color : undefined,
                        color: cat.selected ? '#111827' : undefined,
                      }}
                    >
                      {cat.selected && <Check className="w-3 h-3 stroke-3" />}
                      <span>{cat.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Bloc Revenus */}
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-[11px] font-black uppercase text-[#00DF81] block">
                Catégories de Revenus
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {categories
                  .filter((c) => c.kind === 'INCOME')
                  .map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategorySelection(cat.name)}
                      className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        cat.selected
                          ? 'border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                          : 'opacity-40 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#0F172A]'
                      }`}
                      style={{
                        backgroundColor: cat.selected ? cat.color : undefined,
                        color: cat.selected ? '#111827' : undefined,
                      }}
                    >
                      {cat.selected && <Check className="w-3 h-3 stroke-3" />}
                      <span>{cat.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Ajout d'une catégorie sur-mesure */}
            {showAddCat ? (
              <div className="p-3 bg-neutral-50 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Nouvelle catégorie
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(false)}
                    className="text-xs font-bold text-neutral-500"
                  >
                    Annuler
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nom (ex: Sport, Tontine)"
                    className="px-2.5 py-1.5 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#0F172A]"
                  />
                  <select
                    value={newCatKind}
                    onChange={(e) => setNewCatKind(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#0F172A]"
                  >
                    <option value="EXPENSE">Dépense</option>
                    <option value="INCOME">Revenu</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={handleAddCustomCategory}
                  className="w-full text-xs uppercase"
                >
                  Ajouter
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddCat(true)}
                className="w-full py-2 border border-dashed border-neutral-400 dark:border-neutral-600 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:border-black cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une autre catégorie
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="neutral"
                size="md"
                onClick={() => setStep(2)}
                className="text-xs uppercase flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 stroke-3" />
                <span>Précédent</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep3()) setStep(4);
                }}
                className="text-xs uppercase flex items-center gap-1.5"
              >
                <span>Vérifier le récapitulatif</span>
                <ArrowRight className="w-4 h-4 stroke-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 4 : RÉCAPITULATIF                                                  */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Prêt à démarrer !
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Vérifiez votre configuration avant de commencer à suivre vos dépenses.
              </p>
            </div>

            {/* Récapitulatif des comptes */}
            <div className="p-3.5 bg-neutral-50 dark:bg-[#131C31] rounded-xl border-2 border-[#111827] dark:border-[#334155] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-neutral-600 dark:text-neutral-400">
                  Mes Comptes ({wallets.filter((w) => w.selected).length})
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>

              <div className="space-y-1.5">
                {wallets
                  .filter((w) => w.selected)
                  .map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between text-xs font-bold p-1.5 bg-white dark:bg-[#0F172A] rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black"
                          style={{ backgroundColor: w.color }}
                        />
                        <span className="text-[#111827] dark:text-[#F8FAFC]">{w.name}</span>
                        {w.isDefault && (
                          <span className="px-1 text-[9px] font-black uppercase bg-[#FFE600] text-black border border-black rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <span className="font-black text-[#111827] dark:text-white">
                        {formatCurrency(Math.max(0, parseAmountInput(w.balance)))}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between font-black text-xs">
                <span>Total patrimoine initial :</span>
                <span className="text-[#2563EB] dark:text-[#60A5FA] text-sm">
                  {formatCurrency(startingWealth)}
                </span>
              </div>
            </div>

            {/* Récapitulatif des catégories */}
            <div className="p-3.5 bg-neutral-50 dark:bg-[#131C31] rounded-xl border-2 border-[#111827] dark:border-[#334155] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-neutral-600 dark:text-neutral-400">
                  Catégories retenues ({categories.filter((c) => c.selected).length})
                </span>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {categories
                  .filter((c) => c.selected)
                  .map((c) => (
                    <span
                      key={c.name}
                      className="px-2 py-0.5 text-[10px] font-bold rounded border border-neutral-300 dark:border-neutral-700"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      {c.name}
                    </span>
                  ))}
              </div>
            </div>

            {/* Bouton de confirmation finale */}
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isPending}
                onClick={handleFinalSubmit}
                className="w-full text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111827]"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Finalisation de votre compte...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-3" />
                    <span>Commencer à suivre mes dépenses</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setStep(3)}
                className="w-full text-xs uppercase"
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
