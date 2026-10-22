'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, Calendar } from 'lucide-react';
import { RecurringRuleItem, getRecurringRulesAction } from '@/actions/recurring';
import { RecurringCard } from '@/components/recurring/RecurringCard';
import { RecurringModal } from '@/components/recurring/RecurringModal';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

export function RecurrencesView() {
  const [rules, setRules] = useState<RecurringRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RecurringRuleItem | null>(null);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const loadRules = async () => {
    setLoading(true);
    const res = await getRecurringRulesAction();
    if (res.success && res.data) {
      setRules(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenCreate = () => {
    setSelectedRule(null);
    setModalOpen(true);
  };

  const handleEdit = (rule: RecurringRuleItem) => {
    setSelectedRule(rule);
    setModalOpen(true);
  };

  // Calculs prévisionnels mensuels
  const activeRules = rules.filter((r) => r.isActive);
  const totalMonthlyExpenses = activeRules
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalMonthlyIncomes = activeRules
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);
  const netMonthly = totalMonthlyIncomes - totalMonthlyExpenses;

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Navigation & Titre */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/gestion"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Gestion</span>
        </Link>

          <Button
            onClick={handleOpenCreate}
            variant="primary"
            size="sm"
            className="text-xs uppercase"
          >
            <Plus className="w-4 h-4 mr-1 stroke-3" />
            Ajouter une charge
          </Button>
        </div>

        {/* Titre & Description épurés */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Charges Récurrentes
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
            Rappels automatiques de vos échéances régulières.
          </p>
        </div>

        {/* Synthèse Prévisionnelle Mensuelle */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
              Rentrées prévues
            </span>
            <span className="text-sm font-black text-[#00DF81]">
              +{formatCurrency(totalMonthlyIncomes)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
              Charges prévues
            </span>
            <span className="text-sm font-black text-[#FF3366]">
              -{formatCurrency(totalMonthlyExpenses)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
                Reste net
              </span>
              <InfoTooltip
                title="Reste net mensuel"
                content="Différence mensuelle estimée entre les rentrées et les charges récurrentes actives."
              />
            </div>
            <span
              className={`text-sm font-black ${
                netMonthly >= 0 ? 'text-[#00DF81]' : 'text-[#FF3366]'
              }`}
            >
              {formatCurrency(netMonthly)}
            </span>
          </div>
        </div>

        {/* Liste des règles */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Chargement des opérations...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1E293B] border-3 border-dashed border-[#111827] dark:border-[#334155] rounded-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FFE600] border-2 border-[#111827] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#111827]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Aucune charge récurrente définie
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                Configurez vos charges régulières pour recevoir vos rappels chaque mois.
              </p>
            </div>
            <Button onClick={handleOpenCreate} variant="primary" className="text-xs uppercase">
              <Plus className="w-4 h-4 mr-1.5 stroke-3" />
              Créer mon premier rappel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500 dark:text-neutral-400 px-1">
              <span>{rules.length} opération(s) programmée(s)</span>
              <span className="text-[11px] font-bold">Mois : {currentMonth}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules.map((rule) => (
                <RecurringCard
                  key={rule.id}
                  rule={rule}
                  currentMonth={currentMonth}
                  onEdit={handleEdit}
                  onRefresh={loadRules}
                />
              ))}
            </div>
          </div>
        )}

      {/* Modal d'ajout / modification */}
      <RecurringModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadRules}
        initialData={selectedRule}
      />
    </div>
  );
}
