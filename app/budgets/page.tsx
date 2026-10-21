import { requireOnboarding } from "@/lib/onboarding";
import { BudgetsView } from "@/components/budgets/BudgetsView";

export default async function BudgetsPage() {
  await requireOnboarding();
  return <BudgetsView />;
}
