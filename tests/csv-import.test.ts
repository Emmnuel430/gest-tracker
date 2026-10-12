import test from 'node:test';
import assert from 'node:assert/strict';

test('CSV Import Duplicate Detection Logic (Sprint 20)', async (t) => {
  interface TransactionMock {
    date: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
  }

  const detectDuplicates = (
    existing: TransactionMock[],
    incoming: { date: string; type: string; amount: number; category: string }[]
  ) => {
    const existingSignatures = new Set(
      existing.map((tx) => `${tx.date}_${tx.type}_${tx.amount}_${tx.category.toLowerCase().trim()}`)
    );

    let imported = 0;
    let duplicates = 0;

    for (const row of incoming) {
      const type = row.type.toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';
      const sig = `${row.date}_${type}_${row.amount}_${row.category.toLowerCase().trim()}`;
      if (existingSignatures.has(sig)) {
        duplicates++;
      } else {
        existingSignatures.add(sig);
        imported++;
      }
    }

    return { imported, duplicates };
  };

  await t.test('ignore fidèlement les doublons déjà présents en base de données', () => {
    const existing: TransactionMock[] = [
      { date: '2026-10-05', type: 'EXPENSE', amount: 15000, category: 'Alimentation' },
      { date: '2026-10-06', type: 'INCOME', amount: 200000, category: 'Freelance' },
    ];

    const incoming = [
      { date: '2026-10-05', type: 'EXPENSE', amount: 15000, category: 'Alimentation' }, // DOUBLON
      { date: '2026-10-07', type: 'EXPENSE', amount: 5000, category: 'Transport' }, // NOUVEAU
      { date: '2026-10-08', type: 'EXPENSE', amount: 3500, category: 'Loisirs' }, // NOUVEAU
    ];

    const res = detectDuplicates(existing, incoming);
    assert.strictEqual(res.imported, 2);
    assert.strictEqual(res.duplicates, 1);
  });

  await t.test('détecte également les doublons dupliqués au sein du même fichier CSV', () => {
    const existing: TransactionMock[] = [];
    const incoming = [
      { date: '2026-10-09', type: 'EXPENSE', amount: 25000, category: 'Santé' },
      { date: '2026-10-09', type: 'EXPENSE', amount: 25000, category: 'Santé' }, // Répété dans le CSV
    ];

    const res = detectDuplicates(existing, incoming);
    assert.strictEqual(res.imported, 1);
    assert.strictEqual(res.duplicates, 1);
  });
});
