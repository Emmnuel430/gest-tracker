import { Metadata } from "next";
import { getDashboardDataAction } from "@/actions/transactions";
import { getDueRecurringRulesAction } from "@/actions/recurring";
import { getFinancialInsightsAction } from "@/actions/insights";
import { BalanceSummary } from "@/components/home/BalanceSummary";
import { HomeActions } from "@/components/home/HomeActions";
import { RecentTransactionsList } from "@/components/home/RecentTransactionsList";
import { RecurringAlertBanner } from "@/components/recurring/RecurringAlertBanner";
import { FinancialInsightsCard } from "@/components/insights/FinancialInsightsCard";
import { requireOnboarding } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "GEST TRACKER — Tableau de bord",
  description: "Tableau de bord financier personnel et suivi des dépenses et revenus",
};

export const dynamic = "force-dynamic";

export default async function AuthenticatedDashboardPage() {
  await requireOnboarding();

  const [result, dueRulesRes, insightsRes] = await Promise.all([
    getDashboardDataAction(),
    getDueRecurringRulesAction(),
    getFinancialInsightsAction(),
  ]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dueRules =
    dueRulesRes.success && dueRulesRes.data ? dueRulesRes.data : [];
  const insights =
    insightsRes.success && insightsRes.data ? insightsRes.data : [];

  const emptySummary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  };

  const globalBalance = result.success ? (result.data.globalBalance ?? 0) : 0;
  const summaries =
    result.success && result.data.summaries
      ? result.data.summaries
      : {
          today: emptySummary,
          week: emptySummary,
          month: result.success ? result.data.summary : emptySummary,
          year: emptySummary,
        };

  const recentTransactions = result.success
    ? result.data.recentTransactions
    : [];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* En-tête mobile épuré avec Titre & Devise */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-black text-base flex items-center justify-center rounded-lg border-2 border-white dark:border-[#111827] shadow-[2px_2px_0px_0px_#111827]">
            G
          </span>
          <span className="font-black text-lg sm:text-xl uppercase tracking-tighter text-[#111827] dark:text-[#F8FAFC]">
            GEST TRACKER
          </span>
        </div>
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          FCFA
        </span>
      </div>

      {/* Bannière de confirmation rapide pour les échéances récurrentes dues */}
      <div className="w-full">
        <RecurringAlertBanner
          initialDueRules={dueRules}
          currentMonth={currentMonth}
        />
      </div>

      {/* 1. Résumé du Solde Global et totaux par période (Sections 10 & 11) */}
      <BalanceSummary globalBalance={globalBalance} summaries={summaries} />

      {/* 2. Trilogie financière : Action Bar 2+1 (Entrant, Sortant, Virement) */}
      <HomeActions />

      {/* 3. Bilan & Conseils Financiers */}
      <div className="w-full">
        <FinancialInsightsCard insights={insights} />
      </div>

      {/* 4. Dernières opérations récentes */}
      <RecentTransactionsList transactions={recentTransactions} />
    </div>
  );
}
