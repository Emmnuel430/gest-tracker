'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CategoryItem, filterCategoriesByType } from '@/lib/categories';
import { getCategoriesAction } from '@/actions/categories';

interface ReferenceDataContextType {
  categories: CategoryItem[];
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
  getCategoryColor: (categoryName: string, fallbackColor?: string) => string;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | null>(null);

export function ReferenceDataProvider({
  children,
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialCategories?: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(initialCategories.length === 0);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategoriesAction(undefined, { includeArchived: true });
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories :', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, initialCategories.length]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.name.toLowerCase(), cat.color);
    }
    return map;
  }, [categories]);

  const getCategoryColor = useCallback(
    (categoryName: string, fallbackColor: string = '#9E9E9E') => {
      if (!categoryName) return fallbackColor;
      return colorMap.get(categoryName.toLowerCase()) || fallbackColor;
    },
    [colorMap]
  );

  return (
    <ReferenceDataContext.Provider
      value={{
        categories,
        isLoading,
        refreshCategories: fetchCategories,
        getCategoryColor,
      }}
    >
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData() {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error('useReferenceData must be used within a ReferenceDataProvider');
  }
  return context;
}

export function useCategories(
  type?: 'INCOME' | 'EXPENSE',
  options?: { includeArchived?: boolean }
) {
  const { categories, isLoading, refreshCategories, getCategoryColor } = useReferenceData();
  const includeArchived = options?.includeArchived;

  const filteredCategories = useMemo(() => {
    if (!type) {
      return includeArchived ? categories : categories.filter((c) => !c.isArchived);
    }
    return filterCategoriesByType(categories, type, { includeArchived });
  }, [categories, type, includeArchived]);

  return {
    categories: filteredCategories,
    allCategories: categories,
    isLoading,
    refreshCategories,
    getCategoryColor,
  };
}
