// Catégories officielles issues des spécifications ROADMAP.md (Section 13)

export const INCOME_CATEGORIES = [
  'Travail PC',
  'Cours en ligne',
  'Répetition',
  'Freelance',
  'Business',
  'Don',
  'Autre',
] as const;

export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Famille',
  'Kajai',
  'Logement',
  'Santé',
  'Éducation',
  'Abonnement',
  'Loisirs',
  'Personnel',
  'Travail',
  'Autre',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

// Couleurs Néobrutalistes associées aux catégories pour l'affichage visuel
export const CATEGORY_COLORS: Record<string, string> = {
  // Revenus
  'Travail PC': '#00DF81',
  'Cours en ligne': '#3A86FF',
  'Répetition': '#FFBE0B',
  'Freelance': '#8338EC',
  'Business': '#FB5607',
  'Don': '#FF006E',
  // Dépenses
  'Alimentation': '#FF5964',
  'Transport': '#FF9F1C',
  'Famille': '#2EC4B6',
  'Kajai': '#E71D36',
  'Logement': '#7209B7',
  'Santé': '#4CC9F0',
  'Éducation': '#4361EE',
  'Abonnement': '#F72585',
  'Loisirs': '#B5179E',
  'Personnel': '#70E000',
  'Travail': '#38B000',
  'Autre': '#9E9E9E',
};

export interface DefaultCategoryItem {
  name: string;
  kind: 'INCOME' | 'EXPENSE' | 'BOTH';
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryItem[] = [
  // Revenus
  { name: 'Travail PC', kind: 'INCOME', color: '#00DF81' },
  { name: 'Cours en ligne', kind: 'INCOME', color: '#3A86FF' },
  { name: 'Répetition', kind: 'INCOME', color: '#FFBE0B' },
  { name: 'Freelance', kind: 'INCOME', color: '#8338EC' },
  { name: 'Business', kind: 'INCOME', color: '#FB5607' },
  { name: 'Don', kind: 'INCOME', color: '#FF006E' },
  // Dépenses
  { name: 'Alimentation', kind: 'EXPENSE', color: '#FF5964' },
  { name: 'Transport', kind: 'EXPENSE', color: '#FF9F1C' },
  { name: 'Famille', kind: 'EXPENSE', color: '#2EC4B6' },
  { name: 'Kajai', kind: 'EXPENSE', color: '#E71D36' },
  { name: 'Logement', kind: 'EXPENSE', color: '#7209B7' },
  { name: 'Santé', kind: 'EXPENSE', color: '#4CC9F0' },
  { name: 'Éducation', kind: 'EXPENSE', color: '#4361EE' },
  { name: 'Abonnement', kind: 'EXPENSE', color: '#F72585' },
  { name: 'Loisirs', kind: 'EXPENSE', color: '#B5179E' },
  { name: 'Personnel', kind: 'EXPENSE', color: '#70E000' },
  { name: 'Travail', kind: 'EXPENSE', color: '#38B000' },
  // Both
  { name: 'Autre', kind: 'BOTH', color: '#9E9E9E' },
];

