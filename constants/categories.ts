// Catégories officielles issues des spécifications ROADMAP.md (Section 13)

export const INCOME_CATEGORIES = [
  "Travail PC",
  "Cours en ligne",
  "Répetition",
  "Freelance",
  "Business",
  "Don",
  "Autre",
] as const;

export const EXPENSE_CATEGORIES = [
  "Alimentation",
  "Transport",
  "Famille",
  "Kajai",
  "Logement",
  "Santé",
  "Éducation",
  "Abonnement",
  "Loisirs",
  "Personnel",
  "Travail",
  "Autre",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

// Couleurs Néobrutalistes associées aux catégories pour l'affichage visuel
export const CATEGORY_COLORS: Record<string, string> = {
  // Revenus
  "Travail PC": "#00DF81",
  "Cours en ligne": "#3A86FF",
  Répetition: "#FFBE0B",
  Freelance: "#8338EC",
  Business: "#FB5607",
  Don: "#FF006E",
  // Dépenses
  Alimentation: "#FF5964",
  Transport: "#FF9F1C",
  Famille: "#2EC4B6",
  Kajai: "#E71D36",
  Logement: "#7209B7",
  Santé: "#4CC9F0",
  Éducation: "#4361EE",
  Abonnement: "#F72585",
  Loisirs: "#B5179E",
  Personnel: "#70E000",
  Travail: "#38B000",
  Autre: "#9E9E9E",
};

export interface DefaultCategoryItem {
  name: string;
  kind: "INCOME" | "EXPENSE" | "BOTH";
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryItem[] = [
  // Revenus
  { name: "Salaire", kind: "INCOME", color: "#00DF81" },
  { name: "Freelance & Projets", kind: "INCOME", color: "#8338EC" },
  { name: "Business & Ventes", kind: "INCOME", color: "#FB5607" },
  { name: "Investissements", kind: "INCOME", color: "#3A86FF" },
  { name: "Cadeaux & Dons", kind: "INCOME", color: "#FF006E" },

  // Dépenses
  { name: "Logement & Énergie", kind: "EXPENSE", color: "#7209B7" },
  { name: "Alimentation", kind: "EXPENSE", color: "#FF5964" },
  { name: "Transport", kind: "EXPENSE", color: "#FF9F1C" },
  { name: "Factures & Abonnements", kind: "EXPENSE", color: "#F72585" },
  { name: "Santé & Assurances", kind: "EXPENSE", color: "#4CC9F0" },
  { name: "Loisirs & Culture", kind: "EXPENSE", color: "#B5179E" },
  { name: "Shopping & Cadeaux", kind: "EXPENSE", color: "#FFBE0B" },
  { name: "Famille & Enfants", kind: "EXPENSE", color: "#2EC4B6" },
  { name: "Éducation & Formation", kind: "EXPENSE", color: "#4361EE" },
  { name: "Frais Professionnels", kind: "EXPENSE", color: "#38B000" },

  // Both
  { name: "Autre", kind: "BOTH", color: "#9E9E9E" },
];
