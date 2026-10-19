import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeWalletBalance, computeNetWorth } from '../lib/wallet-balance';

test('computeWalletBalance: calcul exact sans approximations flottantes', () => {
  // initial (10 000) + income (5 000) - expense (3 250.75) + transferIn (2 000) - transferOut (1 000) = 12 749.25
  const balance = computeWalletBalance(10000, {
    income: 5000,
    expense: 3250.75,
    transferIn: 2000,
    transferOut: 1000,
  });

  assert.equal(balance, 12749.25);
});

test('computeWalletBalance: solde négatif autorisé (ex: découvert bancaire)', () => {
  const balance = computeWalletBalance(0, {
    income: 1000,
    expense: 5000,
    transferIn: 0,
    transferOut: 0,
  });

  assert.equal(balance, -4000);
});

test('computeWalletBalance: aucun mouvement retourne le solde initial', () => {
  const balance = computeWalletBalance(25000, {
    income: 0,
    expense: 0,
    transferIn: 0,
    transferOut: 0,
  });

  assert.equal(balance, 25000);
});

test('computeNetWorth: somme tous les comptes y compris les archivés (Règle Q10)', () => {
  const wallets = [
    { id: 'w1', isArchived: false, currentBalance: 50000 },
    { id: 'w2', isArchived: false, currentBalance: 25000 },
    { id: 'w3', isArchived: true, currentBalance: 15000 }, // archivé avec solde positif
    { id: 'w4', isArchived: true, currentBalance: 0 },
  ];

  const result = computeNetWorth(wallets);

  // netWorth doit être la somme de TOUS les comptes : 50 000 + 25 000 + 15 000 = 90 000
  assert.equal(result.netWorth, 90000);
  // activeBalance = 50 000 + 25 000 = 75 000
  assert.equal(result.activeBalance, 75000);
  // archivedBalance = 15 000
  assert.equal(result.archivedBalance, 15000);
  // walletCount = 4
  assert.equal(result.walletCount, 4);
});

test('computeNetWorth: gère une liste vide de portefeuilles', () => {
  const result = computeNetWorth([]);

  assert.equal(result.netWorth, 0);
  assert.equal(result.activeBalance, 0);
  assert.equal(result.archivedBalance, 0);
  assert.equal(result.walletCount, 0);
});
