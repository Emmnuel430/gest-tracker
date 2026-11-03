import { requireOnboarding } from '@/lib/onboarding';
import { PortefeuillesView } from '@/components/wallets/PortefeuillesView';
import { getWalletsAction, getNetWorthAction } from '@/actions/wallets';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portefeuilles & Comptes | GEST TRACKER',
  description: 'Suivez la répartition réelle de votre argent (Espèces, Wave, Banque) et effectuez des virements internes.',
};

export const dynamic = 'force-dynamic';

export default async function PortefeuillesPage() {
  const [, walletsRes, netWorthRes] = await Promise.all([
    requireOnboarding(),
    getWalletsAction({ includeArchived: false }),
    getNetWorthAction(),
  ]);

  return (
    <PortefeuillesView
      initialWallets={walletsRes.success && walletsRes.data ? walletsRes.data : []}
      initialNetWorth={netWorthRes.success && netWorthRes.data ? netWorthRes.data : null}
    />
  );
}
