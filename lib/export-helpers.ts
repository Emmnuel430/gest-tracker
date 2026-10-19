export interface ExportFilterParams {
  type?: string | null;
  category?: string | null;
  payment?: string | null;
}

export interface ExportFilterDescription {
  hasFilters: boolean;
  filterLabels: string[];
  summaryNote: string;
}

/**
 * Génère une description claire et textuelle des filtres appliqués à l'export.
 * Règle 2.4.0 : la catégorie est ignorée si aucun type n'est spécifié.
 */
export function describeExportFilters(filters: ExportFilterParams): ExportFilterDescription {
  const filterLabels: string[] = [];

  const type = filters.type && filters.type !== 'all' ? filters.type : null;
  const category = type && filters.category && filters.category !== 'all' ? filters.category : null;
  const payment = filters.payment && filters.payment !== 'all' ? filters.payment : null;

  if (type === 'INCOME') {
    filterLabels.push('Type : Entrées uniquement');
  } else if (type === 'EXPENSE') {
    filterLabels.push('Type : Dépenses uniquement');
  }

  if (category) {
    filterLabels.push(`Catégorie : ${category}`);
  }

  if (payment) {
    filterLabels.push(`Moyen : ${payment}`);
  }

  if (filterLabels.length === 0) {
    return {
      hasFilters: false,
      filterLabels: [],
      summaryNote: 'Aucun filtre : toutes les entrées et dépenses de la période sont incluses.',
    };
  }

  return {
    hasFilters: true,
    filterLabels,
    summaryNote: 'Les totaux et la liste ci-dessous portent uniquement sur les opérations correspondant aux filtres appliqués.',
  };
}
