"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Printer,
  ListOrdered,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { Transaction } from "@/types/transaction";
import { PeriodType } from "@/types/period";
import { PeriodSelector } from "./PeriodSelector";
import { ExpenseRanking } from "./ExpenseRanking";
import { ExpenseChart } from "./ExpenseChart";
import { PaymentMethodChart } from "./PaymentMethodChart";
import { TransactionItem } from "./TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/constants/config";
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculatePaymentMethodBreakdown,
} from "@/lib/statistics";
import { getDateRangeForPeriod, formatDisplayDate } from "@/lib/dates";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import { getTransactionsAction } from "@/actions/transactions";

interface HistoryViewProps {
  initialTransactions: Transaction[];
}

type ActiveTab = "list" | "analytics";

export function HistoryView({ initialTransactions }: HistoryViewProps) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<PeriodType>("month");

  // Dates personnalisées saisies
  const [customStartDate, setCustomStartDate] = useState<string>("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Plage personnalisée appliquée
  const [appliedCustomDates, setAppliedCustomDates] = useState<{
    start: string;
    end: string;
  }>({
    start: "2026-09-01",
    end: new Date().toISOString().split("T")[0],
  });

  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);

  const [typeFilter, setTypeFilter] = useState<"all" | "INCOME" | "EXPENSE">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  // Filtrage selon la période et les critères sélectionnés
  const currentRange = useMemo(() => {
    if (period === "custom") {
      return getDateRangeForPeriod(
        "custom",
        appliedCustomDates.start,
        appliedCustomDates.end,
      );
    }
    return getDateRangeForPeriod(period);
  }, [period, appliedCustomDates]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      // Filtre de date
      if (txDate < currentRange.from || txDate > currentRange.to) {
        return false;
      }
      // Filtre de type
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      // Filtre de catégorie
      if (categoryFilter !== "all" && tx.category !== categoryFilter) {
        return false;
      }
      // Filtre de moyen de paiement
      if (paymentFilter !== "all" && tx.payment !== paymentFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, currentRange, typeFilter, categoryFilter, paymentFilter]);

  // Statistiques calculées dynamiquement sur la sélection
  const summary = useMemo(
    () => calculateFinancialSummary(filteredTransactions),
    [filteredTransactions],
  );

  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(filteredTransactions, "EXPENSE"),
    [filteredTransactions],
  );

  const paymentBreakdown = useMemo(
    () =>
      calculatePaymentMethodBreakdown(
        filteredTransactions.filter((t) => t.type === "EXPENSE"),
      ),
    [filteredTransactions],
  );

  const handleTransactionDeleted = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTransactionUpdated = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  // Déclenchement de la requête personnalisée au clic sur le bouton
  const handleApplyCustomRange = async () => {
    if (!customStartDate || !customEndDate) return;

    setIsLoadingCustom(true);
    try {
      const res = await getTransactionsAction({
        period: "custom",
        startDate: customStartDate,
        endDate: customEndDate,
        limit: 1000,
      });

      if (res.success && Array.isArray(res.data)) {
        // Fusion des nouvelles transactions avec celles déjà en mémoire pour éviter les pertes
        const fetchedMap = new Map<string, Transaction>();
        transactions.forEach((t) => fetchedMap.set(t.id, t));
        res.data.forEach((t: Transaction) => fetchedMap.set(t.id, t));
        setTransactions(Array.from(fetchedMap.values()));
      }

      setAppliedCustomDates({
        start: customStartDate,
        end: customEndDate,
      });
    } catch (err) {
      console.error("Erreur chargement transactions plage perso :", err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const allAvailableCategories = [
    ...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]),
  ];

  return (
    <div className="w-full space-y-6">
      {/* En-tête avec navigation retour et exports */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase px-3 py-1.5 bg-white border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#111827] transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          Accueil
        </Link>

        <h1 className="text-lg font-black uppercase tracking-tight text-[#111827]">
          Historique
        </h1>

        <div className="flex items-center gap-1.5">
          <a
            href={`/api/export/pdf?period=${period}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border-2 border-[#111827] rounded-lg bg-white shadow-[2px_2px_0px_0px_#111827] hover:bg-[#DBEAFE] transition-all cursor-pointer flex items-center gap-1 font-black text-xs text-[#111827]"
            title="Exporter / Imprimer en PDF"
          >
            <Printer className="w-4 h-4 text-[#111827]" />
            <span className="hidden sm:inline">PDF</span>
          </a>

          <a
            href={`/api/export/csv?period=${period}`}
            download
            className="p-1.5 border-2 border-[#111827] rounded-lg bg-white shadow-[2px_2px_0px_0px_#111827] hover:bg-[#EFF6FF] transition-all cursor-pointer flex items-center gap-1 font-black text-xs text-[#111827]"
            title="Exporter en CSV (Excel)"
          >
            <span className="font-extrabold text-[10px] px-0.5">CSV</span>
          </a>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1.5 border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_0px_#111827] transition-all cursor-pointer ${
              showAdvancedFilters ? "bg-[#DBEAFE]" : "bg-white"
            }`}
            title="Filtres précis"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#111827]" />
          </button>
        </div>
      </div>

      {/* 1. Sélecteur de Période avec bouton de requête pour la plage personnalisée */}
      <PeriodSelector
        currentPeriod={period}
        onSelectPeriod={setPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
        onApplyCustomRange={handleApplyCustomRange}
        isLoading={isLoadingCustom}
      />

      {/* Filtres avancés dépliables */}
      {showAdvancedFilters && (
        <div className="bg-white border-2 border-[#111827] rounded-xl p-4 shadow-[4px_4px_0px_0px_#111827] space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b-2 border-[#111827] pb-2">
            <span className="font-black text-xs uppercase flex items-center gap-1.5 text-[#111827]">
              <Filter className="w-3.5 h-3.5" />
              Filtres Précis
            </span>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setPaymentFilter("all");
              }}
              className="text-[11px] font-bold text-neutral-500 hover:text-[#111827] underline cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827]">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full bg-[#EFF6FF] border-2 border-[#111827] rounded-lg p-2 text-xs font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827]"
              >
                <option value="all">Tous les types</option>
                <option value="INCOME">Entrants (Revenus)</option>
                <option value="EXPENSE">Sortants (Dépenses)</option>
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827]">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#EFF6FF] border-2 border-[#111827] rounded-lg p-2 text-xs font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827]"
              >
                <option value="all">Toutes les catégories</option>
                {allAvailableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Moyen de paiement */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827]">Moyen</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-[#EFF6FF] border-2 border-[#111827] rounded-lg p-2 text-xs font-bold text-[#111827] shadow-[2px_2px_0px_0px_#111827]"
              >
                <option value="all">Tous les canaux</option>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. Résumé financier de la période */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[#F0FDF4] border-2 border-[#111827] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Total Entrées</p>
          <p className="text-xs sm:text-sm font-black text-[#16A34A] truncate">
            +{formatCurrency(Math.abs(Number(summary.totalIncome)))}
          </p>
        </div>

        <div className="bg-[#FEF2F2] border-2 border-[#111827] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Total Sorties</p>
          <p className="text-xs sm:text-sm font-black text-[#DC2626] truncate">
            -{formatCurrency(Math.abs(Number(summary.totalExpense)))}
          </p>
        </div>

        <div className="bg-[#EFF6FF] border-2 border-[#111827] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Solde Période</p>
          <p
            className={`text-xs sm:text-sm font-black truncate ${
              summary.balance >= 0 ? "text-[#111827]" : "text-[#DC2626]"
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Indicateur de la plage actuelle couverte */}
      <div className="text-center">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-white border border-[#111827] rounded-md shadow-[1px_1px_0px_0px_#111827] text-neutral-600">
          Du {formatDisplayDate(currentRange.from, "dd MMM yyyy")} au{" "}
          {formatDisplayDate(currentRange.to, "dd MMM yyyy")}
        </span>
      </div>

      {/* 3. Deux onglets : Opérations et Graphiques */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-white border-2 border-[#111827] rounded-xl shadow-[3px_3px_0px_0px_#111827]">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`py-2 px-1 text-center font-black text-xs uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "list"
              ? "bg-[#2563EB] border-[#111827] text-white shadow-[2px_2px_0px_0px_#111827]"
              : "border-transparent text-neutral-700 hover:text-[#111827]"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Opérations ({filteredTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`py-2 px-1 text-center font-black text-xs uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#2563EB] border-[#111827] text-white shadow-[2px_2px_0px_0px_#111827]"
              : "border-transparent text-neutral-700 hover:text-[#111827]"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Graphiques</span>
        </button>
      </div>

      {/* 4. Contenu selon l'onglet actif */}

      {/* Onglet 1 : Liste des Opérations */}
      {activeTab === "list" && (
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="Aucune opération sur cette plage"
              description="Ajustez les dates ou appliquez une plage plus large pour afficher vos opérations."
              actionLabel="＋ Enregistrer une sortie"
              actionHref="/sortant"
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onDeleted={handleTransactionDeleted}
                  onUpdated={handleTransactionUpdated}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet 2 : Graphiques et Répartition */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          {expenseBreakdown.length === 0 ? (
            <EmptyState
              title="Aucune dépense sur cette plage"
              description="Les graphiques s'afficheront dès que des dépenses seront trouvées sur la période."
              actionLabel="＋ Ajouter une dépense"
              actionHref="/sortant"
            />
          ) : (
            <>
              {/* Bar Chart des dépenses */}
              <ExpenseChart data={expenseBreakdown} />

              {/* Classement textuel avec pourcentages */}
              <ExpenseRanking breakdown={expenseBreakdown} />

              {/* Dépenses par moyen de paiement */}
              <PaymentMethodChart breakdown={paymentBreakdown} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
