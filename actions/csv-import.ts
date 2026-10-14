'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { ActionResponse } from '@/types/transaction';
import { TransactionSchema } from '@/lib/validations';
import { getErrorMessage } from '@/lib/utils';

export interface CsvImportResult {
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  totalProcessed: number;
}

export interface RawCsvRow {
  date?: string;
  type?: string;
  amount?: string | number;
  category?: string;
  payment?: string;
  note?: string;
}

/**
 * Traite un lot de transactions issues d'un import CSV avec détection stricte des doublons
 */
export async function importTransactionsFromCsvAction(
  rows: RawCsvRow[]
): Promise<ActionResponse<CsvImportResult>> {
  try {
    const user = await getAuthenticatedUser();

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: 'Aucune donnée à importer' };
    }

    // Récupérer les transactions existantes de l'utilisateur pour vérifier les doublons
    const existingTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: {
        date: true,
        amount: true,
        category: true,
        type: true,
      },
    });

    // Récupérer les catégories existantes de l'utilisateur pour lier categoryId
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id },
    });
    const categoryMap = new Map<string, string>();
    for (const c of existingCategories) {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
    }

    // Création d'un ensemble de signatures uniques : "YYYY-MM-DD_TYPE_AMOUNT_CATEGORY"
    const existingSignatures = new Set(
      existingTransactions.map((tx) => {
        const dStr = tx.date.toISOString().split('T')[0];
        const amt = Number(tx.amount);
        return `${dStr}_${tx.type}_${amt}_${tx.category.toLowerCase().trim()}`;
      })
    );

    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    // Collecter les nouvelles catégories pour les créer avant l'insertion
    for (const row of rows) {
      const rawCat = (row.category || 'Autre').trim();
      const catKey = rawCat.toLowerCase();
      if (rawCat && !categoryMap.has(catKey)) {
        const rawType = (row.type || 'EXPENSE').toUpperCase().trim();
        const kind = rawType.includes('INCOME') || rawType.includes('ENTRANT') || rawType.includes('REVENU')
          ? 'INCOME'
          : 'EXPENSE';

        try {
          const newCat = await prisma.category.create({
            data: {
              userId: user.id,
              name: rawCat,
              kind,
              color: '#2563EB',
            },
          });
          categoryMap.set(catKey, newCat.id);
        } catch {
          // Si collision concurrente, récupérer la catégorie
          const found = await prisma.category.findFirst({
            where: { userId: user.id, name: rawCat },
          });
          if (found) categoryMap.set(catKey, found.id);
        }
      }
    }

    const toInsert: {
      userId: string;
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      category: string;
      categoryId: string | null;
      payment: string;
      note: string | null;
      date: Date;
    }[] = [];

    for (const row of rows) {
      // Nettoyage et normalisation du type
      const rawType = (row.type || 'EXPENSE').toUpperCase().trim();
      const type = rawType.includes('INCOME') || rawType.includes('ENTRANT') || rawType.includes('REVENU')
        ? 'INCOME'
        : 'EXPENSE';

      const numericAmount = typeof row.amount === 'number' ? row.amount : parseFloat(String(row.amount || '0').replace(/[^0-9.-]+/g, ''));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        invalidCount++;
        continue;
      }

      const category = (row.category || 'Autre').trim();
      const payment = (row.payment || 'Espèces').trim();
      const note = row.note ? row.note.trim() : null;
      const parsedDate = row.date ? new Date(row.date) : new Date();
      const dateValid = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
      const dStr = dateValid.toISOString().split('T')[0];

      const signature = `${dStr}_${type}_${numericAmount}_${category.toLowerCase()}`;

      if (existingSignatures.has(signature)) {
        duplicateCount++;
      } else {
        existingSignatures.add(signature); // Empêche les doublons internes au même fichier CSV
        toInsert.push({
          userId: user.id,
          type,
          amount: numericAmount,
          category,
          categoryId: categoryMap.get(category.toLowerCase()) || null,
          payment,
          note,
          date: dateValid,
        });
        importedCount++;
      }
    }

    if (toInsert.length > 0) {
      await prisma.transaction.createMany({
        data: toInsert,
      });

      revalidatePath('/');
      revalidatePath('/historique');
      revalidatePath('/budgets');
      revalidatePath('/portefeuilles');
    }

    return {
      success: true,
      data: {
        importedCount,
        duplicateCount,
        invalidCount,
        totalProcessed: rows.length,
      },
      message: `${importedCount} transaction(s) importée(s) avec succès (${duplicateCount} doublon(s) ignoré(s))`,
    };
  } catch (error: unknown) {
    console.error('Erreur importTransactionsFromCsvAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de l’importation du fichier CSV',
    };
  }
}
