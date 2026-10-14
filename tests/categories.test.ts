import test from 'node:test';
import assert from 'node:assert/strict';
import { CategorySchema, TransactionSchema, BudgetSchema, RecurringRuleSchema } from '../lib/validations';
import { filterCategoriesByType, CategoryItem } from '../lib/categories';

test('CategorySchema (Validation Zod)', async (t) => {
  await t.test('valide une catégorie de dépense avec couleur hex standard', () => {
    const valid = {
      name: 'Restaurant & Sorties',
      kind: 'EXPENSE',
      color: '#EF4444',
      isArchived: false,
    };

    const res = CategorySchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.name, 'Restaurant & Sorties');
      assert.strictEqual(res.data.kind, 'EXPENSE');
      assert.strictEqual(res.data.color, '#EF4444');
      assert.strictEqual(res.data.isArchived, false);
    }
  });

  await t.test('valide une catégorie de revenu et normalise le hex en majuscules', () => {
    const valid = {
      name: 'Freelance Dev',
      kind: 'INCOME',
      color: '#3b82f6',
    };

    const res = CategorySchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.kind, 'INCOME');
      assert.strictEqual(res.data.color, '#3B82F6');
      assert.strictEqual(res.data.isArchived, false); // Valeur par défaut
    }
  });

  await t.test('valide une catégorie utilisable en entrée et sortie (BOTH)', () => {
    const valid = {
      name: 'Virement interne',
      kind: 'BOTH',
      color: '#A855F7',
    };

    const res = CategorySchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.kind, 'BOTH');
    }
  });

  await t.test('rejette un nom de catégorie vide ou ne contenant que des espaces', () => {
    const invalidEmpty = {
      name: '',
      kind: 'EXPENSE',
      color: '#EF4444',
    };
    const invalidWhitespace = {
      name: '   ',
      kind: 'EXPENSE',
      color: '#EF4444',
    };

    assert.strictEqual(CategorySchema.safeParse(invalidEmpty).success, false);
    assert.strictEqual(CategorySchema.safeParse(invalidWhitespace).success, false);
  });

  await t.test('rejette un nom de catégorie trop long (> 50 caractères)', () => {
    const invalid = {
      name: 'A'.repeat(51),
      kind: 'EXPENSE',
      color: '#EF4444',
    };

    const res = CategorySchema.safeParse(invalid);
    assert.strictEqual(res.success, false);
  });

  await t.test('rejette une couleur non hexadécimale', () => {
    const invalidColors = ['red', '#ZZZZZZ', '#12345', 'rgb(255,0,0)', '#1234567'];

    for (const color of invalidColors) {
      const res = CategorySchema.safeParse({
        name: 'Test',
        kind: 'EXPENSE',
        color,
      });
      assert.strictEqual(res.success, false, `Couleur invalide non rejetée : ${color}`);
    }
  });

  await t.test('rejette un genre (kind) invalide', () => {
    const invalid = {
      name: 'Test',
      kind: 'UNKNOWN_KIND',
      color: '#EF4444',
    };

    const res = CategorySchema.safeParse(invalid);
    assert.strictEqual(res.success, false);
  });
});

test('filterCategoriesByType (Utilitaire de filtrage)', async (t) => {
  const sampleCategories: CategoryItem[] = [
    {
      id: 'cat-1',
      userId: 'user-1',
      name: 'Alimentation',
      kind: 'EXPENSE',
      color: '#EF4444',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-2',
      userId: 'user-1',
      name: 'Salaire',
      kind: 'INCOME',
      color: '#10B981',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-3',
      userId: 'user-1',
      name: 'Cadeau',
      kind: 'BOTH',
      color: '#EC4899',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-4',
      userId: 'user-1',
      name: 'Ancien projet archivé',
      kind: 'EXPENSE',
      color: '#64748B',
      isArchived: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await t.test('filtre pour EXPENSE : inclut EXPENSE et BOTH, exclut les archivés', () => {
    const result = filterCategoriesByType(sampleCategories, 'EXPENSE');
    const names = result.map((c) => c.name);

    assert.deepStrictEqual(names, ['Alimentation', 'Cadeau']);
  });

  await t.test('filtre pour INCOME : inclut INCOME et BOTH, exclut les archivés', () => {
    const result = filterCategoriesByType(sampleCategories, 'INCOME');
    const names = result.map((c) => c.name);

    assert.deepStrictEqual(names, ['Salaire', 'Cadeau']);
  });

  await t.test('inclut les archivés lorsque includeArchived = true', () => {
    const result = filterCategoriesByType(sampleCategories, 'EXPENSE', true);
    const names = result.map((c) => c.name);

    assert.deepStrictEqual(names, ['Alimentation', 'Cadeau', 'Ancien projet archivé']);
  });
});

test('Schemas Transaction, Budget, RecurringRule avec categoryId optionnel', async (t) => {
  await t.test('TransactionSchema valide avec categoryId UUID', () => {
    const valid = {
      type: 'EXPENSE',
      amount: 15000,
      category: 'Alimentation',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      payment: 'Wave',
      date: new Date().toISOString(),
    };

    const res = TransactionSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.categoryId, '123e4567-e89b-12d3-a456-426614174000');
    }
  });

  await t.test('BudgetSchema valide avec categoryId', () => {
    const valid = {
      category: 'Alimentation',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 80000,
      month: '2026-10',
    };

    const res = BudgetSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.categoryId, '123e4567-e89b-12d3-a456-426614174000');
    }
  });

  await t.test('RecurringRuleSchema valide avec categoryId', () => {
    const valid = {
      type: 'EXPENSE',
      amount: 50000,
      category: 'Transport',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      payment: 'Orange Money',
      dayOfMonth: 1,
    };

    const res = RecurringRuleSchema.safeParse(valid);
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.categoryId, '123e4567-e89b-12d3-a456-426614174000');
    }
  });
});
