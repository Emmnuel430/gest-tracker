import { describe, it, expect } from 'vitest';
import { TransactionSchema } from '@/lib/validations';

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
    expect(result.success).toBe(true);
  });

  it('rejette un montant négatif ou nul', () => {
    const invalidDataZero = {
      type: 'EXPENSE',
      amount: 0,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const resultZero = TransactionSchema.safeParse(invalidDataZero);
    expect(resultZero.success).toBe(false);

    const invalidDataNeg = {
      type: 'EXPENSE',
      amount: -1500,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const resultNeg = TransactionSchema.safeParse(invalidDataNeg);
    expect(resultNeg.success).toBe(false);
  });

  it('rejette un type de transaction invalide', () => {
    const invalidType = {
      type: 'VIREMENT',
      amount: 10000,
      category: 'Alimentation',
      payment: 'Wave',
    };

    const result = TransactionSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
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
    expect(result.success).toBe(false);
  });
});
