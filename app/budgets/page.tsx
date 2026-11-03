import { requireOnboarding } from "@/lib/onboarding";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { getBudgetsWithProgressAction } from "@/actions/budgets";
import { formatCurrentMonthISO } from "@/lib/recurring";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budgets & Plafonds | GEST TRACKER",
  description: "Fixez des plafonds mensuels par catégorie et suivez vos consommations sans dépassement.",
};

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const currentMonth = formatCurrentMonthISO();
  const [, budgetsRes] = await Promise.all([
    requireOnboarding(),
    getBudgetsWithProgressAction(currentMonth),
  ]);

  return <BudgetsView initialData={budgetsRes.success ? budgetsRes.data : null} />;
}
