'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Transaction } from '@/types/transaction';
import { PeriodType } from '@/types/period';
import { PeriodSelector } from './PeriodSelector';
import { ExpenseRanking } from './ExpenseRanking';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/constants/config';
import { calculateFinancialSummary, calculateCategoryBreakdown } from '@/lib/statistics';
import { getDateRangeForPeriod } from '@/lib/dates';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { PAYMENT_METHODS } from '@/constants/payment-methods';

interface HistoryViewProps {
  initialTransactions: Transaction[];
}

export function HistoryView({ initialTransactions }: HistoryViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<PeriodType>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Filtrage selon la période et les critères sélectionnés
  const filteredTransactions = useMemo(() => {
    const range = getDateRangeForPeriod(period);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      // Filtre de date
      if (txDate < range.from || txDate > range.to) {
        return false;
      }
      // Filtre de type
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      // Filtre de catégorie
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }
      // Filtre de moyen de paiement
      if (paymentFilter !== 'all' && tx.payment !== paymentFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, period, typeFilter, categoryFilter, paymentFilter]);

  // Statistiques calculées dynamiquement sur la sélection
  const summary = useMemo(
    () => calculateFinancialSummary(filteredTransactions),
    [filteredTransactions]
  );

  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(filteredTransactions, 'EXPENSE'),
    [filteredTransactions]
  );

  const handleTransactionDeleted = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const allAvailableCategories = [
    ...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]),
  ];

  return (
    <div className="w-full space-y-6">
      {/* En-tête avec navigation retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          Accueil
        </Link>

        <h1 className="text-lg font-black uppercase tracking-tight text-black">
          Historique
        </h1>

        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`p-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer ${
            showAdvancedFilters ? 'bg-[#FFDE59]' : 'bg-white'
          }`}
          title="Filtres avancés"
        >
          <SlidersHorizontal className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* 1. Sélecteur de période Néobrutaliste */}
      <PeriodSelector currentPeriod={period} onSelectPeriod={setPeriod} />

      {/* 2. Filtres avancés (Type, Catégorie, Moyen) */}
      {showAdvancedFilters && (
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Filtre Type */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full bg-[#FFFDF9] border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              >
                <option value="all">Tous les types</option>
                <option value="INCOME">Revenus uniquement (+)</option>
                <option value="EXPENSE">Dépenses uniquement (-)</option>
              </select>
            </div>

            {/* Filtre Catégorie */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#FFFDF9] border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              >
                <option value="all">Toutes les catégories</option>
                {allAvailableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Moyen */}
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                Moyen de paiement
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-[#FFFDF9] border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              >
                <option value="all">Tous les moyens</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Synthèse de la période sélectionnée */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[#E1FCEF] border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Entrées</p>
          <p className="text-xs sm:text-sm font-black text-[#008A50] truncate">
            +{formatCurrency(summary.totalIncome)}
          </p>
        </div>

        <div className="bg-[#FFEAEB] border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Sorties</p>
          <p className="text-xs sm:text-sm font-black text-[#FF3847] truncate">
            -{formatCurrency(summary.totalExpense)}
          </p>
        </div>

        <div className="bg-[#FFF9D2] border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600">Solde Période</p>
          <p
            className={`text-xs sm:text-sm font-black truncate ${
              summary.balance >= 0 ? 'text-black' : 'text-[#FF3847]'
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* 4. Top Catégories (si des dépenses existent) */}
      {expenseBreakdown.length > 0 && <ExpenseRanking breakdown={expenseBreakdown} />}

      {/* 5. Liste des Transactions filtrées */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-black">
            Opérations ({filteredTransactions.length})
          </h2>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Aucune opération sur cette période"
            description="Modifiez la période ou enregistrez une nouvelle opération."
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
