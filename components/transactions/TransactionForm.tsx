"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
} from "@/constants/categories";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_THEMES,
} from "@/constants/payment-methods";
import { createTransactionAction } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/constants/config";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  type: "INCOME" | "EXPENSE";
}

export function TransactionForm({ type }: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isIncome = type === "INCOME";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Form State
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0] || "");
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0] || "Wave");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );

  // Status & Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCatColor = CATEGORY_COLORS[category] || "#2563EB";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const numericAmount = parseFloat(amount.replace(/\s+/g, ""));
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Veuillez entrer un montant supérieur à 0");
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
        setSuccessMessage(
          response.message || "Opération enregistrée avec succès !",
        );
        // Redirection après 800ms
        setTimeout(() => {
          router.push("/");
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
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase px-3 py-1.5 bg-white border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#111827] transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          Retour Accueil
        </Link>

        <span
          className={cn(
            "text-xs font-black uppercase px-3 py-1 border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827]",
            isIncome ? "bg-[#16A34A] text-white" : "bg-[#DC2626] text-white",
          )}
        >
          {isIncome ? "Nouveau Revenu" : "Nouvelle Dépense"}
        </span>
      </div>

      {/* Carte du Formulaire Néobrutaliste */}
      <div className="bg-white border-3 border-[#111827] rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_0px_#111827]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MONTANT GÉANT AVEC SUPPRESSION DE LA MOLETTE */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#111827] mb-2">
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
                onWheel={(e) => (e.target as HTMLElement).blur()}
                className="w-full text-2xl sm:text-3xl font-black bg-white border-3 border-[#111827] rounded-xl p-4 pr-20 shadow-[4px_4px_0px_0px_#111827] focus:outline-none focus:bg-[#EFF6FF] focus:shadow-[6px_6px_0px_0px_#111827] transition-all text-[#111827]"
              />
              <span className="absolute right-4 font-black text-sm uppercase px-2.5 py-1 bg-[#111827] text-white rounded-md">
                {APP_CONFIG.currency}
              </span>
            </div>
            {fieldErrors.amount && (
              <p className="text-xs font-bold text-[#DC2626] mt-1.5">
                ⚠️ {fieldErrors.amount[0]}
              </p>
            )}
          </div>

          {/* SÉLECTEUR DE CATÉGORIE VIA SELECT REQUIS */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#111827] mb-2">
              Catégorie ({isIncome ? "Revenus" : "Dépenses"}) *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border-2 border-[#111827] rounded-xl p-3.5 font-bold text-sm text-[#111827] shadow-[3px_3px_0px_0px_#111827] focus:outline-none focus:bg-[#EFF6FF] focus:shadow-[4px_4px_0px_0px_#111827] cursor-pointer transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* Visualisation de la couleur de catégorie */}
            <div className="flex items-center gap-2 mt-2 px-1">
              <span
                className="w-3 h-3 rounded-full border border-[#111827] shadow-[1px_1px_0px_0px_#111827]"
                style={{ backgroundColor: selectedCatColor }}
              />
              <span className="text-[11px] font-black uppercase text-neutral-600">
                Couleur catégorie : <span className="text-[#111827]">{category}</span>
              </span>
            </div>
          </div>

          {/* SÉLECTEUR MOYEN DE PAIEMENT */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#111827] mb-2">
              Moyen de paiement *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = payment === pm;
                const theme = PAYMENT_METHOD_THEMES[pm] || {
                  bg: "#EFF6FF",
                  text: "#111827",
                };
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPayment(pm)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-[#111827] transition-all cursor-pointer select-none flex items-center justify-between",
                      isSelected
                        ? "shadow-[3px_3px_0px_0px_#111827] -translate-y-0.5 ring-2 ring-[#111827]"
                        : "bg-white hover:bg-[#EFF6FF] shadow-[1px_1px_0px_0px_#111827]",
                    )}
                    style={
                      isSelected
                        ? { backgroundColor: theme.bg, color: theme.text }
                        : {}
                    }
                  >
                    <span className="truncate">{pm}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DATE & NOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#111827] mb-1.5">
                Date de l'opération
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border-2 border-[#111827] rounded-lg px-3 py-2 text-sm font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827] focus:outline-none focus:bg-[#EFF6FF] focus:shadow-[3px_3px_0px_0px_#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#111827] mb-1.5">
                Note / Description (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Déjeuner au restaurant"
                value={note}
                maxLength={250}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border-2 border-[#111827] rounded-lg px-3 py-2 text-sm font-medium text-[#111827] shadow-[2px_2px_0px_0px_#111827] focus:outline-none focus:bg-[#EFF6FF] focus:shadow-[3px_3px_0px_0px_#111827]"
              />
            </div>
          </div>

          {/* RETOURS D'ERREUR OU SUCCÈS */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827] text-xs font-bold text-[#DC2626]">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#F0FDF4] border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827] text-xs font-black text-[#16A34A] flex items-center gap-2">
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
            disabled={isPending}
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
