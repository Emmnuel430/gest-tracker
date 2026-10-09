import test from 'node:test';
import assert from 'node:assert/strict';
import { RecurringRuleSchema } from '../lib/validations';

test('RecurringRuleSchema (Zod Validation V2)', async (t) => {
  await t.test('valide une règle de dépense récurrente conforme', () => {
    const validExpense = {
      type: 'EXPENSE',
      amount: 150000,
      category: 'Logement',
      payment: 'Compte bancaire',
      dayOfMonth: 5,
      frequency: 'MONTHLY',
      note: 'Loyer mensuel appartement',
      isActive: true,
    };

    const res = RecurringRuleSchema.safeParse(validExpense);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.amount, 150000);
      assert.strictEqual(res.data.dayOfMonth, 5);
      assert.strictEqual(res.data.frequency, 'MONTHLY');
    }
  });

  await t.test('valide une règle de revenu récurrent conforme', () => {
    const validIncome = {
      type: 'INCOME',
      amount: 600000,
      category: 'Travail PC',
      payment: 'Compte bancaire',
      dayOfMonth: 28,
    };

    const res = RecurringRuleSchema.safeParse(validIncome);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.type, 'INCOME');
      assert.strictEqual(res.data.frequency, 'MONTHLY'); // Valeur par défaut
      assert.strictEqual(res.data.isActive, true); // Valeur par défaut
    }
  });

  await t.test('rejette un montant négatif ou nul', () => {
    const invalidZero = {
      type: 'EXPENSE',
      amount: 0,
      category: 'Alimentation',
      payment: 'Wave',
      dayOfMonth: 10,
    };

    const resZero = RecurringRuleSchema.safeParse(invalidZero);
    assert.strictEqual(resZero.success, false);

    const invalidNegative = {
      type: 'EXPENSE',
      amount: -5000,
      category: 'Alimentation',
      payment: 'Wave',
      dayOfMonth: 10,
    };

    const resNeg = RecurringRuleSchema.safeParse(invalidNegative);
    assert.strictEqual(resNeg.success, false);
  });

  await t.test('rejette un jour de mois hors limites (< 1 ou > 31)', () => {
    const invalidDayZero = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Abonnement',
      payment: 'Wave',
      dayOfMonth: 0,
    };

    const resDayZero = RecurringRuleSchema.safeParse(invalidDayZero);
    assert.strictEqual(resDayZero.success, false);

    const invalidDay32 = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Abonnement',
      payment: 'Wave',
      dayOfMonth: 32,
    };

    const resDay32 = RecurringRuleSchema.safeParse(invalidDay32);
    assert.strictEqual(resDay32.success, false);
  });

  await t.test('rejette un type invalide ou une note trop longue (> 250 chars)', () => {
    const invalidType = {
      type: 'TRANSFER',
      amount: 10000,
      category: 'Transport',
      payment: 'Wave',
      dayOfMonth: 15,
    };

    const resType = RecurringRuleSchema.safeParse(invalidType);
    assert.strictEqual(resType.success, false);

    const invalidNote = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Transport',
      payment: 'Wave',
      dayOfMonth: 15,
      note: 'a'.repeat(251),
    };

    const resNote = RecurringRuleSchema.safeParse(invalidNote);
    assert.strictEqual(resNote.success, false);
  });
});

test('Recurring Rules Due Status & Forecasting Calculations (V2 Specifications)', async (t) => {
  interface RuleMock {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    isActive: boolean;
    lastProcessedMonth: string | null;
  }

  const isDueThisMonth = (rule: RuleMock, currentMonth: string): boolean => {
    if (!rule.isActive) return false;
    return rule.lastProcessedMonth !== currentMonth;
  };

  const currentMonth = '2026-10';

  await t.test('identifie une règle active sans historique comme due', () => {
    const rule: RuleMock = {
      id: '1',
      type: 'EXPENSE',
      amount: 25000,
      isActive: true,
      lastProcessedMonth: null,
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), true);
  });

  await t.test('identifie une règle traitée le mois précédent comme due pour le mois en cours', () => {
    const rule: RuleMock = {
      id: '2',
      type: 'EXPENSE',
      amount: 150000,
      isActive: true,
      lastProcessedMonth: '2026-09',
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), true);
  });

  await t.test('identifie une règle déjà traitée ce mois-ci comme non due', () => {
    const rule: RuleMock = {
      id: '3',
      type: 'EXPENSE',
      amount: 150000,
      isActive: true,
      lastProcessedMonth: '2026-10',
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), false);
  });

  await t.test('ne marque jamais une règle inactive comme due', () => {
    const rule: RuleMock = {
      id: '4',
      type: 'EXPENSE',
      amount: 5000,
      isActive: false,
      lastProcessedMonth: null,
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), false);
  });

  await t.test('calcule fidèlement les totaux prévisionnels actifs mensuels', () => {
    const rules: RuleMock[] = [
      { id: '1', type: 'INCOME', amount: 500000, isActive: true, lastProcessedMonth: null },
      { id: '2', type: 'INCOME', amount: 100000, isActive: false, lastProcessedMonth: null }, // inactive
      { id: '3', type: 'EXPENSE', amount: 150000, isActive: true, lastProcessedMonth: null },
      { id: '4', type: 'EXPENSE', amount: 25000, isActive: true, lastProcessedMonth: null },
    ];

    const activeRules = rules.filter((r) => r.isActive);
    const expectedIncome = activeRules
      .filter((r) => r.type === 'INCOME')
      .reduce((sum, r) => sum + r.amount, 0);
    const expectedExpense = activeRules
      .filter((r) => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0);
    const net = expectedIncome - expectedExpense;

    assert.strictEqual(expectedIncome, 500000);
    assert.strictEqual(expectedExpense, 175000);
    assert.strictEqual(net, 325000);
  });
});
