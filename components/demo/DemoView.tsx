'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Wallet,
  Play,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Lock,
  Sparkles,
  Smartphone,
  Banknote,
  CreditCard,
  UserPlus,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import {
  DEMO_WALLETS,
  DEMO_CATEGORIES,
  DEMO_TRANSACTIONS,
  DEMO_SUMMARIES,
  DEMO_GLOBAL_BALANCE,
  DEMO_CATEGORY_BREAKDOWN,
  DEMO_PAYMENT_BREAKDOWN,
} from '@/lib/demo/demo-data';
import { ReferenceDataProvider } from '@/components/providers/ReferenceDataProvider';
import { DemoActionModal } from '@/components/demo/DemoActionModal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/constants/config';
import { Transaction } from '@/types/transaction';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

type DemoTab = 'dashboard' | 'history' | 'stats' | 'wallets';
type PeriodFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type TypeFilter = 'all' | 'INCOME' | 'EXPENSE';

export function DemoView() {
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');
  const [dashboardPeriod, setDashboardPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Filtres pour l'onglet Historique
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState<TypeFilter>('all');
  const [historyCategory, setHistoryCategory] = useState<string>('all');

  // Gestion de la modal pédagogique démo
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalDesc, setModalDesc] = useState<string>('');

  const triggerDemoAction = (title: string, desc: string) => {
    setModalTitle(title);
    setModalDesc(desc);
    setModalOpen(true);
  };

  // Filtrage en mémoire de l'historique fictif
  const filteredTransactions = useMemo(() => {
    return DEMO_TRANSACTIONS.filter((tx) => {
      // Filtre par type
      if (historyType !== 'all' && tx.type !== historyType) {
        return false;
      }
      // Filtre par catégorie
      if (historyCategory !== 'all' && tx.category !== historyCategory) {
        return false;
      }
      // Filtre par recherche textuelle
      if (historySearch.trim()) {
        const query = historySearch.toLowerCase().trim();
        const matchNote = tx.note?.toLowerCase().includes(query) ?? false;
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchPayment = tx.payment.toLowerCase().includes(query);
        if (!matchNote && !matchCategory && !matchPayment) {
          return false;
        }
      }
      return true;
    });
  }, [historyType, historyCategory, historySearch]);

  const currentSummary = DEMO_SUMMARIES[dashboardPeriod];

  return (
    <ReferenceDataProvider initialCategories={DEMO_CATEGORIES} initialWallets={DEMO_WALLETS} readOnly={true}>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] transition-colors">
        <PublicHeader />

        {/* ========================================================================= */}
        {/* BANNIÈRE SUPÉRIEURE : MODE DÉMO INTERACTIF                                */}
        {/* ========================================================================= */}
        <section className="bg-[#FFE600] text-[#111827] border-b-3 border-[#111827] px-4 py-2.5 sm:py-3 transition-colors">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs font-black">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#111827] text-white">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <span>
                MODE DÉMO INTERACTIF — Données fictives en FCFA (Lecture seule)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline font-bold text-neutral-800 text-[11px]">
                Prêt pour vos vraies dépenses ?
              </span>
              <Link href="/register">
                <button
                  type="button"
                  className="px-3 py-1 bg-[#111827] text-white hover:bg-neutral-800 text-[11px] font-black uppercase rounded-lg border border-[#111827] shadow-[2px_2px_0px_0px_#FFFFFF] cursor-pointer inline-flex items-center gap-1 transition-all"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Créer mon compte</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CONTENU PRINCIPAL DE LA DÉMO                                              */}
        {/* ========================================================================= */}
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-5 sm:py-6 space-y-5">
          {/* Onglets de navigation Démo */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer select-none border-2 ${
                activeTab === 'dashboard'
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#131C31]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[10px] sm:text-xs">Accueil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer select-none border-2 ${
                activeTab === 'history'
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#131C31]'
              }`}
            >
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[10px] sm:text-xs">Historique</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer select-none border-2 ${
                activeTab === 'stats'
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#131C31]'
              }`}
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[10px] sm:text-xs">Stats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallets')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer select-none border-2 ${
                activeTab === 'wallets'
                  ? 'bg-[#3B82F6] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#131C31]'
              }`}
            >
              <Wallet className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[10px] sm:text-xs">Comptes</span>
            </button>
          </div>

          {/* ======================================================================= */}
          {/* ONGLET 1 : TABLEAU DE BORD DÉMO                                         */}
          {/* ======================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Carte Solde Global & Sélecteur de période */}
              <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    <span>Solde Total Disponible</span>
                  </span>

                  {/* Sélecteur de période */}
                  <div className="relative">
                    <select
                      value={dashboardPeriod}
                      onChange={(e) => setDashboardPeriod(e.target.value as any)}
                      className="appearance-none bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white font-black text-xs uppercase pl-2.5 pr-7 py-1 border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] cursor-pointer focus:outline-none"
                    >
                      <option value="today">Aujourd&apos;hui</option>
                      <option value="week">Semaine en cours</option>
                      <option value="month">Mois en cours</option>
                      <option value="year">Année en cours</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-3 text-[#111827] dark:text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                    {formatCurrency(DEMO_GLOBAL_BALANCE)}
                  </h2>
                </div>

                {/* Grille Revenus vs Dépenses pour la période */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-neutral-100 dark:border-neutral-800">
                  <div className="p-3 bg-[#DCFCE7] dark:bg-[#064E3B] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
                    <span className="text-[10px] font-black uppercase text-[#166534] dark:text-[#86EFAC] block">
                      Entrées ({dashboardPeriod})
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#15803D] dark:text-[#4ADE80]">
                      +{formatCurrency(currentSummary.totalIncome)}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FEE2E2] dark:bg-[#3B0D11] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
                    <span className="text-[10px] font-black uppercase text-[#991B1B] dark:text-[#FCA5A5] block">
                      Sorties ({dashboardPeriod})
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#DC2626] dark:text-[#F87171]">
                      -{formatCurrency(currentSummary.totalExpense)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trilogie Financière 2+1 (Actions Démo) */}
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    triggerDemoAction(
                      'Enregistrer une rentrée d’argent',
                      'La saisie d’un revenu avec sélection du compte (Espèces, Wave, Orange Money) nécessite un compte personnel.'
                    )
                  }
                  className="bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-1.5 uppercase text-xs"
                >
                  <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                  <span>Entrant</span>
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  onClick={() =>
                    triggerDemoAction(
                      'Enregistrer une dépense',
                      'L’imputation d’une dépense par catégorie et son débit immédiat du portefeuille source requièrent un compte personnel.'
                    )
                  }
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center gap-1.5 uppercase text-xs"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  <span>Sortant</span>
                </Button>

                <Button
                  variant="warning"
                  size="md"
                  onClick={() =>
                    triggerDemoAction(
                      'Effectuer un virement interne',
                      'Le virement avec neutralité financière et calcul des frais (ex: Banque vers Wave) est accessible avec votre compte personnel.'
                    )
                  }
                  className="col-span-2 flex items-center justify-center gap-1.5 uppercase text-xs"
                >
                  <ArrowRightLeft className="w-4 h-4 stroke-[3]" />
                  <span>Virement Interne (entre mes comptes)</span>
                </Button>
              </div>

              {/* Liste des opérations récentes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
                    Dernières opérations (Fictives)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Voir tout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {DEMO_TRANSACTIONS.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() =>
                        triggerDemoAction(
                          'Détail et édition d’opération',
                          'Vous visualisez une transaction d’exemple. La modification ou la suppression d’opérations est réservée aux utilisateurs enregistrés.'
                        )
                      }
                      className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-all cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg border-2 border-[#111827] dark:border-white flex items-center justify-center shrink-0 ${
                            tx.type === 'INCOME'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : tx.type === 'EXPENSE'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#DBEAFE] text-[#2563EB]'
                          }`}
                        >
                          {tx.type === 'INCOME' ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                          ) : tx.type === 'EXPENSE' ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4 stroke-[3]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] truncate block">
                            {tx.category}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 truncate block">
                            {tx.payment} • {tx.note}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-black ${
                            tx.type === 'INCOME'
                              ? 'text-[#16A34A]'
                              : tx.type === 'EXPENSE'
                              ? 'text-[#DC2626]'
                              : 'text-[#2563EB]'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                          {formatCurrency(Number(tx.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* ONGLET 2 : HISTORIQUE AVEC FILTRAGE INTERACTIF RÉEL                      */}
          {/* ======================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Filtres en direct</span>
                  </h3>
                  <span className="text-[11px] font-black uppercase text-neutral-500">
                    {filteredTransactions.length} opération(s)
                  </span>
                </div>

                {/* Recherche textuelle */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Rechercher par note, catégorie ou compte..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                {/* Filtres Type (Tous / Revenus / Dépenses) */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryType('all')}
                    className={`py-1.5 px-2 text-xs font-black uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      historyType === 'all'
                        ? 'bg-[#111827] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#FFE600]'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryType('INCOME')}
                    className={`py-1.5 px-2 text-xs font-black uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      historyType === 'INCOME'
                        ? 'bg-[#10B981] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Entrées
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryType('EXPENSE')}
                    className={`py-1.5 px-2 text-xs font-black uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      historyType === 'EXPENSE'
                        ? 'bg-[#EF4444] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Sorties
                  </button>
                </div>
              </div>

              {/* Liste des transactions filtrées */}
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-[#1E293B] border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
                    <p className="text-xs font-bold text-neutral-500">
                      Aucune opération démo ne correspond à vos filtres.
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() =>
                        triggerDemoAction(
                          'Détail d’opération en mode démo',
                          `Opération "${tx.category}" de ${formatCurrency(Number(tx.amount))}. Pour gérer vos propres transactions réelles, créez un compte gratuit.`
                        )
                      }
                      className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-all cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg border-2 border-[#111827] dark:border-white flex items-center justify-center shrink-0 ${
                            tx.type === 'INCOME'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : tx.type === 'EXPENSE'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#DBEAFE] text-[#2563EB]'
                          }`}
                        >
                          {tx.type === 'INCOME' ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                          ) : tx.type === 'EXPENSE' ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4 stroke-[3]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] truncate block">
                            {tx.category}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 truncate block">
                            {tx.payment} • {tx.note}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-black ${
                            tx.type === 'INCOME'
                              ? 'text-[#16A34A]'
                              : tx.type === 'EXPENSE'
                              ? 'text-[#DC2626]'
                              : 'text-[#2563EB]'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                          {formatCurrency(Number(tx.amount))}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* ONGLET 3 : STATISTIQUES & ANALYSES                                      */}
          {/* ======================================================================= */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Répartition par catégorie */}
              <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
                    Répartition des dépenses par enveloppe (Mois)
                  </h3>
                  <p className="text-[11px] font-semibold text-neutral-500 mt-0.5">
                    Total dépenses : {formatCurrency(DEMO_SUMMARIES.month.totalExpense)}
                  </p>
                </div>

                <div className="space-y-3">
                  {DEMO_CATEGORY_BREAKDOWN.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#111827] dark:text-[#F8FAFC]">{cat.category}</span>
                        <span className="text-neutral-600 dark:text-neutral-300">
                          {formatCurrency(cat.total)} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-neutral-100 dark:bg-[#0F172A] rounded-full border border-[#111827] dark:border-[#334155] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Répartition par moyen de paiement */}
              <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
                  Canaux de dépense utilisés
                </h3>

                <div className="space-y-2.5">
                  {DEMO_PAYMENT_BREAKDOWN.map((pay) => (
                    <div
                      key={pay.method}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs font-bold"
                    >
                      <span>{pay.method}</span>
                      <span className="font-black text-[#2563EB] dark:text-[#60A5FA]">
                        {formatCurrency(pay.total)} ({pay.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* ONGLET 4 : PORTEFEUILLES & COMPTES                                      */}
          {/* ======================================================================= */}
          {activeTab === 'wallets' && (
            <div className="space-y-4">
              {/* Carte Patrimoine consolidé */}
              <div className="p-5 bg-[#111827] text-white border-3 border-[#111827] dark:border-white rounded-2xl shadow-[5px_5px_0px_0px_#FFE600] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400 block">
                    Patrimoine Total Consolidé
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#FFE600]">
                    {formatCurrency(DEMO_GLOBAL_BALANCE)}
                  </span>
                </div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() =>
                    triggerDemoAction(
                      'Créer un nouveau compte',
                      'L’ajout de portefeuilles personnalisés (Coffre, Tontine, Microfinance, Banque) nécessite votre compte personnel.'
                    )
                  }
                  className="text-xs uppercase"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 stroke-3" />
                  Nouveau
                </Button>
              </div>

              {/* Cartes des portefeuilles */}
              <div className="space-y-3">
                {DEMO_WALLETS.map((w) => (
                  <div
                    key={w.id}
                    onClick={() =>
                      triggerDemoAction(
                        `Gestion du compte "${w.name}"`,
                        `Solde actuel : ${formatCurrency(w.currentBalance)}. Vous pouvez modifier vos soldes déclarés et historiques dans votre espace personnel.`
                      )
                    }
                    className="p-4 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-2 hover:-translate-y-0.5 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-[#111827]"
                          style={{ backgroundColor: w.color }}
                        />
                        <span className="font-black text-sm uppercase text-[#111827] dark:text-[#F8FAFC]">
                          {w.name}
                        </span>
                        {w.isDefault && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB]">
                            Principal
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black text-[#111827] dark:text-[#F8FAFC]">
                        {formatCurrency(w.currentBalance)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <span>Type : {w.type}</span>
                      <span className="text-[#2563EB] dark:text-[#60A5FA] font-black uppercase">
                        Gérer ce compte
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bannière de conversion au bas de chaque vue démo */}
          <div className="p-4 bg-[#DBEAFE] dark:bg-[#1E3A8A] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h4 className="text-xs font-black uppercase text-[#1E3A8A] dark:text-white">
                Convaincu par la simplicité ?
              </h4>
              <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                Créez votre compte en 30 secondes pour débuter votre vrai suivi.
              </p>
            </div>
            <Link href="/register">
              <Button
                variant="primary"
                size="sm"
                className="text-xs uppercase flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white shadow-[2px_2px_0px_0px_#111827]"
              >
                <span>Créer mon compte</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </main>

        {/* Modal d'action démo */}
        <DemoActionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          actionTitle={modalTitle}
          actionDescription={modalDesc}
        />

        <PublicFooter />
      </div>
    </ReferenceDataProvider>
  );
}
