import { requireOnboarding } from "@/lib/onboarding";
import { RecurrencesView } from "@/components/recurring/RecurrencesView";

export default async function RecurrencesPage() {
  await requireOnboarding();
  return <RecurrencesView />;
}
