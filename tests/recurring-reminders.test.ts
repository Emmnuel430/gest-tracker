import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveDueDate,
  formatDueDateISO,
  isSameCalendarDay,
  getRemindersDueOn,
} from '../lib/recurring';
import { RecurringRuleSchema } from '../lib/validations';

test('Recurring Reminders Engine (V2.6.0)', async (t) => {
  await t.test('RecurringRuleSchema inclut remindersEnabled avec true par défaut', () => {
    const parsedDefault = RecurringRuleSchema.safeParse({
      type: 'EXPENSE',
      amount: 150000,
      category: 'Loyer',
      payment: 'Virement',
      dayOfMonth: 5,
    });
    assert.strictEqual(parsedDefault.success, true);
    if (parsedDefault.success) {
      assert.strictEqual(parsedDefault.data.remindersEnabled, true);
    }

    const parsedExplicitFalse = RecurringRuleSchema.safeParse({
      type: 'EXPENSE',
      amount: 150000,
      category: 'Loyer',
      payment: 'Virement',
      dayOfMonth: 5,
      remindersEnabled: false,
    });
    assert.strictEqual(parsedExplicitFalse.success, true);
    if (parsedExplicitFalse.success) {
      assert.strictEqual(parsedExplicitFalse.data.remindersEnabled, false);
    }
  });

  await t.test('détecte correctement les rappels J-7, J-3 et J0', () => {
    const rules = [
      {
        id: 'rule-rent',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 200000,
        category: 'Loyer',
        dayOfMonth: 10,
        isActive: true,
        remindersEnabled: true,
      },
    ];

    // J-7 : 3 octobre pour une échéance le 10 octobre
    const dateJMinus7 = new Date(2026, 9, 3, 8, 0, 0);
    const remindersJ7 = getRemindersDueOn(dateJMinus7, rules);
    assert.strictEqual(remindersJ7.length, 1);
    assert.strictEqual(remindersJ7[0].ruleId, 'rule-rent');
    assert.strictEqual(remindersJ7[0].offsetDays, 7);
    assert.strictEqual(formatDueDateISO(remindersJ7[0].dueDate), '2026-10-10');

    // J-3 : 7 octobre pour une échéance le 10 octobre
    const dateJMinus3 = new Date(2026, 9, 7, 8, 0, 0);
    const remindersJ3 = getRemindersDueOn(dateJMinus3, rules);
    assert.strictEqual(remindersJ3.length, 1);
    assert.strictEqual(remindersJ3[0].offsetDays, 3);
    assert.strictEqual(formatDueDateISO(remindersJ3[0].dueDate), '2026-10-10');

    // J0 : 10 octobre pour une échéance le 10 octobre
    const dateJ0 = new Date(2026, 9, 10, 8, 0, 0);
    const remindersJ0 = getRemindersDueOn(dateJ0, rules);
    assert.strictEqual(remindersJ0.length, 1);
    assert.strictEqual(remindersJ0[0].offsetDays, 0);
    assert.strictEqual(formatDueDateISO(remindersJ0[0].dueDate), '2026-10-10');

    // Autre jour (ex: J-5, 5 octobre) : aucun rappel
    const dateJMinus5 = new Date(2026, 9, 5, 8, 0, 0);
    const remindersJ5 = getRemindersDueOn(dateJMinus5, rules);
    assert.strictEqual(remindersJ5.length, 0);
  });

  await t.test('gère le clamp de fin de mois (ex: 31 ramené au 30 avril ou 28 février)', () => {
    const rules = [
      {
        id: 'rule-clamp-31',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 50000,
        category: 'Abonnements',
        dayOfMonth: 31,
        isActive: true,
        remindersEnabled: true,
      },
    ];

    // En avril (30 jours) : l'échéance effective est le 30 avril.
    // J-7 = 23 avril
    const dateApril23 = new Date(2026, 3, 23, 8, 0, 0);
    const remindersAprilJ7 = getRemindersDueOn(dateApril23, rules);
    assert.strictEqual(remindersAprilJ7.length, 1);
    assert.strictEqual(remindersAprilJ7[0].offsetDays, 7);
    assert.strictEqual(formatDueDateISO(remindersAprilJ7[0].dueDate), '2026-04-30');

    // En février non bissextile (2025, 28 jours) : l'échéance effective est le 28 février.
    // J-7 = 21 février
    const dateFeb21 = new Date(2025, 1, 21, 8, 0, 0);
    const remindersFebJ7 = getRemindersDueOn(dateFeb21, rules);
    assert.strictEqual(remindersFebJ7.length, 1);
    assert.strictEqual(remindersFebJ7[0].offsetDays, 7);
    assert.strictEqual(formatDueDateISO(remindersFebJ7[0].dueDate), '2025-02-28');

    // J0 = 28 février
    const dateFeb28 = new Date(2025, 1, 28, 8, 0, 0);
    const remindersFebJ0 = getRemindersDueOn(dateFeb28, rules);
    assert.strictEqual(remindersFebJ0.length, 1);
    assert.strictEqual(remindersFebJ0[0].offsetDays, 0);
    assert.strictEqual(formatDueDateISO(remindersFebJ0[0].dueDate), '2025-02-28');
  });

  await t.test('ignore les règles inactives (isActive: false)', () => {
    const rules = [
      {
        id: 'rule-inactive',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 25000,
        category: 'Gym',
        dayOfMonth: 10,
        isActive: false,
        remindersEnabled: true,
      },
    ];

    const dateJ0 = new Date(2026, 9, 10, 8, 0, 0);
    const reminders = getRemindersDueOn(dateJ0, rules);
    assert.strictEqual(reminders.length, 0);
  });

  await t.test('ignore les règles dont les rappels sont désactivés (remindersEnabled: false)', () => {
    const rules = [
      {
        id: 'rule-no-reminder',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 25000,
        category: 'Gym',
        dayOfMonth: 10,
        isActive: true,
        remindersEnabled: false,
      },
    ];

    const dateJ0 = new Date(2026, 9, 10, 8, 0, 0);
    const reminders = getRemindersDueOn(dateJ0, rules);
    assert.strictEqual(reminders.length, 0);
  });

  await t.test('déduplication : ne renvoie pas un rappel déjà envoyé (status: SENT)', () => {
    const rules = [
      {
        id: 'rule-dedup',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 80000,
        category: 'Assurance',
        dayOfMonth: 15,
        isActive: true,
        remindersEnabled: true,
      },
    ];

    const dateJMinus7 = new Date(2026, 9, 8, 8, 0, 0);

    // Sans historique de log : le rappel J-7 doit être envoyé
    const initialReminders = getRemindersDueOn(dateJMinus7, rules, []);
    assert.strictEqual(initialReminders.length, 1);
    assert.strictEqual(initialReminders[0].offsetDays, 7);

    // Avec log existant envoyé : aucun rappel
    const existingLogs = [
      {
        ruleId: 'rule-dedup',
        dueDate: '2026-10-15',
        offsetDays: 7,
        status: 'SENT',
      },
    ];
    const filteredReminders = getRemindersDueOn(dateJMinus7, rules, existingLogs);
    assert.strictEqual(filteredReminders.length, 0);

    // Mais quand le jour arrive à J-3 (12 octobre), J-3 doit être renvoyé même si J-7 était déjà envoyé
    const dateJMinus3 = new Date(2026, 9, 12, 8, 0, 0);
    const remindersJ3 = getRemindersDueOn(dateJMinus3, rules, existingLogs);
    assert.strictEqual(remindersJ3.length, 1);
    assert.strictEqual(remindersJ3[0].offsetDays, 3);
  });

  await t.test('convertit correctement les objets Decimal en nombres natifs', () => {
    const rules = [
      {
        id: 'rule-decimal',
        userId: 'user-1',
        type: 'INCOME',
        amount: { toNumber: () => 450000 },
        category: 'Consulting',
        dayOfMonth: 20,
        isActive: true,
        remindersEnabled: true,
      },
    ];

    const dateJ0 = new Date(2026, 9, 20, 8, 0, 0);
    const reminders = getRemindersDueOn(dateJ0, rules);
    assert.strictEqual(reminders.length, 1);
    assert.strictEqual(reminders[0].amount, 450000);
    assert.strictEqual(typeof reminders[0].amount, 'number');
  });
});
