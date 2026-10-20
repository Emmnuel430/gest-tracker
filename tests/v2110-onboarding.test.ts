import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { OnboardingSchema, OnboardingWalletSchema, OnboardingCategorySchema } from '../lib/validations';

describe('Version 2.11.0 — Onboarding premier login', () => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  test('Validation Zod: OnboardingSchema accepte une configuration valide', () => {
    const validData = {
      wallets: [
        {
          name: 'Compte Courant',
          type: 'BANK' as const,
          color: '#2563EB',
          balance: 50000,
          isDefault: true,
        },
        {
          name: 'Porte-monnaie Cash',
          type: 'CASH' as const,
          color: '#059669',
          balance: 15000,
          isDefault: false,
        },
      ],
      categories: [
        { name: 'Salaire', kind: 'INCOME' as const, color: '#059669' },
        { name: 'Alimentation', kind: 'EXPENSE' as const, color: '#D97706' },
        { name: 'Transport', kind: 'EXPENSE' as const, color: '#2563EB' },
      ],
    };

    const res = OnboardingSchema.safeParse(validData);
    assert.ok(res.success, 'La configuration valide doit être acceptée');
  });

  test('Validation Zod: refuse les portefeuilles sans aucun compte principal', () => {
    const invalidData = {
      wallets: [
        {
          name: 'Compte A',
          type: 'BANK' as const,
          color: '#2563EB',
          balance: 0,
          isDefault: false,
        },
      ],
      categories: [
        { name: 'Salaire', kind: 'INCOME' as const, color: '#059669' },
        { name: 'Courses', kind: 'EXPENSE' as const, color: '#D97706' },
      ],
    };

    const res = OnboardingSchema.safeParse(invalidData);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.ok(
        res.error.issues.some((i) => i.message.includes('compte principal')),
        'Doit exiger exactement un compte principal'
      );
    }
  });

  test('Validation Zod: refuse les noms de portefeuilles en doublon (insensible à la casse)', () => {
    const duplicateData = {
      wallets: [
        {
          name: 'Cash',
          type: 'CASH' as const,
          color: '#2563EB',
          balance: 0,
          isDefault: true,
        },
        {
          name: 'cash',
          type: 'CASH' as const,
          color: '#059669',
          balance: 0,
          isDefault: false,
        },
      ],
      categories: [
        { name: 'Salaire', kind: 'INCOME' as const, color: '#059669' },
        { name: 'Courses', kind: 'EXPENSE' as const, color: '#D97706' },
      ],
    };

    const res = OnboardingSchema.safeParse(duplicateData);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.ok(
        res.error.issues.some((i) => i.message.includes('déjà utilisé')),
        'Doit refuser les noms de compte dupliqués'
      );
    }
  });

  test('Validation Zod: refuse les couleurs de portefeuilles en doublon', () => {
    const duplicateColorData = {
      wallets: [
        {
          name: 'Compte 1',
          type: 'BANK' as const,
          color: '#2563EB',
          balance: 0,
          isDefault: true,
        },
        {
          name: 'Compte 2',
          type: 'SAVINGS' as const,
          color: '#2563EB',
          balance: 0,
          isDefault: false,
        },
      ],
      categories: [
        { name: 'Salaire', kind: 'INCOME' as const, color: '#059669' },
        { name: 'Courses', kind: 'EXPENSE' as const, color: '#D97706' },
      ],
    };

    const res = OnboardingSchema.safeParse(duplicateColorData);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.ok(
        res.error.issues.some((i) => i.message.includes('attribuée')),
        'Doit refuser les couleurs de compte dupliquées'
      );
    }
  });

  test('Validation Zod: refuse les montants de solde négatifs', () => {
    const res = OnboardingWalletSchema.safeParse({
      name: 'Compte',
      type: 'BANK',
      color: '#2563EB',
      balance: -500,
      isDefault: true,
    });
    assert.strictEqual(res.success, false, 'Le solde initial ne peut pas être strictement négatif');
  });

  test('Composants & Fichiers: ZÉRO emoji dans les fichiers v2.11.0', () => {
    const filesToCheck = [
      'components/onboarding/OnboardingStepper.tsx',
      'app/bienvenue/page.tsx',
      'lib/onboarding.ts',
      'actions/onboarding.ts',
      'supabase/migrations/20261021000000_user_profiles_onboarding.sql',
    ];

    for (const relPath of filesToCheck) {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Le fichier ${relPath} doit exister`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.strictEqual(
        emojiRegex.test(content),
        false,
        `Aucun emoji détecté dans ${relPath}`
      );
    }
  });

  test('Migration SQL: vérification de la structure user_profiles et des RLS', () => {
    const migPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20261021000000_user_profiles_onboarding.sql'
    );
    const sql = fs.readFileSync(migPath, 'utf8');

    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.user_profiles'), 'Création de la table');
    assert.ok(sql.includes('onboarding_completed_at'), 'Colonne onboarding_completed_at');
    assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'RLS activée');
    assert.ok(sql.includes('ON CONFLICT (user_id) DO NOTHING'), 'Backfill idempotent des utilisateurs existants');
  });
});
