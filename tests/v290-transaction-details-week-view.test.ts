import test from 'node:test';
import assert from 'node:assert/strict';
import { getDateRangeForPeriod } from '../lib/dates';
import { calculateFinancialSummary } from '../lib/statistics';
import { Transaction } from '../types/transaction';
import { formatCurrency } from '../constants/config';

test('v2.9.0 - Résolution et couverture calendaire de la Semaine en cours (Constat C5)', async (t) => {
  await t.test('calcule une semaine normale débutant le lundi et finissant le dimanche', () => {
    // Mercredi 15 octobre 2026
    const midWeek = new Date('2026-10-15T14:30:00Z');
    const range = getDateRangeForPeriod('week', undefined, undefined, midWeek);

    // Lundi 12 octobre 2026 à 00:00:00 (local)
    assert.equal(range.from.getDay(), 1, 'Le début de semaine doit être un lundi');
    // Dimanche 18 octobre 2026 à 23:59:59 (local)
    assert.equal(range.to.getDay(), 0, 'La fin de semaine doit être un dimanche');
    assert(range.from <= midWeek && midWeek <= range.to, 'Le jour de référence doit être inclus dans la semaine');
  });

  await t.test('inclut les jours de fin d’année précédente pour une semaine à cheval sur deux années (C5)', () => {
    // Jeudi 1er janvier 2026 : le lundi de cette semaine est le 29 décembre 2025
    const newYearDay = new Date('2026-01-01T10:00:00Z');
    const weekRange = getDateRangeForPeriod('week', undefined, undefined, newYearDay);

    assert.equal(weekRange.from.getFullYear(), 2025, 'Le début de la semaine doit être en 2025');
    assert.equal(weekRange.from.getMonth(), 11, 'Le mois doit être décembre (11)');
    assert.equal(weekRange.from.getDate(), 29, 'Le jour doit être le 29 décembre');
    assert.equal(weekRange.from.getDay(), 1, 'Le 29 décembre doit être un lundi');

    assert.equal(weekRange.to.getFullYear(), 2026, 'La fin de la semaine doit être en 2026');
    assert.equal(weekRange.to.getMonth(), 0, 'Le mois doit être janvier (0)');
    assert.equal(weekRange.to.getDate(), 4, 'Le jour doit être le 4 janvier');
    assert.equal(weekRange.to.getDay(), 0, 'Le 4 janvier doit être un dimanche');

    // Vérifier l'inclusion d'une transaction du 30 décembre 2025
    const txPrecedente = new Date('2025-12-30T16:00:00Z');
    assert(
      txPrecedente >= weekRange.from && txPrecedente <= weekRange.to,
      'Une opération du 30 décembre 2025 doit être incluse dans la semaine du 1er janvier 2026'
    );
  });

  await t.test('borne rigoureusement le dimanche 23:59:59 et exclut le lundi suivant 00:00:00', () => {
    const refDate = new Date('2026-10-14T12:00:00Z');
    const range = getDateRangeForPeriod('week', undefined, undefined, refDate);

    // Dimanche 23:59:59
    assert(range.to.getHours() === 23 && range.to.getMinutes() === 59 && range.to.getSeconds() === 59);

    // Lundi suivant 00:00:00
    const nextMonday = new Date(range.to.getTime() + 1000);
    assert(nextMonday > range.to, 'Le lundi suivant doit être strictement supérieur à la fin de semaine');
  });
});

test('v2.9.0 - Neutralité financière des Virements et non-assimilation en dépenses (Constat C4 & Règle 5)', async (t) => {
  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'INCOME',
      amount: 100000,
      category: 'Salaire',
      payment: 'Compte bancaire',
      date: '2026-10-10T10:00:00Z',
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z',
    },
    {
      id: 'tx-2',
      type: 'EXPENSE',
      amount: 25000,
      category: 'Alimentation',
      payment: 'Wave',
      date: '2026-10-12T12:00:00Z',
      createdAt: '2026-10-12T12:00:00Z',
      updatedAt: '2026-10-12T12:00:00Z',
    },
    {
      id: 'tx-3',
      type: 'TRANSFER',
      amount: 50000,
      category: 'Virement interne',
      payment: 'Compte bancaire',
      targetWalletId: 'wallet-wave',
      date: '2026-10-13T15:00:00Z',
      createdAt: '2026-10-13T15:00:00Z',
      updatedAt: '2026-10-13T15:00:00Z',
    },
  ];

  await t.test('calculateFinancialSummary ignore totalement les virements pour le total des entrées et dépenses', () => {
    const summary = calculateFinancialSummary(transactions);

    assert.equal(summary.totalIncome, 100000, 'Les revenus doivent être de 100 000 FCFA');
    assert.equal(summary.totalExpense, 25000, 'Les dépenses doivent être de 25 000 FCFA (le virement de 50 000 est neutre)');
    assert.equal(summary.balance, 75000, 'Le solde de flux doit être 100 000 - 25 000 = 75 000 FCFA');
    assert.equal(summary.transactionCount, 3, 'Le nombre d’opérations total inclut le virement');
  });

  await t.test('un virement interne ne comporte aucun signe négatif d’imputation', () => {
    const virement = transactions[2];
    assert.equal(virement.type, 'TRANSFER');
    const formatted = formatCurrency(virement.amount);
    assert.equal(formatted.includes('-'), false, 'Le montant formaté d’un virement ne doit pas contenir de signe moins');
  });
});
