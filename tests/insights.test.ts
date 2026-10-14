import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFinancialInsights, BudgetInsightData } from '../lib/insights';

test('Financial Insights Engine (Sprint 17 Specifications)', async (t) => {
  await t.test('détecte un déficit mensuel et génère une alerte EFFORT_RATE danger', () => {
    const insights = computeFinancialInsights({
      currentIncome: 200000,
      currentExpense: 250000,
      currentBalance: -50000,
      categoryExpensesCurrent: { Alimentation: 250000 },
      categoryExpensesPrevious: { Alimentation: 200000 },
      budgets: [],
    });

    const deficitAlert = insights.find((i) => i.type === 'EFFORT_RATE');
    assert.ok(deficitAlert);
    assert.strictEqual(deficitAlert?.severity, 'danger');
    assert.match(deficitAlert?.message || '', /50\.000 FCFA/);
  });

  await t.test('calcule une capacité d’épargne positive avec taux exact', () => {
    const insights = computeFinancialInsights({
      currentIncome: 500000,
      currentExpense: 350000,
      currentBalance: 150000,
      categoryExpensesCurrent: { Logement: 350000 },
      categoryExpensesPrevious: { Logement: 350000 },
      budgets: [],
    });

    const savingsInsight = insights.find((i) => i.type === 'SAVINGS_CAPACITY');
    assert.ok(savingsInsight);
    assert.strictEqual(savingsInsight?.severity, 'success');
    // 150000 / 500000 = 30%
    assert.match(savingsInsight?.message || '', /30 %/);
    assert.match(savingsInsight?.message || '', /150\.000 FCFA/);
  });

  await t.test('déclenche une alerte rouge BUDGET_ALERT en cas de dépassement', () => {
    const mockBudgets: BudgetInsightData[] = [
      {
        category: 'Alimentation',
        amount: 80000,
        spent: 95000,
        percentage: 119,
        status: 'EXCEEDED',
      },
    ];

    const insights = computeFinancialInsights({
      currentIncome: 300000,
      currentExpense: 95000,
      currentBalance: 205000,
      categoryExpensesCurrent: { Alimentation: 95000 },
      categoryExpensesPrevious: { Alimentation: 80000 },
      budgets: mockBudgets,
    });

    const budgetAlert = insights.find((i) => i.type === 'BUDGET_ALERT');
    assert.ok(budgetAlert);
    assert.strictEqual(budgetAlert?.severity, 'danger');
    assert.match(budgetAlert?.title || '', /dépassé/i);
    assert.match(budgetAlert?.message || '', /15\.000 FCFA/); // 95000 - 80000
  });

  await t.test('déclenche un avertissement orange BUDGET_ALERT en cas de tension (≥75%)', () => {
    const mockBudgets: BudgetInsightData[] = [
      {
        category: 'Transport',
        amount: 50000,
        spent: 42000,
        percentage: 84,
        status: 'WARNING',
      },
    ];

    const insights = computeFinancialInsights({
      currentIncome: 200000,
      currentExpense: 42000,
      currentBalance: 158000,
      categoryExpensesCurrent: { Transport: 42000 },
      categoryExpensesPrevious: { Transport: 40000 },
      budgets: mockBudgets,
    });

    const budgetWarning = insights.find((i) => i.type === 'BUDGET_ALERT');
    assert.ok(budgetWarning);
    assert.strictEqual(budgetWarning?.severity, 'warning');
    assert.match(budgetWarning?.title || '', /tension/i);
    assert.match(budgetWarning?.message || '', /84%/);
    assert.match(budgetWarning?.message || '', /8\.000 FCFA/); // Reste: 50000 - 42000
  });

  await t.test('identifie une hausse atypique (> 20%) par rapport au mois précédent', () => {
    const insights = computeFinancialInsights({
      currentIncome: 400000,
      currentExpense: 150000,
      currentBalance: 250000,
      categoryExpensesCurrent: {
        Transport: 30000, // +50% (20000 -> 30000)
        Alimentation: 50000,
      },
      categoryExpensesPrevious: {
        Transport: 20000,
        Alimentation: 50000,
      },
      budgets: [],
    });

    const spike = insights.find((i) => i.type === 'CATEGORY_SPIKE');
    assert.ok(spike);
    assert.strictEqual(spike?.severity, 'warning');
    assert.match(spike?.message || '', /\+50 %/);
    assert.match(spike?.message || '', /10\.000 FCFA/);
  });

  await t.test('génère un avertissement orange SAVINGS_CAPACITY si la marge d’épargne est sous 15%', () => {
    const insights = computeFinancialInsights({
      currentIncome: 100000,
      currentExpense: 90000,
      currentBalance: 10000,
      categoryExpensesCurrent: { Alimentation: 90000 },
      categoryExpensesPrevious: { Alimentation: 90000 },
      budgets: [],
    });

    const savingsWarning = insights.find((i) => i.id === 'savings-warning');
    assert.ok(savingsWarning);
    assert.strictEqual(savingsWarning?.severity, 'warning');
    assert.strictEqual(savingsWarning?.title, 'Marge de sécurité faible');
    assert.match(savingsWarning?.message || '', /10 %/);
    assert.match(savingsWarning?.message || '', /10\.000 FCFA/);
  });

  await t.test('génère un succès SAVINGS_CAPACITY si le taux d’épargne est exactement à 15%', () => {
    const insights = computeFinancialInsights({
      currentIncome: 100000,
      currentExpense: 85000,
      currentBalance: 15000,
      categoryExpensesCurrent: { Alimentation: 85000 },
      categoryExpensesPrevious: { Alimentation: 85000 },
      budgets: [],
    });

    const savingsSuccess = insights.find((i) => i.id === 'savings-success');
    assert.ok(savingsSuccess);
    assert.strictEqual(savingsSuccess?.severity, 'success');
    assert.match(savingsSuccess?.message || '', /15 %/);
  });

  await t.test('cumule les alertes pour plusieurs budgets dépassés et sous tension', () => {
    const mockBudgets: BudgetInsightData[] = [
      {
        category: 'Alimentation',
        amount: 80000,
        spent: 100000,
        percentage: 125,
        status: 'EXCEEDED',
      },
      {
        category: 'Transport',
        amount: 50000,
        spent: 40000,
        percentage: 80,
        status: 'WARNING',
      },
    ];

    const insights = computeFinancialInsights({
      currentIncome: 300000,
      currentExpense: 140000,
      currentBalance: 160000,
      categoryExpensesCurrent: { Alimentation: 100000, Transport: 40000 },
      categoryExpensesPrevious: { Alimentation: 80000, Transport: 35000 },
      budgets: mockBudgets,
    });

    const budgetAlerts = insights.filter((i) => i.type === 'BUDGET_ALERT');
    assert.strictEqual(budgetAlerts.length, 2);

    const exceededAlert = budgetAlerts.find((i) => i.id === 'budget-exceeded-Alimentation');
    assert.ok(exceededAlert);
    assert.strictEqual(exceededAlert?.severity, 'danger');

    const warningAlert = budgetAlerts.find((i) => i.id === 'budget-warning-Transport');
    assert.ok(warningAlert);
    assert.strictEqual(warningAlert?.severity, 'warning');
  });

  await t.test('génère une alerte pour TOUTES les catégories en hausse atypique (> 20%), triées par croissance', () => {
    const insights = computeFinancialInsights({
      currentIncome: 500000,
      currentExpense: 120000,
      currentBalance: 380000,
      categoryExpensesCurrent: {
        Transport: 30000, // +50% (20000 -> 30000)
        Loisirs: 20000,   // +100% (10000 -> 20000)
        Alimentation: 50000, // 0% (50000 -> 50000)
      },
      categoryExpensesPrevious: {
        Transport: 20000,
        Loisirs: 10000,
        Alimentation: 50000,
      },
      budgets: [],
    });

    const spikes = insights.filter((i) => i.type === 'CATEGORY_SPIKE');
    assert.strictEqual(spikes.length, 2);
    // Trié par croissance décroissante : Loisirs (+100%) puis Transport (+50%)
    assert.strictEqual(spikes[0].id, 'spike-Loisirs');
    assert.match(spikes[0].message, /\+100 %/);
    assert.strictEqual(spikes[1].id, 'spike-Transport');
    assert.match(spikes[1].message, /\+50 %/);
  });

  await t.test('génère un insight neutre équilibré si aucun seuil n’est franchi', () => {
    const insights = computeFinancialInsights({
      currentIncome: 0,
      currentExpense: 0,
      currentBalance: 0,
      categoryExpensesCurrent: {},
      categoryExpensesPrevious: {},
      budgets: [],
    });

    assert.strictEqual(insights.length, 1);
    assert.strictEqual(insights[0].severity, 'info');
    assert.strictEqual(insights[0].title, 'Gestion équilibrée');
  });
});
