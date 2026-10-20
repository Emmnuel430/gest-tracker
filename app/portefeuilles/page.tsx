import { requireOnboarding } from '@/lib/onboarding';
import { PortefeuillesView } from '@/components/wallets/PortefeuillesView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portefeuilles & Comptes | GEST TRACKER',
  description: 'Suivez la répartition réelle de votre argent (Espèces, Wave, Banque) et effectuez des virements internes.',
};

export const dynamic = 'force-dynamic';

export default async function PortefeuillesPage() {
  await requireOnboarding();

  return <PortefeuillesView />;
}
