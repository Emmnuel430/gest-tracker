"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  PieChart,
  ShieldAlert,
  Wallet,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  getBudgetsWithProgressAction,
  deleteBudgetAction,
  MonthlyBudgetSummary,
  BudgetProgressItem,
} from "@/actions/budgets";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetModal } from "@/components/budgets/BudgetModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/constants/config";

export default function BudgetsPage() {
  const [isPending, startTransition] = useTransition();

  // Mois courant format YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState<MonthlyBudgetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetProgressItem | null>(
    null,
  );

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const loadBudgets = () => {
    setLoading(true);
    getBudgetsWithProgressAction(selectedMonth).then((res) => {
      setLoading(false);
      if (res.success) {
        setData(res.data);
      }
    });
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  // Navigation entre les mois (ex: 2026-10 -> 2026-09 ou 2026-11)
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const date = new Date(y, m - 2, 1);
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const date = new Date(y, m, 1);
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const formatMonthLabel = (mStr: string) => {
    const [y, m] = mStr.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setDeletePending(true);
    startTransition(async () => {
      await deleteBudgetAction(deleteId);
      setDeletePending(false);
      setDeleteId(null);
      loadBudgets();
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* 1. En-tête avec bouton retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Accueil</span>
        </Link>
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#FEF3C7] dark:bg-[#78350F] text-[#92400E] dark:text-[#FDE68A] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          Maîtrise Financière
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Budgets Mensuels
          </h1>
          <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
            Définissez vos plafonds de dépenses pour maîtriser chaque euro/FCFA
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Nouveau Budget</span>
        </Button>
      </div>

      {/* 2. Sélecteur de mois néobrutaliste */}
      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-[#131C31] border-2 border-transparent hover:border-[#111827] rounded-lg transition-all cursor-pointer"
          title="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5 text-[#111827] dark:text-[#F8FAFC] stroke-3" />
        </button>

        <span className="inline-flex items-center text-xs sm:text-sm font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
          <Calendar className="w-4 h-4 mr-1.5" />
          {formatMonthLabel(selectedMonth)}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-[#131C31] border-2 border-transparent hover:border-[#111827] rounded-lg transition-all cursor-pointer"
          title="Mois suivant"
        >
          <ChevronRight className="w-5 h-5 text-[#111827] dark:text-[#F8FAFC] stroke-3" />
        </button>
      </div>

      {/* 3. Synthèse globale du mois */}
      {data && data.items.length > 0 && (
        <Card className="p-5 bg-linear-to-br from-white to-[#F8FAFC] dark:from-[#1E293B] dark:to-[#0F172A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Consommation Globale du Budget
            </h3>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded border-2 border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827] ${
                data.overallPercentage >= 100
                  ? "bg-[#DC2626] text-white"
                  : data.overallPercentage >= 75
                    ? "bg-[#F59E0B] text-black"
                    : "bg-[#10B981] text-white"
              }`}
            >
              {data.overallPercentage}% Consommé
            </span>
          </div>

          <div className="w-full h-5 bg-[#F3F4F6] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-full overflow-hidden mb-4 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                data.overallPercentage >= 100
                  ? "bg-[#DC2626]"
                  : data.overallPercentage >= 75
                    ? "bg-[#F59E0B]"
                    : "bg-[#10B981]"
              }`}
              style={{ width: `${Math.min(data.overallPercentage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t-2 border-neutral-200 dark:border-[#334155]">
            <div>
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                Total Budget
              </span>
              <span className="font-black text-sm text-[#111827] dark:text-[#F8FAFC]">
                {formatCurrency(data.totalBudget)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                Dépensé
              </span>
              <span className="font-black text-sm text-[#111827] dark:text-[#F8FAFC]">
                {formatCurrency(data.totalSpent)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                {data.totalRemaining < 0 ? "Dépassement" : "Reste"}
              </span>
              <span
                className={`font-black text-sm ${
                  data.totalRemaining < 0
                    ? "text-[#DC2626]"
                    : data.overallPercentage >= 75
                      ? "text-[#D97706]"
                      : "text-[#10B981]"
                }`}
              >
                {formatCurrency(Math.abs(data.totalRemaining))}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* 4. Liste des budgets par catégorie */}
      {loading ? (
        <div className="py-12 text-center text-xs font-black uppercase text-neutral-500 animate-pulse">
          Chargement de vos budgets...
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={(item) => {
                setEditingBudget(item);
                setIsModalOpen(true);
              }}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] text-center">
          <div className="w-12 h-12 bg-[#FEF3C7] dark:bg-[#78350F] text-[#D97706] border-2 border-[#111827] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_#111827]">
            <PieChart className="w-6 h-6 stroke-3" />
          </div>
          <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
            Aucun budget pour ce mois
          </h3>
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Fixez un premier plafond de dépense (ex: Alimentation à 60 000 FCFA)
            pour suivre sa consommation en direct.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
            >
              + Créer mon premier budget
            </Button>
          </div>
        </div>
      )}

      {/* Modal d'ajout / modification */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadBudgets}
        currentMonth={selectedMonth}
        initialData={
          editingBudget
            ? {
                id: editingBudget.id,
                category: editingBudget.category,
                amount: editingBudget.amount,
              }
            : null
        }
      />

      {/* Boîte de confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer ce budget ?"
        message="Cette action supprimera le plafond pour ce mois sans toucher à vos dépenses réelles."
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        isLoading={deletePending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
