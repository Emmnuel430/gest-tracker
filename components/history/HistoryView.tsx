'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Printer,
  ListOrdered,
  PieChart,
  GitCompare,
} from 'lucide-react';
import Link from 'next/link';
import { Transaction } from '@/types/transaction';
import { PeriodType } from '@/types/period';
import { PeriodSelector } from './PeriodSelector';
import { ExpenseRanking } from './ExpenseRanking';
import { ExpenseChart } from './ExpenseChart';
import { PaymentMethodChart } from './PaymentMethodChart';
import { PeriodComparison } from './PeriodComparison';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/constants/config';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  calculatePaymentMethodBreakdown,
} from '@/lib/statistics';
import { getDateRangeForPeriod, formatPeriodLabel } from '@/lib/dates';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { PAYMENT_METHODS } from '@/constants/payment-methods';
import { getTransactionsAction } from '@/actions/transactions';

interface HistoryViewProps {
  initialTransactions: Transaction[];
}

type ActiveTab = 'list' | 'analytics' | 'comparison';
type TransactionTypeFilter = 'all' | 'INCOME' | 'EXPENSE';

export function HistoryView({ initialTransactions }: HistoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialisation à partir des query params ou valeurs par défaut
  const initialPeriod = (searchParams.get('period') as PeriodType) || 'month';
  const initialType = (searchParams.get('type') as TransactionTypeFilter) || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialPayment = searchParams.get('payment') || 'all';
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'list';

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // Dates personnalisées saisies
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Plage personnalisée appliquée
  const [appliedCustomDates, setAppliedCustomDates] = useState<{
    start: string;
    end: string;
  }>({
    start: '2026-09-01',
    end: new Date().toISOString().split('T')[0],
  });

  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);

  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>(initialType);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [paymentFilter, setPaymentFilter] = useState<string>(initialPayment);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    initialType !== 'all' || initialCategory !== 'all' || initialPayment !== 'all'
  );

  // Section 6 : Si 'custom' est sélectionné, masquer Comparatif et basculer sur 'list'
  useEffect(() => {
    if (period === 'custom' && activeTab === 'comparison') {
      setActiveTab('list');
    }
  }, [period, activeTab]);

  // Section 2.2 : Synchronisation des filtres dans l'URL sans rechargement
  useEffect(() => {
    const params = new URLSearchParams();

    if (period !== 'month') params.set('period', period);
    if (activeTab !== 'list') params.set('tab', activeTab);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (paymentFilter !== 'all') params.set('payment', paymentFilter);

    const queryString = params.toString();
    const newUrl = queryString ? `/historique?${queryString}` : '/historique';
    window.history.replaceState(null, '', newUrl);
  }, [period, activeTab, typeFilter, categoryFilter, paymentFilter]);

  // Calcul de la plage de date courante
  const currentRange = useMemo(() => {
    if (period === 'custom') {
      return getDateRangeForPeriod('custom', appliedCustomDates.start, appliedCustomDates.end);
    }
    return getDateRangeForPeriod(period);
  }, [period, appliedCustomDates]);

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (txDate < currentRange.from || txDate > currentRange.to) {
        return false;
      }
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }
      if (paymentFilter !== 'all' && tx.payment !== paymentFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, currentRange, typeFilter, categoryFilter, paymentFilter]);

  // Statistiques calculées dynamiquement
  const summary = useMemo(
    () => calculateFinancialSummary(filteredTransactions),
    [filteredTransactions]
  );

  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(filteredTransactions, 'EXPENSE'),
    [filteredTransactions]
  );

  const paymentBreakdown = useMemo(
    () => calculatePaymentMethodBreakdown(filteredTransactions.filter((t) => t.type === 'EXPENSE')),
    [filteredTransactions]
  );

  const handleTransactionDeleted = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTransactionUpdated = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const handleApplyCustomRange = async () => {
    if (!customStartDate || !customEndDate) return;

    setIsLoadingCustom(true);
    try {
      const res = await getTransactionsAction({
        period: 'custom',
        startDate: customStartDate,
        endDate: customEndDate,
        limit: 1000,
      });

      if (res.success && Array.isArray(res.data)) {
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
      console.error('Erreur chargement transactions plage perso :', err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const allAvailableCategories = [
    ...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]),
  ];

  return (
    <div className="w-full space-y-5">
      {/* En-tête avec navigation retour et export */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase px-3 py-1.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-[#F8FAFC] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          Accueil
        </Link>

        <h1 className="text-lg font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Historique
        </h1>

        <div className="flex items-center gap-1.5">
          <a
            href={`/api/export/pdf?period=${period}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1E293B] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A8A] transition-all cursor-pointer flex items-center gap-1 font-black text-xs text-[#111827] dark:text-white"
            title="Exporter / Imprimer en PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1.5 border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer ${
              showAdvancedFilters
                ? 'bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#1D4ED8] dark:text-white'
                : 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC]'
            }`}
            title="Filtres précis"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Sélecteur de Période (Sections 2.1 & 3) */}
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
        <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b-2 border-[#111827] dark:border-[#334155] pb-2">
            <span className="font-black text-xs uppercase flex items-center gap-1.5 text-[#111827] dark:text-[#F8FAFC]">
              <Filter className="w-3.5 h-3.5" />
              Filtres Précis
            </span>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setCategoryFilter('all');
                setPaymentFilter('all');
              }}
              className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#111827] dark:hover:text-white underline cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionTypeFilter)}
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
              >
                <option value="all">Tous les types</option>
                <option value="INCOME">Entrants (Revenus)</option>
                <option value="EXPENSE">Sortants (Dépenses)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
              >
                <option value="all">Toutes les catégories</option>
                {allAvailableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                Moyen
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
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
        <div className="bg-[#F0FDF4] dark:bg-[#062413] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">Total Entrées</p>
          <p className="text-xs sm:text-sm font-black text-[#16A34A] truncate">
            +{formatCurrency(Math.abs(Number(summary.totalIncome)))}
          </p>
        </div>

        <div className="bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">Total Sorties</p>
          <p className="text-xs sm:text-sm font-black text-[#DC2626] truncate">
            -{formatCurrency(Math.abs(Number(summary.totalExpense)))}
          </p>
        </div>

        <div className="bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] text-center">
          <p className="text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">Solde Période</p>
          <p
            className={`text-xs sm:text-sm font-black truncate ${
              summary.balance >= 0 ? 'text-[#111827] dark:text-white' : 'text-[#DC2626]'
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Affichage officiel de la période selon Section 2.1 */}
      <div className="text-center">
        <span className="inline-block text-[11px] font-black uppercase px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] text-[#111827] dark:text-[#F8FAFC]">
          {formatPeriodLabel(period, currentRange)}
        </span>
      </div>

      {/* 3. Onglets de l'historique : Opérations | Graphiques | Comparatif (Sections 4 & 6) */}
      <div
        className={`grid ${
          period === 'custom' ? 'grid-cols-2' : 'grid-cols-3'
        } gap-1.5 p-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`py-2 px-1 text-center font-black text-xs uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'list'
              ? 'bg-[#2563EB] border-[#111827] dark:border-white text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
              : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span className="truncate">Opérations ({filteredTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-1 text-center font-black text-xs uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#2563EB] border-[#111827] dark:border-white text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
              : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Graphiques</span>
        </button>

        {/* Section 6 : L'onglet Comparatif est affiché pour toutes les périodes SAUF 'custom' */}
        {period !== 'custom' && (
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 text-center font-black text-xs uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-[#2563EB] border-[#111827] dark:border-white text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
                : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparatif</span>
          </button>
        )}
      </div>

      {/* 4. Contenu selon l'onglet actif */}

      {/* Onglet 1 : Liste des Opérations */}
      {activeTab === 'list' && (
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
      {activeTab === 'analytics' && (
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

      {/* Onglet 3 : Comparatif (Section 4.3 & 5) */}
      {activeTab === 'comparison' && period !== 'custom' && (
        <PeriodComparison
          transactions={transactions}
          period={period}
          currentRange={currentRange}
        />
      )}
    </div>
  );
}
