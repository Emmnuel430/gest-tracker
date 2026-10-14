'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CategoryItem, filterCategoriesByType } from '@/lib/categories';
import { getCategoriesAction } from '@/actions/categories';
import { WalletItem, getWalletsAction } from '@/actions/wallets';

interface ReferenceDataContextType {
  categories: CategoryItem[];
  wallets: WalletItem[];
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  getCategoryColor: (categoryName: string, fallbackColor?: string) => string;
  getWalletColor: (walletNameOrId: string, fallbackColor?: string) => string;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | null>(null);

export function ReferenceDataProvider({
  children,
  initialCategories = [],
  initialWallets = [],
}: {
  children: React.ReactNode;
  initialCategories?: CategoryItem[];
  initialWallets?: WalletItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [wallets, setWallets] = useState<WalletItem[]>(initialWallets);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialCategories.length === 0 || initialWallets.length === 0
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategoriesAction(undefined, { includeArchived: true });
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories :', err);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await getWalletsAction({ includeArchived: true });
      if (res.success && res.data) {
        setWallets(res.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des portefeuilles :', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchWallets()]);
      if (isMounted) setIsLoading(false);
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [fetchCategories, fetchWallets]);

  // Map de couleurs des catégories
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.name.toLowerCase(), cat.color);
    }
    return map;
  }, [categories]);

  const getCategoryColor = useCallback(
    (categoryName: string, fallbackColor: string = '#9E9E9E') => {
      if (!categoryName) return fallbackColor;
      return categoryColorMap.get(categoryName.toLowerCase()) || fallbackColor;
    },
    [categoryColorMap]
  );

  // Map de couleurs des portefeuilles (accessible par id ou par nom)
  const walletColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of wallets) {
      map.set(w.id.toLowerCase(), w.color);
      map.set(w.name.toLowerCase(), w.color);
    }
    return map;
  }, [wallets]);

  const getWalletColor = useCallback(
    (walletNameOrId: string, fallbackColor: string = '#2563EB') => {
      if (!walletNameOrId) return fallbackColor;
      return walletColorMap.get(walletNameOrId.toLowerCase()) || fallbackColor;
    },
    [walletColorMap]
  );

  return (
    <ReferenceDataContext.Provider
      value={{
        categories,
        wallets,
        isLoading,
        refreshCategories: fetchCategories,
        refreshWallets: fetchWallets,
        getCategoryColor,
        getWalletColor,
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

export function useWallets(options?: { includeArchived?: boolean }) {
  const { wallets, isLoading, refreshWallets, getWalletColor } = useReferenceData();
  const includeArchived = options?.includeArchived;

  const filteredWallets = useMemo(() => {
    if (includeArchived) return wallets;
    return wallets.filter((w) => !w.isArchived);
  }, [wallets, includeArchived]);

  const defaultWallet = useMemo(() => {
    return wallets.find((w) => w.isDefault && !w.isArchived) || wallets.find((w) => !w.isArchived) || null;
  }, [wallets]);

  return {
    wallets: filteredWallets,
    allWallets: wallets,
    defaultWallet,
    isLoading,
    refreshWallets,
    getWalletColor,
  };
}
