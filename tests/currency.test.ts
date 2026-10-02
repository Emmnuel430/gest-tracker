import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from '../constants/config';

describe('Currency Formatter (formatCurrency)', () => {
  it('formate correctement les millions avec séparateur point', () => {
    assert.equal(formatCurrency(5000000), '5.000.000 FCFA');
  });

  it('formate correctement les milliers', () => {
    assert.equal(formatCurrency(5000), '5.000 FCFA');
    assert.equal(formatCurrency(100000), '100.000 FCFA');
  });

  it('formate correctement les petits montants sans point superflu', () => {
    assert.equal(formatCurrency(500), '500 FCFA');
    assert.equal(formatCurrency(0), '0 FCFA');
  });

  it('gère correctement les valeurs négatives', () => {
    assert.equal(formatCurrency(-12500), '-12.500 FCFA');
    assert.equal(formatCurrency(-5000000), '-5.000.000 FCFA');
  });

  it('gère les chaînes numériques et cas limites (null, undefined, NaN)', () => {
    assert.equal(formatCurrency('25000'), '25.000 FCFA');
    assert.equal(formatCurrency(null), '0 FCFA');
    assert.equal(formatCurrency(undefined), '0 FCFA');
    assert.equal(formatCurrency('abc'), '0 FCFA');
  });
});
