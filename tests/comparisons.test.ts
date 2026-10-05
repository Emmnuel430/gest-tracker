import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateVariation, buildPeriodComparison } from '../lib/comparisons';
import { Transaction } from '../types/transaction';

describe('Period Comparisons (V1.2 Specifications)', () => {
  test('calcule une variation normale positive (+20 %)', () => {
    const result = calculateVariation(60000, 50000);
    assert.equal(result.currentAmount, 60000);
    assert.equal(result.previousAmount, 50000);
    assert.equal(result.difference, 10000);
    assert.equal(result.percentage, 20);
    assert.equal(result.isNew, false);
    assert.equal(result.statusText, '+20 %');
  });

  test('calcule une variation normale négative (-25 %)', () => {
    const result = calculateVariation(75000, 100000);
    assert.equal(result.currentAmount, 75000);
    assert.equal(result.previousAmount, 100000);
    assert.equal(result.difference, -25000);
    assert.equal(result.percentage, -25);
    assert.equal(result.isNew, false);
    assert.equal(result.statusText, '-25 %');
  });

  test('gère le cas précédent = 0 en affichant "Nouveau" au lieu de +∞ %', () => {
    const result = calculateVariation(15000, 0);
    assert.equal(result.currentAmount, 15000);
    assert.equal(result.previousAmount, 0);
    assert.equal(result.difference, 15000);
    assert.equal(result.percentage, null);
    assert.equal(result.isNew, true);
    assert.equal(result.statusText, 'Nouveau');
  });

  test('gère le cas où les deux périodes sont à 0', () => {
    const result = calculateVariation(0, 0);
    assert.equal(result.difference, 0);
    assert.equal(result.percentage, 0);
    assert.equal(result.isNew, false);
    assert.equal(result.statusText, '0 %');
  });

  test('construit correctement la comparaison par catégorie et moyen de paiement', () => {
    const currentTxs: Transaction[] = [
      {
        id: '1',
        type: 'EXPENSE',
        amount: 20000,
        category: 'Alimentation',
        payment: 'Wave',
        date: new Date('2026-10-02'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'EXPENSE',
        amount: 5000,
        category: 'Transport',
        payment: 'Espèces',
        date: new Date('2026-10-03'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const previousTxs: Transaction[] = [
      {
        id: '3',
        type: 'EXPENSE',
        amount: 10000,
        category: 'Alimentation',
        payment: 'Wave',
        date: new Date('2026-09-02'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const comparison = buildPeriodComparison(currentTxs, previousTxs);

    assert.equal(comparison.currentTotal, 25000);
    assert.equal(comparison.previousTotal, 10000);
    assert.equal(comparison.difference, 15000);
    assert.equal(comparison.percentage, 150);

    // Vérification catégorie Alimentation
    const alim = comparison.categoryComparisons.find((c) => c.category === 'Alimentation');
    assert.ok(alim);
    assert.equal(alim.currentAmount, 20000);
    assert.equal(alim.previousAmount, 10000);
    assert.equal(alim.percentage, 100);

    // Vérification catégorie Transport (Nouveau)
    const transport = comparison.categoryComparisons.find((c) => c.category === 'Transport');
    assert.ok(transport);
    assert.equal(transport.currentAmount, 5000);
    assert.equal(transport.previousAmount, 0);
    assert.equal(transport.isNew, true);
    assert.equal(transport.statusText, 'Nouveau');

    // Vérification moyen de paiement
    const wave = comparison.paymentComparisons.find((p) => p.payment === 'Wave');
    assert.ok(wave);
    assert.equal(wave.currentAmount, 20000);
    assert.equal(wave.previousAmount, 10000);
  });
});
