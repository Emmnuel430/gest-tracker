import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BudgetSchema } from '../lib/validations';
import {
  computeMonthlyBudgetSummary,
  doesExpenseMatchBudget,
  normalizeCategoryName,
} from '../lib/budgets';

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

describe('Budget Consumption & Status Calculations (v2.16.0 - [BUD-01] & [BUD-03])', () => {
  it('calcule les statuts NORMAL (<75%), WARNING (75%-99%) et EXCEEDED (>=100%)', () => {
    const summary = computeMonthlyBudgetSummary(
      '2026-11',
      [
        { id: 'b1', category: 'Alimentation', categoryId: 'cat-1', amount: 100000, month: '2026-11' },
        { id: 'b2', category: 'Transport', categoryId: 'cat-2', amount: 100000, month: '2026-11' },
        { id: 'b3', category: 'Loisirs', categoryId: 'cat-3', amount: 50000, month: '2026-11' },
      ],
      [
        { category: 'Alimentation', categoryId: 'cat-1', amount: 50000 }, // 50% -> NORMAL
        { category: 'Transport', categoryId: 'cat-2', amount: 80000 }, // 80% -> WARNING
        { category: 'Loisirs', categoryId: 'cat-3', amount: 65000 }, // 130% -> EXCEEDED
      ]
    );

    assert.equal(summary.items[0].status, 'NORMAL');
    assert.equal(summary.items[0].percentage, 50);
    assert.equal(summary.items[1].status, 'WARNING');
    assert.equal(summary.items[1].percentage, 80);
    assert.equal(summary.items[2].status, 'EXCEEDED');
    assert.equal(summary.items[2].percentage, 130);
    assert.equal(summary.items[2].remaining, -15000);
  });

  it('[BUD-01] exclut les dépenses hors catégories budgétées du totalSpent global (cohérence /budgets et /gestion)', () => {
    const summary = computeMonthlyBudgetSummary(
      '2026-11',
      [
        { id: 'b-loisirs', category: 'Loisirs', categoryId: 'cat-loisirs', amount: 25000, month: '2026-11' },
      ],
      [
        // Dépense de Loyer hors catégorie budgétée : ne doit PAS gonfler le ratio global de Loisirs
        { category: 'Logement', categoryId: 'cat-logement', amount: 150000 },
        { category: 'Loisirs', categoryId: 'cat-loisirs', amount: 5000 },
      ]
    );

    assert.equal(summary.totalBudget, 25000);
    assert.equal(summary.totalSpent, 5000);
    assert.equal(summary.totalRemaining, 20000);
    assert.equal(summary.overallPercentage, 20);
  });

  it('[BUD-03] rapproche les dépenses par categoryId (même après renommage) et par libellé insensible à la casse en repli', () => {
    assert.equal(normalizeCategoryName('  Alimentation  '), 'alimentation');

    // Match par categoryId malgré un ancien nom de catégorie sur la transaction
    assert.equal(
      doesExpenseMatchBudget(
        { category: 'Courses & Repas', categoryId: 'cat-food' },
        { category: 'Alimentation', categoryId: 'cat-food' }
      ),
      true
    );

    // Match par nom insensible à la casse quand categoryId est absent (ex: import CSV)
    assert.equal(
      doesExpenseMatchBudget(
        { category: 'Transport', categoryId: 'cat-trans' },
        { category: '  transport ', categoryId: null }
      ),
      true
    );

    // Non-match
    assert.equal(
      doesExpenseMatchBudget(
        { category: 'Transport', categoryId: 'cat-trans' },
        { category: 'Santé', categoryId: 'cat-health' }
      ),
      false
    );
  });
});
