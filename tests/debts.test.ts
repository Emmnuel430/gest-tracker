import test from 'node:test';
import assert from 'node:assert/strict';
import { DebtSchema, UpdateDebtSchema, DebtRepaymentSchema } from '../lib/validations';
import {
  resolveDebtCreationTransactionType,
  resolveDebtRepaymentTransactionType,
  validateAndComputeRepayment,
  validateAndComputeDebtUpdate,
  isDebtOverdue,
} from '../lib/debts';

test('DebtSchema, UpdateDebtSchema & DebtRepaymentSchema (v2.16.0)', async (t) => {
  await t.test('valide une créance (argent prêté) conforme avec walletId optionnel', () => {
    const valid = {
      personName: 'Koffi Paul',
      type: 'LENT',
      initialAmount: 75000,
      dueDate: '2026-11-15',
      note: 'Dépannage pour révision véhicule',
      walletId: 'wallet-wave-1',
    };

    const res = DebtSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.personName, 'Koffi Paul');
      assert.strictEqual(res.data.type, 'LENT');
      assert.strictEqual(res.data.initialAmount, 75000);
      assert.strictEqual(res.data.status, 'PENDING');
      assert.strictEqual(res.data.walletId, 'wallet-wave-1');
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
      personName: '   ',
      type: 'LENT',
      initialAmount: 50000,
    };
    assert.strictEqual(DebtSchema.safeParse(invalidName).success, false);

    const invalidAmount = {
      personName: 'Yao',
      type: 'LENT',
      initialAmount: -10000,
    };
    assert.strictEqual(DebtSchema.safeParse(invalidAmount).success, false);
  });

  await t.test('valide UpdateDebtSchema et DebtRepaymentSchema', () => {
    const validUpdate = UpdateDebtSchema.safeParse({
      id: 'debt-123',
      personName: 'Koffi Paul',
      type: 'LENT',
      initialAmount: 80000,
      note: 'Montant ajusté',
    });
    assert.strictEqual(validUpdate.success, true);

    const validRepay = DebtRepaymentSchema.safeParse({
      debtId: 'debt-123',
      amount: 25000,
      walletId: 'wallet-om-1',
      note: '1er versement Orange Money',
    });
    assert.strictEqual(validRepay.success, true);

    const invalidRepay = DebtRepaymentSchema.safeParse({
      debtId: 'debt-123',
      amount: 0,
    });
    assert.strictEqual(invalidRepay.success, false);
  });
});

test('Debt Accounting Bridge & Repayment Validation (v2.16.0 - [DEBT-01], [DEBT-02], [DEBT-03], [DEBT-05])', async (t) => {
  await t.test('[DEBT-01] associe le bon sens comptable (EXPENSE/INCOME) aux créations et remboursements', () => {
    // Création : Prêter de l'argent sort du portefeuille (EXPENSE) ; Emprunter entre dans le portefeuille (INCOME)
    assert.strictEqual(resolveDebtCreationTransactionType('LENT'), 'EXPENSE');
    assert.strictEqual(resolveDebtCreationTransactionType('BORROWED'), 'INCOME');

    // Remboursement : Recevoir le remboursement d'un prêt entre dans le portefeuille (INCOME) ; Rembourser une dette sort du portefeuille (EXPENSE)
    assert.strictEqual(resolveDebtRepaymentTransactionType('LENT'), 'INCOME');
    assert.strictEqual(resolveDebtRepaymentTransactionType('BORROWED'), 'EXPENSE');
  });

  await t.test('[DEBT-02] gère un remboursement partiel puis total valide', () => {
    const partial = validateAndComputeRepayment({
      initialAmount: 100000,
      currentRemaining: 100000,
      status: 'PENDING',
      repaymentAmount: 40000,
    });
    assert.strictEqual(partial.valid, true);
    assert.strictEqual(partial.newRemaining, 60000);
    assert.strictEqual(partial.newStatus, 'PARTIAL');

    const full = validateAndComputeRepayment({
      initialAmount: 100000,
      currentRemaining: 60000,
      status: 'PARTIAL',
      repaymentAmount: 60000,
    });
    assert.strictEqual(full.valid, true);
    assert.strictEqual(full.newRemaining, 0);
    assert.strictEqual(full.newStatus, 'SETTLED');
  });

  await t.test('[DEBT-02] rejette un remboursement supérieur au reste dû ou sur un dossier déjà SETTLED', () => {
    const excess = validateAndComputeRepayment({
      initialAmount: 50000,
      currentRemaining: 10000,
      status: 'PARTIAL',
      repaymentAmount: 25000,
    });
    assert.strictEqual(excess.valid, false);
    assert.ok(excess.error?.includes('dépasse le reste dû'));

    const alreadySettled = validateAndComputeRepayment({
      initialAmount: 50000,
      currentRemaining: 0,
      status: 'SETTLED',
      repaymentAmount: 5000,
    });
    assert.strictEqual(alreadySettled.valid, false);
    assert.ok(alreadySettled.error?.includes('déjà intégralement soldé'));
  });

  await t.test('[DEBT-03] recalcule le reste dû et le statut lors de la modification du montant initial', () => {
    // Dossier initial de 100 000 F dont 40 000 F déjà remboursés (reste 60 000 F)
    // Si on passe le montant initial à 120 000 F -> reste 80 000 F (PARTIAL)
    const increased = validateAndComputeDebtUpdate({
      oldInitialAmount: 100000,
      oldRemainingAmount: 60000,
      newInitialAmount: 120000,
    });
    assert.strictEqual(increased.valid, true);
    assert.strictEqual(increased.alreadyRepaid, 40000);
    assert.strictEqual(increased.newRemaining, 80000);
    assert.strictEqual(increased.newStatus, 'PARTIAL');

    // Si on ramène le montant initial exactement aux 40 000 F déjà remboursés -> reste 0 F (SETTLED)
    const exactSettled = validateAndComputeDebtUpdate({
      oldInitialAmount: 100000,
      oldRemainingAmount: 60000,
      newInitialAmount: 40000,
    });
    assert.strictEqual(exactSettled.valid, true);
    assert.strictEqual(exactSettled.newRemaining, 0);
    assert.strictEqual(exactSettled.newStatus, 'SETTLED');

    // Si on tente un montant initial (30 000 F) inférieur au déjà remboursé (40 000 F) -> rejeté
    const invalidDecrease = validateAndComputeDebtUpdate({
      oldInitialAmount: 100000,
      oldRemainingAmount: 60000,
      newInitialAmount: 30000,
    });
    assert.strictEqual(invalidDecrease.valid, false);
    assert.ok(invalidDecrease.error?.includes('inférieur au montant déjà remboursé'));
  });

  await t.test('[DEBT-05] détecte correctement les dossiers en retard (Overdue)', () => {
    assert.strictEqual(
      isDebtOverdue({ status: 'PENDING', dueDate: '2026-10-15' }, '2026-11-03'),
      true
    );
    assert.strictEqual(
      isDebtOverdue({ status: 'PARTIAL', dueDate: '2026-11-03' }, '2026-11-03'),
      false
    );
    assert.strictEqual(
      isDebtOverdue({ status: 'SETTLED', dueDate: '2026-10-15' }, '2026-11-03'),
      false
    );
    assert.strictEqual(
      isDebtOverdue({ status: 'PENDING', dueDate: null }, '2026-11-03'),
      false
    );
  });
});
