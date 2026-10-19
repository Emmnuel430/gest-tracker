import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatExportPeriodLabel } from '../lib/dates';
import { describeExportFilters } from '../lib/export-helpers';
import { escapeHtml } from '../lib/utils';

test('formatExportPeriodLabel: formatage explicite sans terme technique', () => {
  const refDate = new Date(2026, 9, 5); // 05/10/2026

  // Today
  const todayLabel = formatExportPeriodLabel('today', {
    from: new Date(2026, 8, 5),
    to: new Date(2026, 8, 5),
  });
  assert.equal(todayLabel, '05/09/2026');

  // Week
  const weekLabel = formatExportPeriodLabel('week', {
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 7),
  });
  assert.equal(weekLabel, 'du 01/09/2026 au 07/09/2026');

  // Month
  const monthLabel = formatExportPeriodLabel('month', {
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 31),
  });
  assert.match(monthLabel, /du 01\/10\/2026 au 31\/10\/2026 \(octobre 2026\)/);

  // Year
  const yearLabel = formatExportPeriodLabel('year', {
    from: new Date(2026, 0, 1),
    to: new Date(2026, 11, 31),
  });
  assert.equal(yearLabel, 'du 01/01/2026 au 31/12/2026 (année 2026)');

  // Custom avec dates différentes
  const customDiff = formatExportPeriodLabel('custom', {
    from: new Date(2026, 8, 3),
    to: new Date(2026, 8, 18),
  });
  assert.equal(customDiff, 'du 03/09/2026 au 18/09/2026');

  // Custom avec date unique
  const customSame = formatExportPeriodLabel('custom', {
    from: new Date(2026, 8, 10),
    to: new Date(2026, 8, 10),
  });
  assert.equal(customSame, '10/09/2026');
});

test('formatExportPeriodLabel: semaine à cheval sur deux années et mois bissextile', () => {
  // Semaine 29/12/2025 au 04/01/2026
  const crossYear = formatExportPeriodLabel('week', {
    from: new Date(2025, 11, 29),
    to: new Date(2026, 0, 4),
  });
  assert.equal(crossYear, 'du 29/12/2025 au 04/01/2026');

  // Février 2028 (bissextile)
  const leapMonth = formatExportPeriodLabel('month', {
    from: new Date(2028, 1, 1),
    to: new Date(2028, 1, 29),
  });
  assert.match(leapMonth, /du 01\/02\/2028 au 29\/02\/2028/);
});

test('describeExportFilters: description claire et exclusion des catégories sans type', () => {
  // 1. Sans filtre
  const noFilters = describeExportFilters({});
  assert.equal(noFilters.hasFilters, false);
  assert.equal(noFilters.filterLabels.length, 0);

  // 2. Type seul
  const expenseOnly = describeExportFilters({ type: 'EXPENSE' });
  assert.equal(expenseOnly.hasFilters, true);
  assert.deepEqual(expenseOnly.filterLabels, ['Type : Dépenses uniquement']);

  // 3. Catégorie sans type : ignorée conformément à la règle d'architecture 2.4.0
  const catWithoutType = describeExportFilters({ category: 'Alimentation' });
  assert.equal(catWithoutType.hasFilters, false);
  assert.equal(catWithoutType.filterLabels.length, 0);

  // 4. Type + Catégorie + Moyen
  const fullFilters = describeExportFilters({
    type: 'INCOME',
    category: 'Salaire',
    payment: 'Compte bancaire',
  });
  assert.equal(fullFilters.hasFilters, true);
  assert.deepEqual(fullFilters.filterLabels, [
    'Type : Entrées uniquement',
    'Catégorie : Salaire',
    'Moyen : Compte bancaire',
  ]);
});

test('escapeHtml: protège efficacement contre les failles XSS', () => {
  assert.equal(
    escapeHtml('<script>alert("hack")</script>'),
    '&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;'
  );
  assert.equal(escapeHtml("L'ami & l'argent"), 'L&#039;ami &amp; l&#039;argent');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});
