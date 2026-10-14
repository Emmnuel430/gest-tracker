/**
 * Logique pure et matrice de visibilité contextuelle de l'historique financier (v2.4.0)
 * Spécifications : rm.md Section 6.2
 */

export interface HistoryVisibilityInput {
  period: string;
  type: 'all' | 'INCOME' | 'EXPENSE';
  category: string;
  payment: string;
  activeTab?: 'list' | 'analytics' | 'comparison';
}

export interface HistoryVisibilityOutput {
  /** Affiche le bloc de résumé financier (Total Entrées, Total Sorties, Solde Net) */
  showFinancialSummary: boolean;
  /** Affiche l'onglet Graphiques & Répartitions */
  showAnalyticsTab: boolean;
  /** Affiche l'onglet Comparatif vs Période précédente */
  showComparisonTab: boolean;
  /** Affiche la section comparaison par catégorie au sein du comparatif */
  showCategoryComparison: boolean;
  /** Affiche la section comparaison par moyen de paiement au sein du comparatif */
  showPaymentComparison: boolean;
  /** Libellé adapté au type : "Moyen de réception" (INCOME) ou "Moyen de paiement" (EXPENSE / all) */
  paymentLabel: string;
  /** Onglet actif effectif (rabattu sur 'list' si l'onglet demandé est masqué) */
  effectiveActiveTab: 'list' | 'analytics' | 'comparison';
}

export function getHistoryVisibility(input: HistoryVisibilityInput): HistoryVisibilityOutput {
  const isIncome = input.type === 'INCOME';
  const hasSpecificCategory = input.category !== 'all' && input.category.trim().length > 0;
  const hasSpecificPayment = input.payment !== 'all' && input.payment.trim().length > 0;
  const isCustomPeriod = input.period === 'custom';

  // 1. Résumé financier : masqué si type === 'INCOME' selon la matrice de rm.md Section 6.2
  const showFinancialSummary = !isIncome;

  // 2. Onglet Comparatif : masqué en période personnalisée 'custom'
  const showComparisonTab = !isCustomPeriod;

  // 3. Onglet Graphiques : masqué lorsqu'une catégorie spécifique est filtrée
  const showAnalyticsTab = !hasSpecificCategory;

  // 4. Comparatif par Catégorie : masqué si une catégorie est filtrée
  const showCategoryComparison = !hasSpecificCategory;

  // 5. Comparatif par Moyen : masqué si un moyen de paiement est filtré
  const showPaymentComparison = !hasSpecificPayment;

  // 6. Libellé contextuel
  const paymentLabel = isIncome ? 'Moyen de réception' : 'Moyen de paiement';

  // 7. Détermination de l'onglet actif avec redirection automatique
  let effectiveActiveTab: 'list' | 'analytics' | 'comparison' = input.activeTab || 'list';
  if (effectiveActiveTab === 'analytics' && !showAnalyticsTab) {
    effectiveActiveTab = 'list';
  } else if (effectiveActiveTab === 'comparison' && !showComparisonTab) {
    effectiveActiveTab = 'list';
  }

  return {
    showFinancialSummary,
    showAnalyticsTab,
    showComparisonTab,
    showCategoryComparison,
    showPaymentComparison,
    paymentLabel,
    effectiveActiveTab,
  };
}
