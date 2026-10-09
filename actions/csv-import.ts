'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { ActionResponse } from '@/types/transaction';
import { TransactionSchema } from '@/lib/validations';

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

    const toInsert: {
      userId: string;
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      category: string;
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
  } catch (error: any) {
    console.error('Erreur importTransactionsFromCsvAction :', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de l’importation du fichier CSV',
    };
  }
}
