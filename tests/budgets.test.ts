import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BudgetSchema } from '../lib/validations';

describe('BudgetSchema (Zod Validation V2)', () => {
  it('valide un budget mensuel conforme', () => {
    const validData = {
      category: 'Alimentation',
      amount: 60000,
      month: '2026-10',
    };

    const result = BudgetSchema.safeParse(validData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.category, 'Alimentation');
      assert.equal(result.data.amount, 60000);
      assert.equal(result.data.month, '2026-10');
    }
  });

  it('rejette un montant négatif ou nul', () => {
    const zeroData = {
      category: 'Transport',
      amount: 0,
      month: '2026-10',
    };
    const negData = {
      category: 'Transport',
      amount: -5000,
      month: '2026-10',
    };

    assert.equal(BudgetSchema.safeParse(zeroData).success, false);
    assert.equal(BudgetSchema.safeParse(negData).success, false);
  });

  it('rejette un format de mois invalide', () => {
    const invalidMonths = ['2026/10', '2026-1', 'octobre-2026', '2026-13-01'];
    for (const m of invalidMonths) {
      const res = BudgetSchema.safeParse({
        category: 'Loisirs',
        amount: 20000,
        month: m,
      });
      assert.equal(res.success, false, `Devrait rejeter le mois: ${m}`);
    }
  });
});

describe('Budget Consumption & Status Calculations (V2 Specifications)', () => {
  function computeBudgetStatus(amount: number, spent: number) {
    const remaining = amount - spent;
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;
    let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
    if (percentage >= 100) status = 'EXCEEDED';
    else if (percentage >= 75) status = 'WARNING';
    return { remaining, percentage, status };
  }

  it('calcule le statut NORMAL pour une consommation inférieure à 75%', () => {
    const res = computeBudgetStatus(100000, 50000); // 50%
    assert.equal(res.percentage, 50);
    assert.equal(res.remaining, 50000);
    assert.equal(res.status, 'NORMAL');
  });

  it('calcule le statut WARNING pour une consommation entre 75% et 99%', () => {
    const res75 = computeBudgetStatus(100000, 75000); // 75%
    assert.equal(res75.percentage, 75);
    assert.equal(res75.remaining, 25000);
    assert.equal(res75.status, 'WARNING');

    const res90 = computeBudgetStatus(100000, 90000); // 90%
    assert.equal(res90.percentage, 90);
    assert.equal(res90.remaining, 10000);
    assert.equal(res90.status, 'WARNING');
  });

  it('calcule le statut EXCEEDED pour une consommation supérieure ou égale à 100%', () => {
    const res100 = computeBudgetStatus(60000, 60000); // 100%
    assert.equal(res100.percentage, 100);
    assert.equal(res100.remaining, 0);
    assert.equal(res100.status, 'EXCEEDED');

    const res120 = computeBudgetStatus(50000, 65000); // 130%
    assert.equal(res120.percentage, 130);
    assert.equal(res120.remaining, -15000);
    assert.equal(res120.status, 'EXCEEDED');
  });
});
