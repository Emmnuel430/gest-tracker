"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PieChart,
  Repeat,
  Wallet,
  HandCoins,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function OptionsPage() {
  const modules = [
    {
      title: "Budgets & Plafonds",
      href: "/budgets",
      description:
        "Plafonds mensuels par catégorie avec jauges de consommation et alertes.",
      badge: "Mensuel",
      color: "#D97706",
      bgLight: "#FFFBEB",
      bgDark: "#78350F/25",
      icon: <PieChart className="w-6 h-6 text-[#D97706] stroke-2.5" />,
      actionLabel: "Gérer les budgets",
    },
    {
      title: "Règles Récurrentes",
      href: "/recurrences",
      description:
        "Automatisez vos loyers, abonnements et salaires avec alertes chaque début de mois.",
      badge: "Rappels",
      color: "#7C3AED",
      bgLight: "#F5F3FF",
      bgDark: "#5B21B6/25",
      icon: <Repeat className="w-6 h-6 text-[#7C3AED] stroke-2.5" />,
      actionLabel: "Voir les récurrences",
    },
    {
      title: "Portefeuilles & Virements",
      href: "/portefeuilles",
      description:
        "Comptes physiques et virtuels (Espèces, Wave, Banque) et virements internes.",
      badge: "Multi-comptes",
      color: "#059669",
      bgLight: "#ECFDF5",
      bgDark: "#064E3B/25",
      icon: <Wallet className="w-6 h-6 text-[#059669] stroke-2.5" />,
      actionLabel: "Ouvrir les comptes",
    },
    {
      title: "Dettes & Créances",
      href: "/dettes",
      description:
        "Suivi rigoureux de l’argent prêté à autrui et de vos emprunts en attente de solde.",
      badge: "Remboursements",
      color: "#DB2777",
      bgLight: "#FDF2F8",
      bgDark: "#831843/25",
      icon: <HandCoins className="w-6 h-6 text-[#DB2777] stroke-2.5" />,
      actionLabel: "Suivre les dettes",
    },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* En-tête avec retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Tableau de bord</span>
        </Link>
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#1D4ED8] dark:text-[#93C5FD] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          Gestion & Outils
        </span>
      </div>

      {/* Titre de section */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#2563EB] text-white border-2 border-[#111827] dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
            <SlidersHorizontal className="w-5 h-5 stroke-2.5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
              Options & Modules
            </h1>
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              Outils financiers avancés pour piloter vos finances au quotidien
            </p>
          </div>
        </div>
      </div>

      {/* Grille des 4 modules */}
      <div className="space-y-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="block group">
            <Card className="p-4 sm:p-5 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-[#111827] dark:border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] transition-transform group-hover:scale-105"
                    style={{ backgroundColor: mod.bgLight }}
                  >
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                        {mod.title}
                      </h2>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-[#111827] dark:border-neutral-600 rounded">
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <span className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-2 border-[#111827] dark:border-neutral-600 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4 stroke-3" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Carte d'information / astuce */}
      <div className="p-4 bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
        <div className="p-2 bg-[#2563EB] text-white rounded-xl border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827]">
          <Sparkles className="w-5 h-5 stroke-2.5" />
        </div>
        <div className="text-xs">
          <p className="font-black text-[#111827] dark:text-[#F8FAFC]">
            Conseil d’organisation
          </p>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-0.5">
            Configurez vos budgets et vos récurrences en début de mois pour
            bénéficier d’analyses financières ultra-précises sur votre tableau
            de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
