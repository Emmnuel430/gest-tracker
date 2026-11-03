'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  HandCoins,
  CalendarClock,
  Receipt,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import { SegmentedGauge } from '@/components/ui/SegmentedGauge';

type ModuleTab = 'budgets' | 'debts' | 'recurrences' | 'history';

export function ModulesShowcase() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('budgets');

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#DCFCE7] dark:bg-[#064E3B] text-[#166534] dark:text-[#A7F3D0] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827]">
          Outils Puissants
        </span>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Aperçu des modules experts
        </h2>
      </div>

      {/* Onglets de sélection */}
      <div className="flex gap-2 p-1.5 bg-neutral-200 dark:bg-[#0F172A] border-3 border-[#111827] dark:border-[#334155] rounded-2xl overflow-x-auto">
        {[
          { id: 'budgets', label: 'Budgets & Plafonds', icon: PieChart },
          { id: 'debts', label: 'Dettes & Créances', icon: HandCoins },
          { id: 'recurrences', label: 'Charges Récurrentes', icon: CalendarClock },
          { id: 'history', label: 'Historique & Filtres', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ModuleTab)}
              className={`flex-1 py-2.5 px-3 text-xs font-black uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] -translate-y-0.5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 stroke-2.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu interactif selon l'onglet */}
      <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-3xl shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] text-left">
        {activeTab === 'budgets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Surveillance des plafonds par catégorie
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                  Jauge mécanique à 10 segments avec seuil d’alerte à 75 % et blocage de dépassement.
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded border border-[#111827] bg-[#FEF3C7] text-[#92400E]">
                Attention (82 %)
              </span>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-black uppercase">
                <span>Alimentation & Courses</span>
                <span>82.000 F / 100.000 F</span>
              </div>
              <SegmentedGauge percentage={82} status="WARNING" />
            </div>
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Suivi des prêts accordés et emprunts
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                  Pont direct avec vos portefeuilles et détection automatique des échéances en retard.
                </p>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded border border-[#111827] bg-[#FEE2E2] text-[#991B1B]">
                <AlertTriangle className="w-3 h-3" />
                En retard
              </span>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase block">Prêt à Koffi Paul</span>
                <span className="text-xs text-neutral-500 font-medium">Échéance dépassée le 28 oct.</span>
              </div>
              <span className="text-base font-black text-[#00DF81]">+25.000 FCFA</span>
            </div>
          </div>
        )}

        {activeTab === 'recurrences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Charges fixes & rappels automatiques
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                  Notification par e-mail à J-7, J-3 et le jour J pour ne manquer aucun loyer ou facture.
                </p>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded border border-[#111827] bg-[#DBEAFE] text-[#1E40AF]">
                <Bell className="w-3 h-3" />
                Rappel activé
              </span>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase block">Loyer Mensuel</span>
                <span className="text-xs text-neutral-500 font-medium">Échéance : le 05 de chaque mois</span>
              </div>
              <span className="text-base font-black text-[#DC2626]">-120.000 FCFA</span>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Historique paginé et filtres instantanés
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                  Recherchez par compte, type ou catégorie avec conservation des filtres dans l’URL.
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded border border-[#111827] bg-[#DCFCE7] text-[#166534]">
                Instantané
              </span>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase block">Virement Wave vers Espèces</span>
                <span className="text-xs text-neutral-500 font-medium">Neutralité statistique totale</span>
              </div>
              <span className="text-base font-black text-[#2563EB]">50.000 FCFA</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-neutral-200 dark:border-[#334155] flex justify-end">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline"
          >
            <span>Tester ce module en démo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
