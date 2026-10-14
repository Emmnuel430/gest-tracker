import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistoryVisibility } from '../lib/history-visibility';
import { filterCategoriesByType, CategoryItem } from '../lib/categories';
import { HistoryFiltersSchema } from '../lib/validations';

test('History Display Matrix (v2.4.0 Specifications - rm.md Section 6.2)', async (t) => {
  await t.test('Cas par défaut : Tous types, Toutes catégories, Tous moyens', () => {
    const visibility = getHistoryVisibility({
      period: 'month',
      type: 'all',
      category: 'all',
      payment: 'all',
      activeTab: 'list',
    });

    assert.strictEqual(visibility.showFinancialSummary, true);
    assert.strictEqual(visibility.showAnalyticsTab, true);
    assert.strictEqual(visibility.showComparisonTab, true);
    assert.strictEqual(visibility.showCategoryComparison, true);
    assert.strictEqual(visibility.showPaymentComparison, true);
    assert.strictEqual(visibility.paymentLabel, 'Moyen de paiement');
    assert.strictEqual(visibility.effectiveActiveTab, 'list');
  });

  await t.test('Cas Entrées (INCOME) : Résumé financier masqué, label "Moyen de réception"', () => {
    const visibility = getHistoryVisibility({
      period: 'month',
      type: 'INCOME',
      category: 'all',
      payment: 'all',
      activeTab: 'analytics',
    });

    // Règle 6.2 : Le résumé financier est masqué pour le type Entrées
    assert.strictEqual(visibility.showFinancialSummary, false);
    assert.strictEqual(visibility.showAnalyticsTab, true);
    assert.strictEqual(visibility.showComparisonTab, true);
    assert.strictEqual(visibility.paymentLabel, 'Moyen de réception');
    assert.strictEqual(visibility.effectiveActiveTab, 'analytics');
  });

  await t.test('Cas Dépenses (EXPENSE) : Résumé financier visible, label "Moyen de paiement"', () => {
    const visibility = getHistoryVisibility({
      period: 'month',
      type: 'EXPENSE',
      category: 'all',
      payment: 'all',
      activeTab: 'list',
    });

    assert.strictEqual(visibility.showFinancialSummary, true);
    assert.strictEqual(visibility.paymentLabel, 'Moyen de paiement');
  });

  await t.test('Cas Catégorie spécifique sélectionnée : Onglet Graphiques masqué, section Catégorie masquée du comparatif', () => {
    const visibility = getHistoryVisibility({
      period: 'month',
      type: 'EXPENSE',
      category: 'Alimentation',
      payment: 'all',
      activeTab: 'analytics', // Demandait l'onglet Graphiques
    });

    // Règle 6.2 : Graphiques masqué si une catégorie est filtrée
    assert.strictEqual(visibility.showAnalyticsTab, false);
    assert.strictEqual(visibility.showCategoryComparison, false);
    assert.strictEqual(visibility.showPaymentComparison, true);
    // Redirection automatique sur 'list' car 'analytics' est masqué
    assert.strictEqual(visibility.effectiveActiveTab, 'list');
  });

  await t.test('Cas Moyen spécifique sélectionné : Section Moyen masquée du comparatif', () => {
    const visibility = getHistoryVisibility({
      period: 'month',
      type: 'all',
      category: 'all',
      payment: 'Mon Compte Wave',
      activeTab: 'comparison',
    });

    assert.strictEqual(visibility.showCategoryComparison, true);
    assert.strictEqual(visibility.showPaymentComparison, false);
    assert.strictEqual(visibility.effectiveActiveTab, 'comparison');
  });

  await t.test('Cas Période personnalisée (custom) : Onglet Comparatif masqué et redirection sur list', () => {
    const visibility = getHistoryVisibility({
      period: 'custom',
      type: 'all',
      category: 'all',
      payment: 'all',
      activeTab: 'comparison',
    });

    assert.strictEqual(visibility.showComparisonTab, false);
    assert.strictEqual(visibility.effectiveActiveTab, 'list');
  });

  await t.test('Cas combiné Catégorie spécifique + Période custom : seul onglet Opérations subsiste', () => {
    const visibility = getHistoryVisibility({
      period: 'custom',
      type: 'EXPENSE',
      category: 'Transport',
      payment: 'all',
      activeTab: 'analytics',
    });

    assert.strictEqual(visibility.showAnalyticsTab, false);
    assert.strictEqual(visibility.showComparisonTab, false);
    assert.strictEqual(visibility.effectiveActiveTab, 'list');
  });
});

test('Dependent Filters & Category Filtering (v2.4.0 Specifications - T1)', async (t) => {
  const mockCategories: CategoryItem[] = [
    { id: '1', name: 'Salaire', kind: 'INCOME', color: '#16A34A', isArchived: false, createdAt: '' },
    { id: '2', name: 'Loyer', kind: 'EXPENSE', color: '#DC2626', isArchived: false, createdAt: '' },
    { id: '3', name: 'Vente diverse', kind: 'BOTH', color: '#FFE600', isArchived: false, createdAt: '' },
    { id: '4', name: 'Ancien poste', kind: 'EXPENSE', color: '#9E9E9E', isArchived: true, createdAt: '' },
  ];

  await t.test('filterCategoriesByType filtre fidèlement selon le type sélectionné', () => {
    const incomeCats = filterCategoriesByType(mockCategories, 'INCOME');
    assert.strictEqual(incomeCats.length, 2); // Salaire + Vente diverse (BOTH)
    assert.strictEqual(incomeCats.some((c) => c.name === 'Salaire'), true);
    assert.strictEqual(incomeCats.some((c) => c.name === 'Vente diverse'), true);

    const expenseCats = filterCategoriesByType(mockCategories, 'EXPENSE');
    assert.strictEqual(expenseCats.length, 2); // Loyer + Vente diverse (BOTH)
    assert.strictEqual(expenseCats.some((c) => c.name === 'Loyer'), true);
    assert.strictEqual(expenseCats.some((c) => c.name === 'Vente diverse'), true);
  });

  await t.test('HistoryFiltersSchema valide et assainit les filtres', () => {
    const res = HistoryFiltersSchema.safeParse({
      period: 'month',
      type: 'INCOME',
      category: 'Salaire',
    });
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.period, 'month');
      assert.strictEqual(res.data.type, 'INCOME');
      assert.strictEqual(res.data.category, 'Salaire');
      assert.strictEqual(res.data.payment, 'all');
      assert.strictEqual(res.data.tab, 'list');
    }
  });
});

test('Cursor-Based Pagination Mechanics (v2.4.0 Specifications - T2)', async (t) => {
  await t.test('extrait la page demandée et calcule nextCursor lorsque pageSize est dépassé', () => {
    const mockDbItems = [
      { id: 'tx-1', amount: 100 },
      { id: 'tx-2', amount: 200 },
      { id: 'tx-3', amount: 300 },
      { id: 'tx-4', amount: 400 },
      { id: 'tx-5', amount: 500 },
    ];

    const pageSize = 3;
    const itemsFetched = mockDbItems.slice(0, pageSize + 1); // Simulation take: pageSize + 1

    let nextCursor: string | null = null;
    let pageItems = itemsFetched;

    if (itemsFetched.length > pageSize) {
      const sliced = itemsFetched.slice(0, pageSize);
      nextCursor = sliced[sliced.length - 1].id;
      pageItems = sliced;
    }

    assert.strictEqual(pageItems.length, 3);
    assert.strictEqual(pageItems[0].id, 'tx-1');
    assert.strictEqual(pageItems[2].id, 'tx-3');
    assert.strictEqual(nextCursor, 'tx-3');
  });

  await t.test('retourne nextCursor null sur la dernière page', () => {
    const itemsFetched = [
      { id: 'tx-4', amount: 400 },
      { id: 'tx-5', amount: 500 },
    ];

    const pageSize = 3;
    let nextCursor: string | null = null;
    let pageItems = itemsFetched;

    if (itemsFetched.length > pageSize) {
      const sliced = itemsFetched.slice(0, pageSize);
      nextCursor = sliced[sliced.length - 1].id;
      pageItems = sliced;
    }

    assert.strictEqual(pageItems.length, 2);
    assert.strictEqual(nextCursor, null);
  });
});
