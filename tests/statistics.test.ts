import { describe, it, expect } from 'vitest';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  comparePeriods,
} from '@/lib/statistics';
import { Transaction } from '@/types/transaction';

describe('Financial Statistics Calculations', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'INCOME',
      amount: 100000,
      category: 'Freelance',
      payment: 'Wave',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'EXPENSE',
      amount: 30000,
      category: 'Alimentation',
      payment: 'Wave',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'EXPENSE',
      amount: 20000,
      category: 'Transport',
      payment: 'Orange Money',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('calcule correctement le solde, les revenus et les dépenses', () => {
    const summary = calculateFinancialSummary(mockTransactions);
    expect(summary.totalIncome).toBe(100000);
    expect(summary.totalExpense).toBe(50000);
    expect(summary.balance).toBe(50000);
    expect(summary.transactionCount).toBe(3);
  });

  it('calcule correctement les pourcentages par catégorie', () => {
    const breakdown = calculateCategoryBreakdown(mockTransactions, 'EXPENSE');
    expect(breakdown).toHaveLength(2);
    // Alimentation 30000 sur 50000 = 60%
    expect(breakdown[0].category).toBe('Alimentation');
    expect(breakdown[0].percentage).toBe(60);
    // Transport 20000 sur 50000 = 40%
    expect(breakdown[1].category).toBe('Transport');
    expect(breakdown[1].percentage).toBe(40);
  });

  it('gère rigoureusement le cas limite de division par zéro (N-1 = 0)', () => {
    const comparison = comparePeriods(5000, 0);
    expect(comparison.percentageChange).toBe(100);
    expect(comparison.difference).toBe(5000);
    expect(comparison.isIncrease).toBe(true);

    const zeroZero = comparePeriods(0, 0);
    expect(zeroZero.percentageChange).toBe(0);
    expect(zeroZero.difference).toBe(0);
  });

  it('calcule une évolution normale', () => {
    const comparison = comparePeriods(60000, 50000);
    // +20%
    expect(comparison.percentageChange).toBe(20);
    expect(comparison.difference).toBe(10000);
    expect(comparison.isIncrease).toBe(true);
  });
});
