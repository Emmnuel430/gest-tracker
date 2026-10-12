import test from 'node:test';
import assert from 'node:assert/strict';
import { DebtSchema } from '../lib/validations';

test('DebtSchema (Sprint 20 Specifications)', async (t) => {
  await t.test('valide une créance (argent prêté) conforme', () => {
    const valid = {
      personName: 'Koffi Paul',
      type: 'LENT',
      initialAmount: 75000,
      dueDate: '2026-11-15',
      note: 'Dépannage pour révision véhicule',
    };

    const res = DebtSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.personName, 'Koffi Paul');
      assert.strictEqual(res.data.type, 'LENT');
      assert.strictEqual(res.data.initialAmount, 75000);
      assert.strictEqual(res.data.status, 'PENDING');
    }
  });

  await t.test('valide une dette (argent emprunté) conforme', () => {
    const valid = {
      personName: 'Aminata Touré',
      type: 'BORROWED',
      initialAmount: 120000,
    };

    const res = DebtSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.type, 'BORROWED');
      assert.strictEqual(res.data.initialAmount, 120000);
    }
  });

  await t.test('rejette un dossier sans nom de personne ou avec montant négatif', () => {
    const invalidName = {
      personName: '',
      type: 'LENT',
      initialAmount: 50000,
    };
    const resName = DebtSchema.safeParse(invalidName);
    assert.strictEqual(resName.success, false);

    const invalidAmount = {
      personName: 'Yao',
      type: 'LENT',
      initialAmount: -10000,
    };
    const resAmount = DebtSchema.safeParse(invalidAmount);
    assert.strictEqual(resAmount.success, false);
  });
});

test('Debt Repayment & Lifecycle Calculations (Sprint 20)', async (t) => {
  const calculateRepayment = (initialAmount: number, currentRemaining: number, payment: number) => {
    const newRemaining = Math.max(0, currentRemaining - payment);
    let status: 'PENDING' | 'PARTIAL' | 'SETTLED' = 'PARTIAL';
    if (newRemaining <= 0) {
      status = 'SETTLED';
    } else if (newRemaining === initialAmount) {
      status = 'PENDING';
    }
    return { newRemaining, status };
  };

  await t.test('gère un remboursement partiel correctement', () => {
    const initial = 100000;
    const current = 100000;
    const payment = 40000;

    const res = calculateRepayment(initial, current, payment);
    assert.strictEqual(res.newRemaining, 60000);
    assert.strictEqual(res.status, 'PARTIAL');
  });

  await t.test('solde intégralement le dossier quand le montant dû atteint 0', () => {
    const initial = 100000;
    const current = 60000;
    const payment = 60000;

    const res = calculateRepayment(initial, current, payment);
    assert.strictEqual(res.newRemaining, 0);
    assert.strictEqual(res.status, 'SETTLED');
  });

  await t.test('ne permet pas d’avoir un solde restant négatif (borne à 0)', () => {
    const initial = 50000;
    const current = 30000;
    const payment = 40000; // Plus que le restant dû

    const res = calculateRepayment(initial, current, payment);
    assert.strictEqual(res.newRemaining, 0);
    assert.strictEqual(res.status, 'SETTLED');
  });
});
