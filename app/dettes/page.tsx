import { requireOnboarding } from "@/lib/onboarding";
import { DettesView } from "@/components/debts/DettesView";

export default async function DettesPage() {
  await requireOnboarding();
  return <DettesView />;
}
