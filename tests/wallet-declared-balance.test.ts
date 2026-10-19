import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWalletBalance,
  computeNetWorth,
  isTransactionAfterDeclaration,
  calculateEffectiveWalletBalance,
} from '../lib/wallet-balance';
import { WalletSchema } from '../lib/validations';

test('v2.8.0 — isTransactionAfterDeclaration logic', async (t) => {
  const declaredAt = new Date('2026-10-19T14:00:00.000Z');

  await t.test('rejette une transaction créée et datée avant la déclaration', () => {
    const tx = {
      date: new Date('2026-10-19T10:00:00.000Z'),
      createdAt: new Date('2026-10-19T10:00:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), false);
  });

  await t.test('rejette une transaction d’hier même si elle est examinée aujourd’hui', () => {
    const tx = {
      date: new Date('2026-10-18T18:00:00.000Z'),
      createdAt: new Date('2026-10-18T18:00:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), false);
  });

  await t.test('accepte une transaction enregistrée après la déclaration avec date du jour', () => {
    const tx = {
      date: new Date('2026-10-19T15:30:00.000Z'),
      createdAt: new Date('2026-10-19T15:30:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), true);
  });

  await t.test('accepte une transaction créée après déclaration avec date calendaire à minuit du même jour', () => {
    // Cas courant : le datepicker HTML envoie minuit UTC pour la date du jour sélectionnée
    const tx = {
      date: new Date('2026-10-19T00:00:00.000Z'),
      createdAt: new Date('2026-10-19T16:00:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), true);
  });

  await t.test('rejette une dépense rétroactive d’un mois passé créée après la déclaration (déjà comprise dans le solde physique)', () => {
    const tx = {
      date: new Date('2026-09-15T12:00:00.000Z'),
      createdAt: new Date('2026-10-19T16:00:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), false);
  });

  await t.test('accepte une transaction future post-déclaration', () => {
    const tx = {
      date: new Date('2026-10-25T10:00:00.000Z'),
      createdAt: new Date('2026-10-25T10:00:00.000Z'),
    };
    assert.equal(isTransactionAfterDeclaration(tx, declaredAt), true);
  });
});

test('v2.8.0 — calculateEffectiveWalletBalance calculations', async (t) => {
  await t.test('utilise initialBalance et tous les mouvements si declaredBalance est absent', () => {
    const balance = calculateEffectiveWalletBalance({
      initialBalance: 10000,
      declaredBalance: null,
      declaredAt: null,
      movements: {
        income: 50000,
        expense: 20000,
        transferIn: 5000,
        transferOut: 2000,
      },
    });

    // 10 000 + 50 000 - 20 000 + 5 000 - 2 000 = 43 000
    assert.equal(balance, 43000);
  });

  await t.test('utilise declaredBalance et uniquement les mouvements post-déclaration', () => {
    const balance = calculateEffectiveWalletBalance({
      initialBalance: 10000,
      declaredBalance: 75000,
      declaredAt: new Date('2026-10-19T14:00:00.000Z'),
      movements: {
        income: 500000,
        expense: 300000,
        transferIn: 20000,
        transferOut: 10000,
      },
      postDeclarationMovements: {
        income: 15000,
        expense: 5000,
        transferIn: 0,
        transferOut: 2000,
      },
    });

    // 75 000 (déclaré) + 15 000 - 5 000 - 2 000 = 83 000
    assert.equal(balance, 83000);
  });

  await t.test('gère un solde déclaré sans mouvement postérieur (reste égal au solde déclaré)', () => {
    const balance = calculateEffectiveWalletBalance({
      initialBalance: 0,
      declaredBalance: 50000,
      declaredAt: new Date(),
      movements: {
        income: 100000,
        expense: 80000,
        transferIn: 0,
        transferOut: 0,
      },
      postDeclarationMovements: {
        income: 0,
        expense: 0,
        transferIn: 0,
        transferOut: 0,
      },
    });

    assert.equal(balance, 50000);
  });

  await t.test('gère un découvert autorisé sur solde déclaré', () => {
    const balance = calculateEffectiveWalletBalance({
      initialBalance: 0,
      declaredBalance: 10000,
      declaredAt: new Date(),
      movements: { income: 0, expense: 0, transferIn: 0, transferOut: 0 },
      postDeclarationMovements: {
        income: 0,
        expense: 25000,
        transferIn: 0,
        transferOut: 0,
      },
    });

    // 10 000 - 25 000 = -15 000
    assert.equal(balance, -15000);
  });
});

test('v2.8.0 — WalletSchema with declared balance fields', async (t) => {
  await t.test('valide un portefeuille avec declaredBalance et declaredAt', () => {
    const result = WalletSchema.safeParse({
      name: 'Compte Wave',
      type: 'MOBILE_MONEY',
      initialBalance: 5000,
      declaredBalance: 45000,
      declaredAt: new Date().toISOString(),
      adjustCurrentBalance: true,
      color: '#1DC4F2',
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.declaredBalance, 45000);
      assert.equal(result.data.adjustCurrentBalance, true);
    }
  });

  await t.test('valide un portefeuille sans declaredBalance (rétrocompatibilité)', () => {
    const result = WalletSchema.safeParse({
      name: 'Cash',
      type: 'CASH',
      initialBalance: 10000,
      color: '#52B788',
    });

    assert.equal(result.success, true);
  });
});

test('v2.8.0 — computeNetWorth with declared and undeclared wallets', () => {
  const wallets = [
    { id: '1', isArchived: false, currentBalance: 83000 },
    { id: '2', isArchived: false, currentBalance: 50000 },
    { id: '3', isArchived: true, currentBalance: 20000 },
  ];

  const netWorthResult = computeNetWorth(wallets);

  assert.equal(netWorthResult.netWorth, 153000);
  assert.equal(netWorthResult.activeBalance, 133000);
  assert.equal(netWorthResult.archivedBalance, 20000);
  assert.equal(netWorthResult.walletCount, 3);
});
