import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RecurringRuleSchema } from '../lib/validations';
import {
  resolveDueDate,
  formatDayOfMonthLabel,
  getTodayInTimeZone,
  formatCurrentMonthISO,
} from '../lib/recurring';

test('RecurringRuleSchema (Zod Validation V2.15.1)', async (t) => {
  await t.test('valide une règle de dépense récurrente conforme', () => {
    const validExpense = {
      type: 'EXPENSE',
      amount: 150000,
      category: 'Logement',
      payment: 'Compte bancaire',
      dayOfMonth: 5,
      frequency: 'MONTHLY',
      note: 'Loyer mensuel appartement',
      isActive: true,
    };

    const res = RecurringRuleSchema.safeParse(validExpense);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.amount, 150000);
      assert.strictEqual(res.data.dayOfMonth, 5);
      assert.strictEqual(res.data.frequency, 'MONTHLY');
    }
  });

  await t.test('valide une règle de revenu récurrent conforme avec valeurs par défaut', () => {
    const validIncome = {
      type: 'INCOME',
      amount: 600000,
      category: 'Travail PC',
      payment: 'Compte bancaire',
      dayOfMonth: 28,
    };

    const res = RecurringRuleSchema.safeParse(validIncome);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.type, 'INCOME');
      assert.strictEqual(res.data.frequency, 'MONTHLY');
      assert.strictEqual(res.data.isActive, true);
      assert.strictEqual(res.data.remindersEnabled, true);
    }
  });

  await t.test('REC-01 : rejette les fréquences WEEKLY et YEARLY non supportées par le moteur', () => {
    const invalidWeekly = {
      type: 'EXPENSE',
      amount: 25000,
      category: 'Transport',
      payment: 'Wave',
      dayOfMonth: 5,
      frequency: 'WEEKLY',
    };
    const resWeekly = RecurringRuleSchema.safeParse(invalidWeekly);
    assert.strictEqual(resWeekly.success, false);

    const invalidYearly = {
      type: 'EXPENSE',
      amount: 120000,
      category: 'Assurance',
      payment: 'Compte bancaire',
      dayOfMonth: 15,
      frequency: 'YEARLY',
    };
    const resYearly = RecurringRuleSchema.safeParse(invalidYearly);
    assert.strictEqual(resYearly.success, false);
  });

  await t.test('rejette un montant négatif ou nul', () => {
    const invalidZero = {
      type: 'EXPENSE',
      amount: 0,
      category: 'Alimentation',
      payment: 'Wave',
      dayOfMonth: 10,
    };

    const resZero = RecurringRuleSchema.safeParse(invalidZero);
    assert.strictEqual(resZero.success, false);

    const invalidNegative = {
      type: 'EXPENSE',
      amount: -5000,
      category: 'Alimentation',
      payment: 'Wave',
      dayOfMonth: 10,
    };

    const resNeg = RecurringRuleSchema.safeParse(invalidNegative);
    assert.strictEqual(resNeg.success, false);
  });

  await t.test('rejette un jour de mois hors limites (< 1 ou > 31)', () => {
    const invalidDayZero = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Abonnement',
      payment: 'Wave',
      dayOfMonth: 0,
    };

    const resDayZero = RecurringRuleSchema.safeParse(invalidDayZero);
    assert.strictEqual(resDayZero.success, false);

    const invalidDay32 = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Abonnement',
      payment: 'Wave',
      dayOfMonth: 32,
    };

    const resDay32 = RecurringRuleSchema.safeParse(invalidDay32);
    assert.strictEqual(resDay32.success, false);
  });

  await t.test('rejette un type invalide ou une note trop longue (> 250 chars)', () => {
    const invalidType = {
      type: 'TRANSFER',
      amount: 10000,
      category: 'Transport',
      payment: 'Wave',
      dayOfMonth: 15,
    };

    const resType = RecurringRuleSchema.safeParse(invalidType);
    assert.strictEqual(resType.success, false);

    const invalidNote = {
      type: 'EXPENSE',
      amount: 10000,
      category: 'Transport',
      payment: 'Wave',
      dayOfMonth: 15,
      note: 'a'.repeat(251),
    };

    const resNote = RecurringRuleSchema.safeParse(invalidNote);
    assert.strictEqual(resNote.success, false);
  });
});

test('Recurring Rules Due Status, Idempotency & Forecasting Calculations (V2.15.1)', async (t) => {
  interface RuleMock {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    isActive: boolean;
    lastProcessedMonth: string | null;
  }

  const isDueThisMonth = (rule: RuleMock, currentMonth: string): boolean => {
    if (!rule.isActive) return false;
    return rule.lastProcessedMonth !== currentMonth;
  };

  const currentMonth = '2026-10';

  await t.test('identifie une règle active sans historique comme due', () => {
    const rule: RuleMock = {
      id: '1',
      type: 'EXPENSE',
      amount: 25000,
      isActive: true,
      lastProcessedMonth: null,
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), true);
  });

  await t.test('identifie une règle traitée le mois précédent comme due pour le mois en cours', () => {
    const rule: RuleMock = {
      id: '2',
      type: 'EXPENSE',
      amount: 150000,
      isActive: true,
      lastProcessedMonth: '2026-09',
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), true);
  });

  await t.test('REC-02 : identifie une règle déjà traitée ce mois-ci comme non due (idempotence)', () => {
    const rule: RuleMock = {
      id: '3',
      type: 'EXPENSE',
      amount: 150000,
      isActive: true,
      lastProcessedMonth: '2026-10',
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), false);
  });

  await t.test('ne marque jamais une règle inactive comme due', () => {
    const rule: RuleMock = {
      id: '4',
      type: 'EXPENSE',
      amount: 5000,
      isActive: false,
      lastProcessedMonth: null,
    };

    assert.strictEqual(isDueThisMonth(rule, currentMonth), false);
  });

  await t.test('calcule fidèlement les totaux prévisionnels actifs mensuels', () => {
    const rules: RuleMock[] = [
      { id: '1', type: 'INCOME', amount: 500000, isActive: true, lastProcessedMonth: null },
      { id: '2', type: 'INCOME', amount: 100000, isActive: false, lastProcessedMonth: null },
      { id: '3', type: 'EXPENSE', amount: 150000, isActive: true, lastProcessedMonth: null },
      { id: '4', type: 'EXPENSE', amount: 25000, isActive: true, lastProcessedMonth: null },
    ];

    const activeRules = rules.filter((r) => r.isActive);
    const expectedIncome = activeRules
      .filter((r) => r.type === 'INCOME')
      .reduce((sum, r) => sum + r.amount, 0);
    const expectedExpense = activeRules
      .filter((r) => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0);
    const net = expectedIncome - expectedExpense;

    assert.strictEqual(expectedIncome, 500000);
    assert.strictEqual(expectedExpense, 175000);
    assert.strictEqual(net, 325000);
  });
});

test('Recurring Rules Due Date Resolution & TimeZone Normalization (V2.15.1)', async (t) => {
  await t.test('ramène le 31 au 28 février pour une année non bissextile (2027)', () => {
    const dueDate = resolveDueDate(2027, 1, 31);
    assert.strictEqual(dueDate.getFullYear(), 2027);
    assert.strictEqual(dueDate.getMonth(), 1);
    assert.strictEqual(dueDate.getDate(), 28);
    assert.strictEqual(dueDate.getHours(), 12);
  });

  await t.test('ramène le 31 au 29 février pour une année bissextile (2028)', () => {
    const dueDate = resolveDueDate(2028, 1, 31);
    assert.strictEqual(dueDate.getFullYear(), 2028);
    assert.strictEqual(dueDate.getMonth(), 1);
    assert.strictEqual(dueDate.getDate(), 29);
    assert.strictEqual(dueDate.getHours(), 12);
  });

  await t.test('ramène le 31 au 30 avril pour un mois de 30 jours', () => {
    const dueDate = resolveDueDate(2026, 3, 31);
    assert.strictEqual(dueDate.getFullYear(), 2026);
    assert.strictEqual(dueDate.getMonth(), 3);
    assert.strictEqual(dueDate.getDate(), 30);
  });

  await t.test('conserve le jour exact quand le mois comporte au moins ce nombre de jours', () => {
    const dueDate = resolveDueDate(2026, 9, 15);
    assert.strictEqual(dueDate.getDate(), 15);
  });

  await t.test('formate correctement le libellé pour les jours 29, 30, 31 et standard', () => {
    assert.strictEqual(formatDayOfMonthLabel(31), 'Le 31 (ou dernier jour du mois)');
    assert.strictEqual(formatDayOfMonthLabel(30), 'Le 30 (ou dernier jour du mois)');
    assert.strictEqual(formatDayOfMonthLabel(29), 'Le 29 (ou dernier jour du mois)');
    assert.strictEqual(formatDayOfMonthLabel(15), 'Le 15 du mois');
    assert.strictEqual(formatDayOfMonthLabel(5), 'Le 5 du mois');
  });

  await t.test('MAIL-01 : normalise la date calendaire sur Africa/Abidjan (UTC+0)', () => {
    const sampleUtc = new Date('2026-11-02T23:45:00.000Z');
    const abidjanToday = getTodayInTimeZone(sampleUtc, 'Africa/Abidjan');
    assert.strictEqual(abidjanToday.getFullYear(), 2026);
    assert.strictEqual(abidjanToday.getMonth(), 10); // Novembre = index 10
    assert.strictEqual(abidjanToday.getDate(), 2);
    assert.strictEqual(abidjanToday.getHours(), 12);

    assert.strictEqual(formatCurrentMonthISO(sampleUtc, 'Africa/Abidjan'), '2026-11');
  });

  await t.test('Respect strict de la règle Zéro Emoji sur les fichiers récurrences et mailer', () => {
    const filesToCheck = [
      'actions/recurring.ts',
      'lib/recurring.ts',
      'lib/mailer.ts',
      'app/api/cron/reminders/route.ts',
      'components/recurring/RecurringModal.tsx',
      'components/recurring/RecurringCard.tsx',
      'components/recurring/RecurrencesView.tsx',
      'components/recurring/RecurringAlertBanner.tsx',
    ];
    const emojiRegex = /\p{Extended_Pictographic}/u;

    for (const relPath of filesToCheck) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.strictEqual(
        emojiRegex.test(content),
        false,
        `Un emoji a été détecté dans le fichier ${relPath}`
      );
    }
  });
});
