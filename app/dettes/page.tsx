import { requireOnboarding } from "@/lib/onboarding";
import { DettesView } from "@/components/debts/DettesView";
import { getDebtsAction } from "@/actions/debts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dettes & Créances | GEST TRACKER",
  description: "Suivez vos créances et dettes avec échéances, remboursements partiels et impact sur vos portefeuilles.",
};

export const dynamic = "force-dynamic";

export default async function DettesPage() {
  const [, debtsRes] = await Promise.all([
    requireOnboarding(),
    getDebtsAction(),
  ]);

  return (
    <DettesView
      initialSummary={
        debtsRes.success && debtsRes.data
          ? debtsRes.data
          : {
              totalLentPending: 0,
              totalBorrowedPending: 0,
              netDebtPosition: 0,
              debts: [],
            }
      }
    />
  );
}
