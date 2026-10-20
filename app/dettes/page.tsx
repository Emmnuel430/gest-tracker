'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, HandCoins, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { DebtItem, DebtsSummary, getDebtsAction } from '@/actions/debts';
import { DebtCard } from '@/components/debts/DebtCard';
import { DebtModal } from '@/components/debts/DebtModal';
import { RepaymentModal } from '@/components/debts/RepaymentModal';
import { formatCurrency } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

export default function DettesPage() {
  const [summary, setSummary] = useState<DebtsSummary>({
    totalLentPending: 0,
    totalBorrowedPending: 0,
    netDebtPosition: 0,
    debts: [],
  });
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'LENT' | 'BORROWED' | 'SETTLED'>('ALL');

  const loadDebts = async () => {
    setLoading(true);
    const res = await getDebtsAction();
    if (res.success && res.data) {
      setSummary(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleOpenRepay = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setRepayModalOpen(true);
  };

  const filteredDebts = summary.debts.filter((d) => {
    if (filter === 'SETTLED') return d.status === 'SETTLED';
    if (d.status === 'SETTLED') return false; // En mode standard, n'afficher que les dossiers actifs
    if (filter === 'LENT') return d.type === 'LENT';
    if (filter === 'BORROWED') return d.type === 'BORROWED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] pb-24 transition-colors">
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation & Action */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-black uppercase text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-2 rounded-lg border-2 border-transparent hover:border-[#111827] dark:hover:border-white"
          >
            <ArrowLeft className="w-4 h-4 stroke-3" />
            Accueil
          </Link>

          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs uppercase"
          >
            <Plus className="w-4 h-4 mr-1 stroke-3" />
            Nouveau dossier
          </Button>
        </div>

        {/* Titre & Description */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Dettes & Créances
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
            Suivi des prêts accordés et emprunts en cours.
          </p>
        </div>

        {/* Synthèse globale à 3 blocs */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
              On me doit
            </span>
            <span className="text-sm font-black text-[#00DF81]">
              +{formatCurrency(summary.totalLentPending)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
              Je dois
            </span>
            <span className="text-sm font-black text-[#FF3366]">
              -{formatCurrency(summary.totalBorrowedPending)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
                Position nette
              </span>
              <InfoTooltip
                title="Position nette"
                content="Différence entre ce qui vous est dû et ce que vous devez rembourser."
              />
            </div>
            <span
              className={`text-sm font-black ${
                summary.netDebtPosition >= 0 ? 'text-[#00DF81]' : 'text-[#FF3366]'
              }`}
            >
              {formatCurrency(summary.netDebtPosition)}
            </span>
          </div>
        </div>

        {/* Filtres par onglets */}
        <div className="flex gap-1.5 p-1 bg-neutral-200 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl overflow-x-auto">
          {([
            { id: 'ALL', label: 'En cours' },
            { id: 'LENT', label: 'On me doit' },
            { id: 'BORROWED', label: 'Je dois' },
            { id: 'SETTLED', label: 'Soldés' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-1.5 px-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer truncate ${
                filter === tab.id
                  ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste des dossiers */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Chargement des dossiers...
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1E293B] border-3 border-dashed border-[#111827] dark:border-[#334155] rounded-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#00DF81] text-[#111827] flex items-center justify-center border-2 border-[#111827]">
              <HandCoins className="w-6 h-6 stroke-2.5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Aucun dossier dans cette vue
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                Tous vos comptes sont à jour ou aucun prêt en cours n&apos;est enregistré.
              </p>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="primary"
              className="text-xs uppercase"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-3" />
              Créer un dossier
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onRepay={handleOpenRepay}
                onRefresh={loadDebts}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modale d'ajout */}
      <DebtModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadDebts}
      />

      {/* Modale de remboursement */}
      <RepaymentModal
        isOpen={repayModalOpen}
        onClose={() => setRepayModalOpen(false)}
        onSuccess={loadDebts}
        debt={selectedDebt}
      />
    </div>
  );
}
