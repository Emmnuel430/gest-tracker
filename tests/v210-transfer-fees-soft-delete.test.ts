import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTransferFee, formatTransferFeePreview } from '../lib/transfer-fees';
import { computeNetWorth, computeWalletBalance } from '../lib/wallet-balance';
import { TransferSchema } from '../lib/validations';

test('Version 2.10.0 — Pure Transfer Fee Computation (ADR-04 & D9)', () => {
  // Test 1: 10 000 FCFA à 1 % -> 100 FCFA
  const fee1 = computeTransferFee({
    amount: 10000,
    mode: 'PERCENT',
    value: 1,
  });
  assert.equal(fee1, 100);

  // Test 2: 3 333 FCFA à 1,5 % -> 50 FCFA (Math.round(49.995) = 50)
  const fee2 = computeTransferFee({
    amount: 3333,
    mode: 'PERCENT',
    value: 1.5,
  });
  assert.equal(fee2, 50);

  // Test 3: Frais 0 -> 0 (aucune opération de frais nécessaire)
  const feeZero = computeTransferFee({
    amount: 10000,
    mode: 'PERCENT',
    value: 0,
  });
  assert.equal(feeZero, 0);

  // Test 4: Montant fixe
  const feeFixed = computeTransferFee({
    amount: 25000,
    mode: 'AMOUNT',
    value: 500,
  });
  assert.equal(feeFixed, 500);

  // Test 5: Plafonnement strict (les frais ne peuvent pas dépasser le montant transféré)
  const feeCapped = computeTransferFee({
    amount: 200,
    mode: 'AMOUNT',
    value: 500,
  });
  assert.equal(feeCapped, 200);

  // Test 6: Valeurs négatives ou invalides
  assert.equal(computeTransferFee({ amount: 1000, mode: 'AMOUNT', value: -50 }), 0);
  assert.equal(computeTransferFee({ amount: -1000, mode: 'AMOUNT', value: 50 }), 0);
});

test('Version 2.10.0 — Live Preview Formatting (D9)', () => {
  const preview = formatTransferFeePreview({
    amount: 10000,
    fee: 100,
    sourceName: 'Orange Money',
    targetName: 'Espèces',
    mode: 'PERCENT',
    percentValue: 1,
  });

  assert.ok(preview.includes('Orange Money'));
  assert.ok(preview.includes('Espèces'));
  const normalized = preview.replace(/\s+/g, ' ');
  assert.ok(normalized.includes('10 100'));
  assert.ok(normalized.includes('10 000'));
  assert.ok(normalized.includes('100'));
  assert.ok(normalized.includes('1 %'));
});

test('Version 2.10.0 — Financial Rule: Net Worth Conservation with Transfer Fees', () => {
  // Situation de départ :
  // Source (Wave) : 50 000 FCFA
  // Cible (Espèces) : 10 000 FCFA
  const initialSource = 50000;
  const initialTarget = 10000;
  const initialNetWorth = computeNetWorth([
    { id: '1', currentBalance: initialSource, isArchived: false },
    { id: '2', currentBalance: initialTarget, isArchived: false },
  ]).netWorth;

  assert.equal(initialNetWorth, 60000);

  // Virement de 10 000 FCFA avec 100 FCFA de frais
  const transferAmount = 10000;
  const feeAmount = 100;

  // Source subit : sortie de virement (10 000) ET dépense de frais (100)
  const sourceAfter = computeWalletBalance(initialSource, {
    income: 0,
    expense: feeAmount,
    transferIn: 0,
    transferOut: transferAmount,
  });
  assert.equal(sourceAfter, 39900);

  // Cible reçoit : entrée de virement (10 000)
  const targetAfter = computeWalletBalance(initialTarget, {
    income: 0,
    expense: 0,
    transferIn: transferAmount,
    transferOut: 0,
  });
  assert.equal(targetAfter, 20000);

  // Nouveau patrimoine net
  const finalNetWorth = computeNetWorth([
    { id: '1', currentBalance: sourceAfter, isArchived: false },
    { id: '2', currentBalance: targetAfter, isArchived: false },
  ]).netWorth;

  assert.equal(finalNetWorth, 59900);
  // Règle financière absolue : Patrimoine_apres = Patrimoine_avant - frais
  assert.equal(initialNetWorth - finalNetWorth, feeAmount);
});

test('Version 2.10.0 — Soft-deleted Wallet Exclusion from Net Worth (D10, C7)', () => {
  const wallets = [
    { id: 'w1', currentBalance: 50000, isArchived: false, isDeleted: false },
    { id: 'w2', currentBalance: 20000, isArchived: true, isDeleted: false },
    { id: 'w3', currentBalance: 12500, isArchived: false, isDeleted: true }, // Supprimé logiquement
  ];

  const summary = computeNetWorth(wallets);

  // Le solde du compte w3 (12 500) ne doit pas être compté dans le patrimoine
  assert.equal(summary.netWorth, 70000); // 50 000 + 20 000
  assert.equal(summary.activeBalance, 50000);
  assert.equal(summary.archivedBalance, 20000);
  assert.equal(summary.walletCount, 2); // w3 exclu du comptage des comptes patrimoniaux
});

test('Version 2.10.0 — TransferSchema Zod Validations (Frais & Transferts)', () => {
  // Transfert valide sans frais
  const validNoFee = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'dst-2',
    amount: 10000,
  });
  assert.equal(validNoFee.success, true);

  // Transfert valide avec frais en montant
  const validAmountFee = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'dst-2',
    amount: 10000,
    hasFee: true,
    feeMode: 'AMOUNT',
    feeValue: 150,
  });
  assert.equal(validAmountFee.success, true);

  // Transfert valide avec frais en pourcentage
  const validPercentFee = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'dst-2',
    amount: 10000,
    hasFee: true,
    feeMode: 'PERCENT',
    feeValue: 1.5,
  });
  assert.equal(validPercentFee.success, true);

  // Invalide : source et cible identiques
  const invalidCircular = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'src-1',
    amount: 10000,
  });
  assert.equal(invalidCircular.success, false);

  // Invalide : pourcentage supérieur à 100 %
  const invalidPercentHigh = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'dst-2',
    amount: 10000,
    hasFee: true,
    feeMode: 'PERCENT',
    feeValue: 105,
  });
  assert.equal(invalidPercentHigh.success, false);

  // Invalide : montant des frais supérieur au montant transféré
  const invalidFeeHigh = TransferSchema.safeParse({
    sourceWalletId: 'src-1',
    targetWalletId: 'dst-2',
    amount: 1000,
    hasFee: true,
    feeMode: 'AMOUNT',
    feeValue: 1500,
  });
  assert.equal(invalidFeeHigh.success, false);
});
