import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDueDateISO,
  getRemindersDueOn,
  MAX_REMINDER_ATTEMPTS,
} from '../lib/recurring';
import {
  escapeHtml,
  resolveSenderAddress,
  buildReminderEmailContent,
} from '../lib/mailer';
import { RecurringRuleSchema } from '../lib/validations';

test('Recurring Reminders Engine & Mailer Security (V2.6.0 / V2.15.1)', async (t) => {
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
        payment: 'Wave',
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
    assert.strictEqual(remindersJ7[0].payment, 'Wave');
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

    const dateApril23 = new Date(2026, 3, 23, 8, 0, 0);
    const remindersAprilJ7 = getRemindersDueOn(dateApril23, rules);
    assert.strictEqual(remindersAprilJ7.length, 1);
    assert.strictEqual(remindersAprilJ7[0].offsetDays, 7);
    assert.strictEqual(formatDueDateISO(remindersAprilJ7[0].dueDate), '2026-04-30');

    const dateFeb21 = new Date(2025, 1, 21, 8, 0, 0);
    const remindersFebJ7 = getRemindersDueOn(dateFeb21, rules);
    assert.strictEqual(remindersFebJ7.length, 1);
    assert.strictEqual(remindersFebJ7[0].offsetDays, 7);
    assert.strictEqual(formatDueDateISO(remindersFebJ7[0].dueDate), '2025-02-28');

    const dateFeb28 = new Date(2025, 1, 28, 8, 0, 0);
    const remindersFebJ0 = getRemindersDueOn(dateFeb28, rules);
    assert.strictEqual(remindersFebJ0.length, 1);
    assert.strictEqual(remindersFebJ0[0].offsetDays, 0);
    assert.strictEqual(formatDueDateISO(remindersFebJ0[0].dueDate), '2025-02-28');
  });

  await t.test('ignore les règles inactives, sans rappel ou à fréquence non mensuelle', () => {
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
      {
        id: 'rule-weekly-legacy',
        userId: 'user-1',
        type: 'EXPENSE',
        amount: 10000,
        category: 'Transport',
        dayOfMonth: 10,
        frequency: 'WEEKLY',
        isActive: true,
        remindersEnabled: true,
      },
    ];

    const dateJ0 = new Date(2026, 9, 10, 8, 0, 0);
    const reminders = getRemindersDueOn(dateJ0, rules);
    assert.strictEqual(reminders.length, 0);
  });

  await t.test('déduplication : ne renvoie pas un rappel déjà envoyé (SENT) ou ayant atteint 3 échecs', () => {
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

    // 1. Sans historique : rappel envoyé
    const initialReminders = getRemindersDueOn(dateJMinus7, rules, []);
    assert.strictEqual(initialReminders.length, 1);

    // 2. Avec log SENT : ignoré
    const sentLogs = [
      {
        ruleId: 'rule-dedup',
        dueDate: '2026-10-15',
        offsetDays: 7,
        status: 'SENT',
      },
    ];
    assert.strictEqual(getRemindersDueOn(dateJMinus7, rules, sentLogs).length, 0);

    // 3. Avec log FAILED mais attempts = 2 (< MAX_REMINDER_ATTEMPTS) : retenté
    const failedLogsRetriable = [
      {
        ruleId: 'rule-dedup',
        dueDate: '2026-10-15',
        offsetDays: 7,
        status: 'FAILED',
        attempts: 2,
      },
    ];
    assert.strictEqual(getRemindersDueOn(dateJMinus7, rules, failedLogsRetriable).length, 1);

    // 4. Avec log FAILED et attempts = 3 (MAX_REMINDER_ATTEMPTS) : ignoré
    const failedLogsMaxed = [
      {
        ruleId: 'rule-dedup',
        dueDate: '2026-10-15',
        offsetDays: 7,
        status: 'FAILED',
        attempts: MAX_REMINDER_ATTEMPTS,
      },
    ];
    assert.strictEqual(getRemindersDueOn(dateJMinus7, rules, failedLogsMaxed).length, 0);
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

  await t.test('MAIL-03 : resolveSenderAddress formate proprement l’en-tête From pour Gmail SMTP', () => {
    const fromWithPlainEmail = resolveSenderAddress({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'moncompte@gmail.com',
      SMTP_FROM: 'moncompte@gmail.com',
    });
    assert.strictEqual(fromWithPlainEmail, 'Gest Tracker <moncompte@gmail.com>');

    const fromFallbackToUser = resolveSenderAddress({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'moncompte@gmail.com',
    });
    assert.strictEqual(fromFallbackToUser, 'Gest Tracker <moncompte@gmail.com>');

    const fromAlreadyFormatted = resolveSenderAddress({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'moncompte@gmail.com',
      SMTP_FROM: 'Gest Tracker <moncompte@gmail.com>',
    });
    assert.strictEqual(fromAlreadyFormatted, 'Gest Tracker <moncompte@gmail.com>');
  });

  await t.test('MAIL-04 : escapeHtml et buildReminderEmailContent neutralisent toute injection HTML/XSS', () => {
    const rawMalicious = '<script>alert("xss")</script> & "quote" \'single\'';
    const escaped = escapeHtml(rawMalicious);
    assert.strictEqual(
      escaped,
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quote&quot; &#39;single&#39;'
    );

    const content = buildReminderEmailContent({
      to: 'user@example.com',
      category: 'Loyer <img src=x onerror=alert(1)>',
      payment: 'Wave & <script>evil()</script>',
      type: 'EXPENSE',
      amount: 150000,
      dueDate: new Date(2026, 10, 5, 12, 0, 0),
      offsetDays: 3,
      note: 'Note avec <script>steal()</script>',
    });

    assert.strictEqual(content.html.includes('<script>'), false);
    assert.strictEqual(content.html.includes('<img src=x'), false);
    assert.strictEqual(content.html.includes('&lt;script&gt;steal()&lt;/script&gt;'), true);
    assert.strictEqual(content.html.includes('Wave &amp; &lt;script&gt;evil()&lt;/script&gt;'), true);
    assert.strictEqual(content.text.includes('Portefeuille : Wave'), true);
  });
});
