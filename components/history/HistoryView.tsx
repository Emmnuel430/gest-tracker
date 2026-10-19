'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Printer,
  ListOrdered,
  PieChart,
  GitCompare,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Transaction } from '@/types/transaction';
import { PeriodType } from '@/types/period';
import { PeriodSelector } from './PeriodSelector';
import { CategoryRanking } from './ExpenseRanking';
import { CategoryChart } from './ExpenseChart';
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
import { useCategories, useWallets } from '@/components/providers/ReferenceDataProvider';
import {
  getTransactionsPageAction,
  getHistoryStatsAction,
  HistoryStatsResult,
} from '@/actions/transactions';
import { HistoryFiltersInput } from '@/lib/validations';
import { getHistoryVisibility } from '@/lib/history-visibility';
import { filterCategoriesByType } from '@/lib/categories';

interface HistoryViewProps {
  initialTransactions?: Transaction[];
  initialNextCursor?: string | null;
  initialTotalCount?: number;
  initialStats?: HistoryStatsResult | null;
}

type ActiveTab = 'list' | 'analytics' | 'comparison';
type TransactionTypeFilter = 'all' | 'INCOME' | 'EXPENSE';

export function HistoryView({
  initialTransactions = [],
  initialNextCursor = null,
  initialTotalCount = 0,
  initialStats = null,
}: HistoryViewProps) {
  const searchParams = useSearchParams();
  const { categories, getCategoryColor } = useCategories();
  const { wallets } = useWallets({ includeArchived: true });

  // Initialisation à partir des query params ou valeurs par défaut
  const initialPeriod = (searchParams.get('period') as PeriodType) || 'month';
  const rawType = (searchParams.get('type') as TransactionTypeFilter) || 'all';
  const initialType: TransactionTypeFilter =
    rawType === 'INCOME' || rawType === 'EXPENSE' ? rawType : 'all';

  // Règle T1 : si type === 'all', ignorer la catégorie dans l'URL
  const rawCategory = searchParams.get('category') || 'all';
  const initialCategory = initialType === 'all' ? 'all' : rawCategory;

  const initialPayment = searchParams.get('payment') || 'all';
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'list';

  // États principaux
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>(initialType);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [paymentFilter, setPaymentFilter] = useState<string>(paymentFilterDefault(initialPayment));

  function paymentFilterDefault(val: string) {
    return val;
  }

  // Pagination et données serveur
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || initialTransactions.length);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [serverStats, setServerStats] = useState<HistoryStatsResult | null>(initialStats);

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    initialType !== 'all' || initialCategory !== 'all' || initialPayment !== 'all'
  );

  // Nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (paymentFilter !== 'all') count++;
    return count;
  }, [typeFilter, categoryFilter, paymentFilter]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Catégories dépendantes du type sélectionné (Section 6.2 & T1)
  const availableCategories = useMemo(() => {
    if (typeFilter === 'all') return [];
    return filterCategoriesByType(categories, typeFilter as 'INCOME' | 'EXPENSE');
  }, [categories, typeFilter]);

  // Gestion du changement de type avec réinitialisation de catégorie si incompatible
  const handleTypeChange = (newType: TransactionTypeFilter) => {
    setTypeFilter(newType);
    if (newType === 'all') {
      setCategoryFilter('all');
    } else {
      const allowed = filterCategoriesByType(categories, newType as 'INCOME' | 'EXPENSE');
      const stillValid = allowed.some(
        (c) => c.name.toLowerCase() === categoryFilter.toLowerCase()
      );
      if (!stillValid) {
        setCategoryFilter('all');
      }
    }
  };

  // Liste dynamique des moyens de paiement / portefeuilles disponibles
  const availablePayments = useMemo(() => {
    const set = new Set<string>();
    for (const w of wallets) {
      if (w.name) set.add(w.name);
    }
    for (const t of initialTransactions) {
      if (t.payment) set.add(t.payment);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [wallets, initialTransactions]);

  // Matrice de visibilité (Section 6.2)
  const visibility = useMemo(() => {
    return getHistoryVisibility({
      period,
      type: typeFilter,
      category: categoryFilter,
      payment: paymentFilter,
      activeTab,
    });
  }, [period, typeFilter, categoryFilter, paymentFilter, activeTab]);

  // Redirection automatique si l'onglet actif est masqué
  useEffect(() => {
    if (activeTab !== visibility.effectiveActiveTab) {
      setActiveTab(visibility.effectiveActiveTab);
    }
  }, [activeTab, visibility.effectiveActiveTab]);

  // Synchronisation des filtres dans l'URL sans rechargement
  useEffect(() => {
    const params = new URLSearchParams();

    if (period !== 'month') params.set('period', period);
    if (activeTab !== 'list') params.set('tab', activeTab);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (paymentFilter !== 'all') params.set('payment', paymentFilter);
    if (period === 'custom') {
      params.set('start', appliedCustomDates.start);
      params.set('end', appliedCustomDates.end);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/historique?${queryString}` : '/historique';
    window.history.replaceState(null, '', newUrl);
  }, [period, activeTab, typeFilter, categoryFilter, paymentFilter, appliedCustomDates]);

  // Calcul de la plage de date courante
  const currentRange = useMemo(() => {
    if (period === 'custom') {
      return getDateRangeForPeriod('custom', appliedCustomDates.start, appliedCustomDates.end);
    }
    return getDateRangeForPeriod(period);
  }, [period, appliedCustomDates]);

  // Chargement des données paginées et statistiques serveur
  const loadData = useCallback(async () => {
    setIsLoadingPage(true);
    const filterParams: HistoryFiltersInput = {
      period,
      type: typeFilter,
      category: categoryFilter,
      payment: paymentFilter,
      startDate: period === 'custom' ? appliedCustomDates.start : undefined,
      endDate: period === 'custom' ? appliedCustomDates.end : undefined,
      tab: activeTab,
    };

    const [pageRes, statsRes] = await Promise.all([
      getTransactionsPageAction(filterParams, null, 20),
      getHistoryStatsAction(filterParams),
    ]);

    if (pageRes.success && pageRes.data) {
      setTransactions(pageRes.data.items);
      setNextCursor(pageRes.data.nextCursor);
      setTotalCount(pageRes.data.totalCount);
    }
    if (statsRes.success && statsRes.data) {
      setServerStats(statsRes.data);
    }
    setIsLoadingPage(false);
  }, [period, typeFilter, categoryFilter, paymentFilter, appliedCustomDates, activeTab]);

  const isFirstMount = useRef(true);

  // Rechargement dès que les filtres changent
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialTransactions.length > 0 || initialStats !== null) {
        return;
      }
    }
    loadData();
  }, [loadData, initialTransactions.length, initialStats]);

  // Chargement de la page suivante ("Charger plus")
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const filterParams: HistoryFiltersInput = {
      period,
      type: typeFilter,
      category: categoryFilter,
      payment: paymentFilter,
      startDate: period === 'custom' ? appliedCustomDates.start : undefined,
      endDate: period === 'custom' ? appliedCustomDates.end : undefined,
      tab: activeTab,
    };

    const res = await getTransactionsPageAction(filterParams, nextCursor, 20);
    if (res.success && res.data) {
      setTransactions((prev) => [...prev, ...res.data.items]);
      setNextCursor(res.data.nextCursor);
    }
    setIsLoadingMore(false);
  };

  const handleTransactionDeleted = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    loadData();
  };

  const handleTransactionUpdated = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    loadData();
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const handleApplyCustomRange = async () => {
    setIsLoadingCustom(true);
    setAppliedCustomDates({
      start: customStartDate,
      end: customEndDate,
    });
    setIsLoadingCustom(false);
  };

  // Résumé et décompositions calculés (priorité serveur, repli local instantané)
  const targetCategoryType = typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE';
  const summary = serverStats?.summary || calculateFinancialSummary(transactions);
  const categoryBreakdown =
    serverStats?.categoryBreakdown ||
    calculateCategoryBreakdown(transactions, targetCategoryType, getCategoryColor);
  const paymentBreakdown =
    serverStats?.paymentBreakdown ||
    calculatePaymentMethodBreakdown(
      typeFilter === 'INCOME'
        ? transactions.filter((t) => t.type === 'INCOME')
        : transactions.filter((t) => t.type === 'EXPENSE')
    );

  // Nombre de colonnes de la grille d'onglets selon visibilité
  const visibleTabsCount =
    1 + (visibility.showAnalyticsTab ? 1 : 0) + (visibility.showComparisonTab ? 1 : 0);

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
            href={`/api/export/pdf?period=${period}&type=${typeFilter}&category=${encodeURIComponent(
              categoryFilter
            )}&payment=${encodeURIComponent(paymentFilter)}${
              period === 'custom'
                ? `&start=${appliedCustomDates.start}&end=${appliedCustomDates.end}`
                : ''
            }`}
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
            aria-pressed={showAdvancedFilters}
            className={`p-1.5 border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5 ${
              hasActiveFilters
                ? 'bg-[#FFE600] text-[#111827] dark:bg-[#FFE600] dark:text-[#111827] border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#FFFFFF]'
                : showAdvancedFilters
                ? 'bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#1D4ED8] dark:text-white'
                : 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC]'
            }`}
            title="Filtres précis"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="w-4 h-4 text-[10px] font-black rounded-full bg-[#111827] text-white flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. Sélecteur de Période */}
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
            {/* Type d'opération */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value as TransactionTypeFilter)}
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
              >
                <option value="all">Tous les types</option>
                <option value="INCOME">Entrants (Revenus)</option>
                <option value="EXPENSE">Sortants (Dépenses)</option>
              </select>
            </div>

            {/* Catégorie dépendante du type (Section 6.2 & T1) */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={typeFilter === 'all'}
                className={`w-full border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] ${
                  typeFilter === 'all'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60'
                    : 'bg-[#EFF6FF] dark:bg-[#131C31]'
                }`}
              >
                <option value="all">Toutes les catégories</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {typeFilter === 'all' && (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold mt-1 italic">
                  Choisissez d&apos;abord un type
                </p>
              )}
            </div>

            {/* Moyen de paiement / réception */}
            <div>
              <label className="block text-[11px] font-black uppercase mb-1 text-[#111827] dark:text-neutral-300">
                {visibility.paymentLabel}
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-[#EFF6FF] dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-lg p-2 text-xs font-bold text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
              >
                <option value="all">Tous les canaux</option>
                {availablePayments.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. Résumé financier de la période (masqué si type === INCOME selon la matrice 6.2) */}
      {visibility.showFinancialSummary && (
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
      )}

      {/* Affichage officiel de la période */}
      <div className="text-center">
        <span className="inline-block text-[11px] font-black uppercase px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] text-[#111827] dark:text-[#F8FAFC]">
          {formatPeriodLabel(period, currentRange)}
        </span>
      </div>

      {/* 3. Onglets de l'historique : Opérations | Graphiques | Comparatif selon matrice */}
      <div
        className={`grid gap-1.5 p-1 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] ${
          visibleTabsCount === 1 ? 'grid-cols-1' : visibleTabsCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
        }`}
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
          <span className="truncate">Opérations ({totalCount})</span>
        </button>

        {visibility.showAnalyticsTab && (
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
        )}

        {visibility.showComparisonTab && (
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

      {/* Onglet 1 : Liste des Opérations avec pagination par curseur */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {isLoadingPage ? (
            <div className="p-8 text-center bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des opérations...
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="Aucune opération sur cette plage"
              description="Ajustez les dates ou appliquez une plage plus large pour afficher vos opérations."
              actionLabel="＋ Enregistrer une opération"
              actionHref="/sortant"
            />
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onDeleted={handleTransactionDeleted}
                  onUpdated={handleTransactionUpdated}
                />
              ))}

              {/* Bouton Charger plus */}
              {nextCursor && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full py-2.5 px-4 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_#111827] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isLoadingMore
                      ? 'Chargement...'
                      : `Charger plus (${transactions.length} sur ${totalCount})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Onglet 2 : Graphiques et Répartition (masqué si une catégorie est filtrée) */}
      {activeTab === 'analytics' && visibility.showAnalyticsTab && (
        <div className="space-y-5">
          {categoryBreakdown.length === 0 ? (
            <EmptyState
              title={
                typeFilter === 'INCOME'
                  ? 'Aucune entrée sur cette plage'
                  : 'Aucune dépense sur cette plage'
              }
              description="Les graphiques s'afficheront dès que des opérations seront trouvées sur la période."
              actionLabel={typeFilter === 'INCOME' ? '＋ Ajouter un revenu' : '＋ Ajouter une dépense'}
              actionHref={typeFilter === 'INCOME' ? '/entrant' : '/sortant'}
            />
          ) : (
            <>
              {/* Bar Chart générique (Catégories) */}
              <CategoryChart
                data={categoryBreakdown}
                type={typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE'}
              />

              {/* Classement textuel avec pourcentages */}
              <CategoryRanking
                breakdown={categoryBreakdown}
                type={typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE'}
              />

              {/* Dépenses / Entrées par moyen */}
              <PaymentMethodChart
                breakdown={paymentBreakdown}
                label={visibility.paymentLabel}
                type={typeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE'}
              />
            </>
          )}
        </div>
      )}

      {/* Onglet 3 : Comparatif contextuel */}
      {activeTab === 'comparison' && visibility.showComparisonTab && (
        <PeriodComparison
          data={serverStats?.periodComparison}
          transactions={transactions}
          period={period}
          currentRange={currentRange}
          typeFilter={typeFilter}
          showCategorySection={visibility.showCategoryComparison}
          showPaymentSection={visibility.showPaymentComparison}
          paymentLabel={visibility.paymentLabel}
        />
      )}
    </div>
  );
}
