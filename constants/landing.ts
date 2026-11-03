export interface LandingCapability {
  id: string;
  verbTitle: string;
  benefit: string;
  iconName: string;
  demoTab: 'dashboard' | 'history' | 'stats' | 'wallets';
  color: string;
}

export interface LandingStep {
  number: string;
  title: string;
  description: string;
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

/**
 * 8 Capacités phares orientées verbes d'action avec liens profonds vers la démo (VIT-02, VIT-03)
 */
export const LANDING_CAPABILITIES: LandingCapability[] = [
  {
    id: 'cap-1',
    verbTitle: 'Noter une dépense en 5 s',
    benefit: 'Entrée, sortie ou virement en 3 clics nets.',
    iconName: 'Zap',
    demoTab: 'dashboard',
    color: '#FFE600',
  },
  {
    id: 'cap-2',
    verbTitle: 'Suivre tous vos comptes',
    benefit: 'Wave, Orange Money, espèces et banques réunis.',
    iconName: 'Wallet',
    demoTab: 'wallets',
    color: '#2563EB',
  },
  {
    id: 'cap-3',
    verbTitle: 'Fixer des budgets mensuels',
    benefit: 'Alerte visuelle mécanique avant tout dépassement.',
    iconName: 'PieChart',
    demoTab: 'stats',
    color: '#00DF81',
  },
  {
    id: 'cap-4',
    verbTitle: 'Programmer vos charges fixes',
    benefit: 'Loyer, abonnements : rappels automatiques d’échéance.',
    iconName: 'CalendarClock',
    demoTab: 'dashboard',
    color: '#FF5964',
  },
  {
    id: 'cap-5',
    verbTitle: 'Gérer prêts et dettes',
    benefit: 'Versements partiels et dates limites maîtrisés.',
    iconName: 'HandCoins',
    demoTab: 'dashboard',
    color: '#FFBE0B',
  },
  {
    id: 'cap-6',
    verbTitle: 'Analyser vos dépenses',
    benefit: 'Graphiques nets par catégorie, compte et période.',
    iconName: 'BarChart3',
    demoTab: 'stats',
    color: '#4CC9F0',
  },
  {
    id: 'cap-7',
    verbTitle: 'Retrouver chaque opération',
    benefit: 'Historique filtrable et recherche instantanée.',
    iconName: 'Receipt',
    demoTab: 'history',
    color: '#8338EC',
  },
  {
    id: 'cap-8',
    verbTitle: 'Exporter vos données',
    benefit: 'PDF, CSV ou sauvegarde complète en 1 clic.',
    iconName: 'Download',
    demoTab: 'dashboard',
    color: '#111827',
  },
];

export const LANDING_STEPS: LandingStep[] = [
  {
    number: '01',
    title: 'Créer votre compte gratuit',
    description: 'Une adresse e-mail et un mot de passe sécurisé suffisent en 30 secondes.',
  },
  {
    number: '02',
    title: 'Activer vos comptes usuels',
    description: 'Wave, Orange Money, Espèces ou Banque initialisés instantanément en 1 clic.',
  },
  {
    number: '03',
    title: 'Prendre le contrôle total',
    description: 'Visualisez vos flux en temps réel, respectez vos plafonds et maîtrisez votre argent.',
  },
];

export const LANDING_FAQ: LandingFaqItem[] = [
  {
    question: 'Gest Tracker est-il réellement gratuit ?',
    answer: 'Oui, l’application est 100 % gratuite, sans publicité intrusive, sans abonnement caché et sans revente de données.',
  },
  {
    question: 'Pourquoi l’application est-elle adaptée à l’Afrique de l’Ouest ?',
    answer: 'La devise native est le Franc CFA (FCFA) et la gestion multi-comptes est pensée pour combiner naturellement Wave, Orange Money, MTN, Moov, les comptes bancaires et le cash liquide.',
  },
  {
    question: 'Mes données financières sont-elles en sécurité ?',
    answer: 'Vos données sont chiffrées en base avec des politiques de sécurité hermétiques par utilisateur (Row Level Security). Vous seul pouvez accéder à vos opérations et vous pouvez exporter votre sauvegarde complète à tout moment.',
  },
  {
    question: 'Puis-je tester l’application avant de m’inscrire ?',
    answer: 'Absolument. Le mode Démo Interactif vous permet d’explorer l’ensemble des fonctionnalités sans inscription préalable.',
  },
];
