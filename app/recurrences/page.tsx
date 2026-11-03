import { requireOnboarding } from "@/lib/onboarding";
import { RecurrencesView } from "@/components/recurring/RecurrencesView";
import { getRecurringRulesAction } from "@/actions/recurring";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charges Récurrentes | GEST TRACKER",
  description: "Gérez vos abonnements, loyers et revenus réguliers avec des alertes et rappels e-mail programmés.",
};

export const dynamic = "force-dynamic";

export default async function RecurrencesPage() {
  const [, rulesRes] = await Promise.all([
    requireOnboarding(),
    getRecurringRulesAction(),
  ]);

  return (
    <RecurrencesView
      initialRules={rulesRes.success && rulesRes.data ? rulesRes.data : []}
    />
  );
}
