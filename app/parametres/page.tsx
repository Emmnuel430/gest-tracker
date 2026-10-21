import { requireOnboarding } from "@/lib/onboarding";
import { ParametresView } from "@/components/settings/ParametresView";

export default async function ParametresPage() {
  await requireOnboarding();
  return <ParametresView />;
}
