import { redirectIfOnboardingCompleted } from '@/lib/onboarding';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bienvenue | Configuration Initiale GEST TRACKER',
  description: 'Configurez vos portefeuilles et catégories pour démarrer sur des bases financières claires.',
};

export const dynamic = 'force-dynamic';

export default async function BienvenuePage() {
  // Redirige vers / si l'onboarding a déjà été complété par cet utilisateur
  await redirectIfOnboardingCompleted();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] py-8 px-4 transition-colors">
      <main className="max-w-2xl mx-auto">
        <OnboardingStepper />
      </main>
    </div>
  );
}
