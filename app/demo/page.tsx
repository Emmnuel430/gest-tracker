import { Metadata } from 'next';
import { DemoView } from '@/components/demo/DemoView';

export const metadata: Metadata = {
  title: 'GEST TRACKER — Démo Interactive sans inscription',
  description: 'Explorez et essayez Gest Tracker librement avec des données fictives en FCFA. Découvrez le tableau de bord, l\'historique, les graphiques et les portefeuilles.',
};

export const dynamic = 'force-dynamic';

export default function DemoPage() {
  return <DemoView />;
}
