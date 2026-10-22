import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOptionalUser } from '@/lib/auth';
import { PublicLandingView } from '@/components/public/PublicLandingView';

export const metadata: Metadata = {
  title: 'GEST TRACKER — Suivi des dépenses & revenus',
  description: 'Application personnelle de gestion financière et multi-comptes (Espèces, Wave, Orange Money, Banques) en zone FCFA.',
};

export const dynamic = 'force-dynamic';

export default async function LandingOrDashboardPage() {
  const user = await getOptionalUser();

  // Si l'utilisateur est déjà authentifié, redirection immédiate vers son tableau de bord privé
  if (user) {
    redirect('/app');
  }

  // Pour les visiteurs anonymes, affichage de la page de présentation publique
  return <PublicLandingView />;
}
