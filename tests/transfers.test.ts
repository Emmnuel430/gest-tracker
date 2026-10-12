import test from 'node:test';
import assert from 'node:assert/strict';
import { TransferSchema } from '../lib/validations';
import { calculateFinancialSummary } from '../lib/statistics';
import { Transaction } from '../types/transaction';

test('TransferSchema (Sprint 19 Specifications)', async (t) => {
  await t.test('valide un virement régulier entre deux comptes distincts', () => {
    const valid = {
      sourceWalletId: 'wallet-1',
      targetWalletId: 'wallet-2',
      amount: 25000,
      note: 'Alimentation du compte Wave',
    };

    const res = TransferSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.amount, 25000);
      assert.strictEqual(res.data.sourceWalletId, 'wallet-1');
      assert.strictEqual(res.data.targetWalletId, 'wallet-2');
    }
  });

  await t.test('rejette un virement où la source et la cible sont identiques', () => {
    const invalidSame = {
      sourceWalletId: 'wallet-same',
      targetWalletId: 'wallet-same',
      amount: 10000,
    };

    const res = TransferSchema.safeParse(invalidSame);
    assert.strictEqual(res.success, false);
    assert.match(
      res.error?.issues[0]?.message || '',
      /différents/i
    );
  });

  await t.test('rejette un montant de virement négatif ou égal à zéro', () => {
    const invalidZero = {
      sourceWalletId: 'wallet-1',
      targetWalletId: 'wallet-2',
      amount: 0,
    };

    const resZero = TransferSchema.safeParse(invalidZero);
    assert.strictEqual(resZero.success, false);

    const invalidNegative = {
      sourceWalletId: 'wallet-1',
      targetWalletId: 'wallet-2',
      amount: -15000,
    };

    const resNeg = TransferSchema.safeParse(invalidNegative);
    assert.strictEqual(resNeg.success, false);
  });
});

test('Statistical Neutrality of Transfers (Sprint 19 DoD)', async (t) => {
  await t.test('garantit que les virements TRANSFER n’impactent ni les revenus ni les dépenses', () => {
    const baseTransactions: Transaction[] = [
      {
        id: '1',
        type: 'INCOME',
        amount: 500000,
        category: 'Travail PC',
        payment: 'Compte bancaire',
        date: '2026-10-01',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: '2',
        type: 'EXPENSE',
        amount: 150000,
        category: 'Logement',
        payment: 'Compte bancaire',
        date: '2026-10-05',
        createdAt: '2026-10-05',
        updatedAt: '2026-10-05',
      },
    ];

    const baseSummary = calculateFinancialSummary(baseTransactions);
    assert.strictEqual(baseSummary.totalIncome, 500000);
    assert.strictEqual(baseSummary.totalExpense, 150000);
    assert.strictEqual(baseSummary.balance, 350000);

    // Ajout d'un gros virement interne de 200 000 FCFA
    const transactionsWithTransfer: Transaction[] = [
      ...baseTransactions,
      {
        id: '3',
        type: 'TRANSFER',
        amount: 200000,
        category: 'Virement interne',
        payment: 'Compte bancaire -> Wave',
        walletId: 'bank',
        targetWalletId: 'wave',
        date: '2026-10-08',
        createdAt: '2026-10-08',
        updatedAt: '2026-10-08',
      },
    ];

    const summaryWithTransfer = calculateFinancialSummary(transactionsWithTransfer);

    // Les totaux et le solde net doivent être strictement identiques
    assert.strictEqual(summaryWithTransfer.totalIncome, baseSummary.totalIncome);
    assert.strictEqual(summaryWithTransfer.totalExpense, baseSummary.totalExpense);
    assert.strictEqual(summaryWithTransfer.balance, baseSummary.balance);
  });
});
