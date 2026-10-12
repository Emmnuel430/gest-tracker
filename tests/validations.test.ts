import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TransactionSchema, RegisterSchema, LoginSchema } from '../lib/validations';

describe('TransactionSchema (Zod)', () => {
  it('valide une transaction conforme', () => {
    const validData = {
      type: 'EXPENSE',
      amount: 5000,
      category: 'Alimentation',
      payment: 'Wave',
      date: new Date(),
      note: 'Déjeuner',
    };

    const result = TransactionSchema.safeParse(validData);
    assert.equal(result.success, true);
  });

  it('rejette un montant négatif ou nul', () => {
    const invalidDataZero = {
      type: 'EXPENSE',
      amount: 0,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const resultZero = TransactionSchema.safeParse(invalidDataZero);
    assert.equal(resultZero.success, false);

    const invalidDataNeg = {
      type: 'EXPENSE',
      amount: -1500,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const resultNeg = TransactionSchema.safeParse(invalidDataNeg);
    assert.equal(resultNeg.success, false);
  });

  it('rejette un type de transaction invalide', () => {
    const invalidType = {
      type: 'VIREMENT',
      amount: 10000,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const result = TransactionSchema.safeParse(invalidType);
    assert.equal(result.success, false);
  });

  it('rejette une note dépassant 250 caractères', () => {
    const invalidNote = {
      type: 'EXPENSE',
      amount: 5000,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'a'.repeat(251),
    };

    const result = TransactionSchema.safeParse(invalidNote);
    assert.equal(result.success, false);
  });

  it('valide une transaction sans date spécifiée (mode instantané par défaut)', () => {
    const instantData = {
      type: 'EXPENSE',
      amount: 2500,
      category: 'Alimentation',
      payment: 'Wave',
      note: 'Achat rapide',
    };

    const result = TransactionSchema.safeParse(instantData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.date, undefined);
    }
  });

  it('valide une transaction avec date manuelle spécifique (mode rétroactif)', () => {
    const retroactiveData = {
      type: 'INCOME',
      amount: 150000,
      category: 'Salaire',
      payment: 'Compte bancaire',
      date: '2026-09-25T14:30:00',
    };

    const result = TransactionSchema.safeParse(retroactiveData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.ok(result.data.date instanceof Date);
      assert.equal(result.data.date.getFullYear(), 2026);
      assert.equal(result.data.date.getMonth(), 8); // Septembre (0-indexed)
      assert.equal(result.data.date.getDate(), 25);
    }
  });
});

describe('RegisterSchema & LoginSchema (Zod Auth V2)', () => {
  it('valide une inscription conforme', () => {
    const validRegister = {
      email: 'NOUVEAU.USER@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = RegisterSchema.safeParse(validRegister);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, 'nouveau.user@example.com'); // Normalisation en minuscules
    }
  });

  it('rejette une inscription avec mot de passe trop court (< 8 caractères)', () => {
    const shortPassword = {
      email: 'test@example.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
    };

    const result = RegisterSchema.safeParse(shortPassword);
    assert.equal(result.success, false);
  });

  it('rejette une inscription avec mot de passe sans chiffre', () => {
    const noNumber = {
      email: 'test@example.com',
      password: 'PasswordOnly',
      confirmPassword: 'PasswordOnly',
    };

    const result = RegisterSchema.safeParse(noNumber);
    assert.equal(result.success, false);
  });

  it('rejette une inscription si les mots de passe ne correspondent pas', () => {
    const mismatch = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'DifferentPassword456',
    };

    const result = RegisterSchema.safeParse(mismatch);
    assert.equal(result.success, false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      assert.ok(issue);
    }
  });

  it('rejette une inscription avec un format email invalide', () => {
    const invalidEmail = {
      email: 'email-invalide-sans-arobase',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = RegisterSchema.safeParse(invalidEmail);
    assert.equal(result.success, false);
  });

  it('valide une tentative de connexion correcte', () => {
    const validLogin = {
      email: 'User@Example.com ',
      password: 'SecretPassword',
    };

    const result = LoginSchema.safeParse(validLogin);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, 'user@example.com');
    }
  });
});
