import test from 'node:test';
import assert from 'node:assert/strict';
import { WalletSchema } from '../lib/validations';

test('WalletSchema (Sprint 18 Specifications)', async (t) => {
  await t.test('valide un portefeuille conforme', () => {
    const valid = {
      name: 'Mon Compte Wave',
      type: 'MOBILE_MONEY',
      initialBalance: 75000,
      color: '#1DC4F2',
      isDefault: true,
    };

    const res = WalletSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.name, 'Mon Compte Wave');
      assert.strictEqual(res.data.type, 'MOBILE_MONEY');
      assert.strictEqual(res.data.initialBalance, 75000);
      assert.strictEqual(res.data.isDefault, true);
    }
  });

  await t.test('rejette un portefeuille sans nom', () => {
    const invalid = {
      name: '',
      type: 'CASH',
      initialBalance: 10000,
    };

    const res = WalletSchema.safeParse(invalid);
    assert.strictEqual(res.success, false);
  });

  await t.test('rejette un type de portefeuille non reconnu', () => {
    const invalidType = {
      name: 'Cryptos',
      type: 'CRYPTO_WALLET',
      initialBalance: 0,
    };

    const res = WalletSchema.safeParse(invalidType);
    assert.strictEqual(res.success, false);
  });
});

test('Wallet Real-Time Balance Calculations (Sprint 18)', async (t) => {
  interface MockTx {
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    walletId?: string | null;
    targetWalletId?: string | null;
  }

  const computeWalletBalance = (
    walletId: string,
    initialBalance: number,
    transactions: MockTx[]
  ) => {
    let income = 0;
    let expense = 0;
    let transferIn = 0;
    let transferOut = 0;

    for (const t of transactions) {
      if (t.walletId === walletId) {
        if (t.type === 'INCOME') income += t.amount;
        else if (t.type === 'EXPENSE') expense += t.amount;
        else if (t.type === 'TRANSFER') transferOut += t.amount;
      }
      if (t.targetWalletId === walletId && t.type === 'TRANSFER') {
        transferIn += t.amount;
      }
    }

    return initialBalance + income - expense + transferIn - transferOut;
  };

  await t.test('calcule le solde exact avec entrées, sorties et transferts', () => {
    const walletId = 'wallet-cash';
    const initial = 50000;
    const transactions: MockTx[] = [
      { amount: 100000, type: 'INCOME', walletId: 'wallet-cash' }, // +100k
      { amount: 30000, type: 'EXPENSE', walletId: 'wallet-cash' }, // -30k
      { amount: 20000, type: 'TRANSFER', walletId: 'wallet-cash', targetWalletId: 'wallet-wave' }, // -20k
      { amount: 40000, type: 'TRANSFER', walletId: 'wallet-bank', targetWalletId: 'wallet-cash' }, // +40k
    ];

    const currentBalance = computeWalletBalance(walletId, initial, transactions);
    // 50k + 100k - 30k - 20k + 40k = 140 000
    assert.strictEqual(currentBalance, 140000);
  });
});
