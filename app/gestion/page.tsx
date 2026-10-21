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
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { requireOnboarding } from "@/lib/onboarding";
import { getGestionMetricsAction } from "@/actions/gestion";

export default async function GestionPage() {
  await requireOnboarding();

  const metricsRes = await getGestionMetricsAction();
  const metrics = metricsRes.success ? metricsRes.data : null;

  const getBadgeClass = (variant?: "neutral" | "warning" | "danger" | "success") => {
    switch (variant) {
      case "danger":
        return "bg-[#FEE2E2] dark:bg-[#7F1D1D]/40 text-[#991B1B] dark:text-[#FCA5A5] border-[#111827] dark:border-[#DC2626]";
      case "warning":
        return "bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FDE68A] border-[#111827] dark:border-[#D97706]";
      case "success":
        return "bg-[#D1FAE5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#6EE7B7] border-[#111827] dark:border-[#059669]";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-[#111827] dark:border-neutral-600";
    }
  };

  const modules = [
    {
      title: "Budgets & Plafonds",
      href: "/budgets",
      description: "Plafonds mensuels et suivi de consommation en direct.",
      badge: metrics?.budgets.badgeText || "Plafonds",
      badgeVariant: metrics?.budgets.badgeVariant || "neutral",
      color: "#D97706",
      bgLight: "#FFFBEB",
      bgDark: "#78350F/25",
      icon: <PieChart className="w-6 h-6 text-[#D97706] stroke-2.5" />,
    },
    {
      title: "Règles Récurrentes",
      href: "/recurrences",
      description: "Charges régulières et alertes e-mail programmées.",
      badge: metrics?.recurrences.badgeText || "Rappels",
      badgeVariant: metrics?.recurrences.badgeVariant || "neutral",
      color: "#7C3AED",
      bgLight: "#F5F3FF",
      bgDark: "#5B21B6/25",
      icon: <Repeat className="w-6 h-6 text-[#7C3AED] stroke-2.5" />,
    },
    {
      title: "Portefeuilles & Virements",
      href: "/portefeuilles",
      description: "Comptes de trésorerie et virements internes.",
      badge: metrics?.wallets.badgeText || "Comptes",
      badgeVariant: metrics?.wallets.badgeVariant || "neutral",
      color: "#059669",
      bgLight: "#ECFDF5",
      bgDark: "#064E3B/25",
      icon: <Wallet className="w-6 h-6 text-[#059669] stroke-2.5" />,
    },
    {
      title: "Dettes & Créances",
      href: "/dettes",
      description: "Suivi des prêts accordés et des emprunts en cours.",
      badge: metrics?.debts.badgeText || "Dossiers",
      badgeVariant: metrics?.debts.badgeVariant || "neutral",
      color: "#DB2777",
      bgLight: "#FDF2F8",
      bgDark: "#831843/25",
      icon: <HandCoins className="w-6 h-6 text-[#DB2777] stroke-2.5" />,
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Gestion & Modules
              </h1>
              <InfoTooltip
                title="Hub de Gestion"
                content="Vos 4 modules spécialisés pour piloter vos budgets, charges fixes, comptes et prêts."
              />
            </div>
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-0.5">
              4 modules spécialisés pour piloter vos finances
            </p>
          </div>
        </div>
      </div>

      {/* Grille des modules avec Smart Badges */}
      <div className="space-y-3.5">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="block group">
            <Card className="p-4 sm:p-4.5 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_#111827] dark:group-hover:shadow-[6px_6px_0px_0px_#000000] cursor-pointer">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-[#111827] dark:border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] transition-transform group-hover:scale-105"
                    style={{ backgroundColor: mod.bgLight }}
                  >
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                        {mod.title}
                      </h2>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 border rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] ${getBadgeClass(
                          mod.badgeVariant
                        )}`}
                      >
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 truncate">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-2 border-[#111827] dark:border-neutral-600 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111827] dark:shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4 stroke-3" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Astuce compacte & discrète */}
      <div className="p-3 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 border-2 border-[#111827] dark:border-[#334155] rounded-xl flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
        <div className="p-1.5 bg-[#2563EB] text-white rounded-lg border border-[#111827] shrink-0">
          <Sparkles className="w-4 h-4 stroke-2.5" />
        </div>
        <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          <span className="font-black text-[#111827] dark:text-[#F8FAFC] mr-1">Astuce :</span>
          Configurez vos budgets et récurrences en début de mois pour des analyses fiables.
        </p>
      </div>
    </div>
  );
}
