import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  comparePeriods,
} from '../lib/statistics';
import { Transaction } from '../types/transaction';

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
    assert.equal(summary.totalIncome, 100000);
    assert.equal(summary.totalExpense, 50000);
    assert.equal(summary.balance, 50000);
    assert.equal(summary.transactionCount, 3);
  });

  it('calcule correctement les pourcentages par catégorie', () => {
    const breakdown = calculateCategoryBreakdown(mockTransactions, 'EXPENSE');
    assert.equal(breakdown.length, 2);
    // Alimentation 30000 sur 50000 = 60%
    assert.equal(breakdown[0].category, 'Alimentation');
    assert.equal(breakdown[0].percentage, 60);
    // Transport 20000 sur 50000 = 40%
    assert.equal(breakdown[1].category, 'Transport');
    assert.equal(breakdown[1].percentage, 40);
  });

  it('gère rigoureusement le cas limite de division par zéro (N-1 = 0)', () => {
    const comparison = comparePeriods(5000, 0);
    assert.equal(comparison.percentageChange, 100);
    assert.equal(comparison.difference, 5000);
    assert.equal(comparison.isIncrease, true);

    const zeroZero = comparePeriods(0, 0);
    assert.equal(zeroZero.percentageChange, 0);
    assert.equal(zeroZero.difference, 0);
  });

  it('calcule une évolution normale', () => {
    const comparison = comparePeriods(60000, 50000);
    // +20%
    assert.equal(comparison.percentageChange, 20);
    assert.equal(comparison.difference, 10000);
    assert.equal(comparison.isIncrease, true);
  });
});
