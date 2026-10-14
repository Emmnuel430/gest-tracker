import { CategoryKind } from '@prisma/client';

export interface CategoryItem {
  id: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  color: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filtre les catégories selon le type d'opération demandé ('INCOME' | 'EXPENSE').
 * Les catégories configurées avec le type 'BOTH' sont toujours compatibles avec les deux flux.
 */
export function filterCategoriesByType<T extends { kind: CategoryKind; isArchived?: boolean }>(
  categories: T[],
  type: 'INCOME' | 'EXPENSE',
  options?: { includeArchived?: boolean } | boolean
): T[] {
  const includeArchived = typeof options === 'boolean' ? options : !!options?.includeArchived;
  return categories.filter((cat) => {
    if (!includeArchived && cat.isArchived) {
      return false;
    }
    return cat.kind === type || cat.kind === 'BOTH';
  });
}
