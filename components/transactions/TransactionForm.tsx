"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Calendar, AlertTriangle, RotateCcw, Plus, Wallet, Tag } from "lucide-react";
import Link from "next/link";
import { useCategories, useWallets } from "@/components/providers/ReferenceDataProvider";
import { createTransactionAction } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { APP_CONFIG, parseAmountInput } from "@/constants/config";
import { formatDateForInput, formatTimeForInput, combineDateAndTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { CategoryItem } from "@/lib/categories";
import { WalletItem } from "@/actions/wallets";

interface TransactionFormProps {
  type: "INCOME" | "EXPENSE";
  serverCategories?: CategoryItem[];
  serverWallets?: WalletItem[];
}

export function TransactionForm({
  type,
  serverCategories = [],
  serverWallets = [],
}: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isIncome = type === "INCOME";
  const { categories: categoryList, refreshCategories } = useCategories(type);
  const { wallets: userWallets, defaultWallet, refreshWallets } = useWallets();

  // Priorité aux données du provider si présentes, sinon fallback immédiat sur les données préchargées du serveur
  const effectiveCategories = categoryList.length > 0 ? categoryList : serverCategories;
  const effectiveWallets = userWallets.length > 0 ? userWallets : serverWallets;

  // Auto-réparation : si les listes sont vides, forcer un rafraîchissement
  useEffect(() => {
    if (categoryList.length === 0) {
      refreshCategories();
    }
    if (userWallets.length === 0) {
      refreshWallets();
    }
  }, [categoryList.length, userWallets.length, refreshCategories, refreshWallets]);

  // Form State
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [payment, setPayment] = useState<string>("");
  const [walletId, setWalletId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (
      effectiveCategories.length > 0 &&
      (!category || !effectiveCategories.some((c) => c.name === category))
    ) {
      setCategory(effectiveCategories[0].name);
    }
  }, [effectiveCategories, category]);

  useEffect(() => {
    if (effectiveWallets.length > 0 && !walletId) {
      const initial =
        defaultWallet && effectiveWallets.some((w) => w.id === defaultWallet.id)
          ? defaultWallet
          : effectiveWallets.find((w) => w.isDefault) || effectiveWallets[0];
      if (initial) {
        setWalletId(initial.id);
        setPayment(initial.name);
      }
    }
  }, [effectiveWallets, defaultWallet, walletId]);

  // Logique métier date : instantanée par défaut, dépliable pour rétroactif / personnalisé
  const [showCustomDate, setShowCustomDate] = useState<boolean>(false);
  const [customDate, setCustomDate] = useState<string>(() => formatDateForInput());
  const [customTime, setCustomTime] = useState<string>(() => formatTimeForInput());

  // Status & Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCatObj = effectiveCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  const selectedCatColor = selectedCatObj?.color || "#2563EB";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const numericAmount = parseAmountInput(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Veuillez entrer un montant supérieur à 0");
      return;
    }

    if (!category) {
      setErrorMessage("Veuillez sélectionner une catégorie");
      return;
    }

    if (!walletId && !payment) {
      setErrorMessage("Veuillez sélectionner un portefeuille");
      return;
    }

    startTransition(async () => {
      // Logique métier : si personnalisé, assembler date + heure ; sinon instantané (new Date())
      const finalDate = showCustomDate && customDate
        ? combineDateAndTime(customDate, customTime)
        : new Date();

      const response = await createTransactionAction({
        type,
        amount: numericAmount,
        category,
        categoryId: selectedCatObj?.id || null,
        payment,
        walletId: walletId || null,
        date: finalDate,
        note: note ? note.trim() : undefined,
      });

      if (response.success) {
        setSuccessMessage(
          response.message || "Opération enregistrée avec succès !",
        );
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        setErrorMessage(response.error || "Une erreur est survenue");
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* HEADER AVEC BOUTON RETOUR & CONTEXTE */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Tableau de bord</span>
        </Link>
        <span
          className={cn(
            "text-[11px] font-black uppercase px-2.5 py-1 border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]",
            isIncome
              ? "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#064E3B] dark:text-[#86EFAC]"
              : "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]"
          )}
        >
          {isIncome ? "Entrée de fonds" : "Dépense"}
        </span>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] p-5 sm:p-7">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {isIncome ? "Nouveau Revenu" : "Nouvelle Dépense"}
          </h1>
          <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
            {isIncome
              ? "Enregistrez une entrée d'argent (salaire, virement, vente, don)."
              : "Enregistrez une sortie d'argent quotidienne ou exceptionnelle."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CHAMP MONTANT AVEC NÉOBRUTALISME ACCENTUÉ */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC] mb-2">
              Montant ({APP_CONFIG.currency}) *
            </label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0"
              autoFocus
              className="text-2xl sm:text-3xl font-black py-3 sm:py-4 border-3"
            />
            {fieldErrors.amount && (
              <p className="text-xs font-bold text-[#DC2626] mt-1.5">
                {fieldErrors.amount[0]}
              </p>
            )}
          </div>

          {/* SÉLECTEUR DE CATÉGORIE AVEC PASTILLE DE COULEUR DYNAMIQUE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
                Catégorie *
              </label>
              <Link
                href="/budgets"
                className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Gérer
              </Link>
            </div>

            {effectiveCategories.length === 0 ? (
              <div className="p-3 bg-[#FEF3C7] dark:bg-[#78350F]/30 border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs font-bold text-[#92400E] dark:text-[#FDE68A]">
                    Aucune catégorie disponible
                  </span>
                </div>
                <Link href="/budgets">
                  <Button type="button" size="sm" variant="neutral" className="text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> Créer
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 font-bold text-sm text-[#111827] dark:text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B] cursor-pointer transition-all"
                  >
                    {effectiveCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Visualisation de la couleur de catégorie */}
                <div className="flex items-center gap-2 mt-2 px-1">
                  <span
                    className="w-3 h-3 rounded-full border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827]"
                    style={{ backgroundColor: selectedCatColor }}
                  />
                  <span className="text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-400">
                    Couleur catégorie : <span className="text-[#111827] dark:text-white">{category}</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* SÉLECTEUR PORTEFEUILLE / CANAL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
                Portefeuille source *
              </label>
              <Link
                href="/portefeuilles"
                className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Gérer
              </Link>
            </div>

            {effectiveWallets.length === 0 ? (
              <div className="p-3 bg-[#FEF3C7] dark:bg-[#78350F]/30 border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs font-bold text-[#92400E] dark:text-[#FDE68A]">
                    Aucun compte disponible
                  </span>
                </div>
                <Link href="/portefeuilles">
                  <Button type="button" size="sm" variant="neutral" className="text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> Créer
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {effectiveWallets.map((w) => {
                  const isSelected = walletId === w.id || payment.toLowerCase() === w.name.toLowerCase();
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setWalletId(w.id);
                        setPayment(w.name);
                      }}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-[#111827] dark:border-[#334155] transition-all cursor-pointer select-none flex items-center justify-between gap-1.5",
                        isSelected
                          ? "shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] -translate-y-0.5 ring-2 ring-[#111827] dark:ring-white bg-white dark:bg-[#1E293B]"
                          : "bg-white dark:bg-[#131C31] text-[#111827] dark:text-neutral-300 hover:bg-[#EFF6FF] dark:hover:bg-[#1E293B] shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-[#111827]"
                          style={{ backgroundColor: w.color }}
                        />
                        <span className="truncate">{w.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* NOTE / DESCRIPTION (OPTIONNEL) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC] mb-1.5">
              Note / Description (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Déjeuner au restaurant, virement..."
              value={note}
              maxLength={250}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg px-3 py-2 text-sm font-medium text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B]"
            />
          </div>

          {/* DATE & HEURE : CRÉATION INSTANTANÉE (PAR DÉFAUT) VS RÉTROACTIVE */}
          <div className="pt-0.5">
            {!showCustomDate ? (
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#131C31] border-2 border-dashed border-[#111827]/40 dark:border-[#334155] rounded-xl transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shadow-[1px_1px_0px_0px_#111827] animate-pulse" />
                  <span>
                    Date : <strong className="font-black text-[#111827] dark:text-[#F8FAFC]">Instantanée (maintenant)</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomDate(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer select-none"
                >
                  <Calendar className="w-3.5 h-3.5 stroke-2.5" />
                  <span>Modifier la date / heure</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#334155] pb-2">
                  <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] stroke-2.5" />
                    Date & Heure personnalisées
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomDate(false)}
                    className="text-[11px] font-bold text-[#DC2626] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revenir à maintenant</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-300 mb-1">
                      Date précise *
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      required
                      className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg px-3 py-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-white dark:focus:bg-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-neutral-600 dark:text-neutral-300 mb-1">
                      Heure (optionnel)
                    </label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg px-3 py-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:bg-white dark:focus:bg-[#1E293B]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RETOURS D'ERREUR OU SUCCÈS */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-[#DC2626] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#F0FDF4] dark:bg-[#062413] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-black text-[#16A34A] flex items-center gap-2">
              <Check className="w-4 h-4 stroke-3" />
              {successMessage}
            </div>
          )}

          {/* BOUTON D'ACTION PRINCIPAL */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            variant={isIncome ? "success" : "danger"}
            disabled={isPending || effectiveCategories.length === 0 || effectiveWallets.length === 0}
            className="text-base py-4"
          >
            {isPending
              ? "Enregistrement..."
              : isIncome
                ? "＋ Enregistrer ce Revenu"
                : "− Enregistrer cette Dépense"}
          </Button>
        </form>
      </div>
    </div>
  );
}
