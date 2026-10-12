'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { DebtSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';

export interface DebtItem {
  id: string;
  personName: string;
  type: 'LENT' | 'BORROWED';
  initialAmount: number;
  remainingAmount: number;
  dueDate?: string | null;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
  note?: string | null;
  createdAt: string;
}

export interface DebtsSummary {
  totalLentPending: number; // Argent qu'on me doit
  totalBorrowedPending: number; // Argent que je dois
  netDebtPosition: number; // totalLentPending - totalBorrowedPending
  debts: DebtItem[];
}

/**
 * Récupère toutes les dettes et créances de l'utilisateur avec la synthèse financière
 */
export async function getDebtsAction(): Promise<ActionResponse<DebtsSummary>> {
  try {
    const user = await getAuthenticatedUser();

    if (!prisma?.debt?.findMany) {
      return {
        success: true,
        data: {
          totalLentPending: 0,
          totalBorrowedPending: 0,
          netDebtPosition: 0,
          debts: [],
        },
      };
    }

    const debts = await prisma.debt.findMany({
      where: { userId: user.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    let totalLentPending = 0;
    let totalBorrowedPending = 0;

    const items: DebtItem[] = debts.map((d) => {
      const initial = Number(d.initialAmount);
      const remaining = Number(d.remainingAmount);

      if (d.status !== 'SETTLED') {
        if (d.type === 'LENT') {
          totalLentPending += remaining;
        } else {
          totalBorrowedPending += remaining;
        }
      }

      return {
        id: d.id,
        personName: d.personName,
        type: d.type,
        initialAmount: initial,
        remainingAmount: remaining,
        dueDate: d.dueDate ? d.dueDate.toISOString().split('T')[0] : null,
        status: d.status,
        note: d.note,
        createdAt: d.createdAt.toISOString(),
      };
    });

    return {
      success: true,
      data: {
        totalLentPending,
        totalBorrowedPending,
        netDebtPosition: totalLentPending - totalBorrowedPending,
        debts: items,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getDebtsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de récupérer les dettes et créances',
    };
  }
}

/**
 * Enregistre une nouvelle dette ou créance
 */
export async function createDebtAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = DebtSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données invalides',
      };
    }

    const { personName, type, initialAmount, dueDate, note } = parseResult.data;

    const newDebt = await prisma.debt.create({
      data: {
        userId: user.id,
        personName: personName.trim(),
        type,
        initialAmount,
        remainingAmount: initialAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
        note: note ? note.trim() : null,
      },
    });

    revalidatePath('/dettes');
    revalidatePath('/');

    const label = type === 'LENT' ? 'Prêt à' : 'Dette envers';
    return {
      success: true,
      data: { id: newDebt.id },
      message: `${label} ${personName} enregistré (${initialAmount.toLocaleString('fr-FR')} FCFA)`,
    };
  } catch (error: unknown) {
    console.error('Erreur createDebtAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’enregistrer l’opération',
    };
  }
}

/**
 * Enregistre un remboursement (partiel ou total)
 */
export async function recordDebtRepaymentAction(
  debtId: string,
  repaymentAmount: number
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    if (!repaymentAmount || repaymentAmount <= 0) {
      return { success: false, error: 'Le montant remboursé doit être supérieur à 0' };
    }

    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: user.id },
    });

    if (!debt) {
      return { success: false, error: 'Dossier introuvable' };
    }

    const currentRemaining = Number(debt.remainingAmount);
    const newRemaining = Math.max(0, currentRemaining - repaymentAmount);

    let newStatus: 'PENDING' | 'PARTIAL' | 'SETTLED' = 'PARTIAL';
    if (newRemaining <= 0) {
      newStatus = 'SETTLED';
    } else if (newRemaining === Number(debt.initialAmount)) {
      newStatus = 'PENDING';
    }

    await prisma.debt.update({
      where: { id: debtId },
      data: {
        remainingAmount: newRemaining,
        status: newStatus,
      },
    });

    revalidatePath('/dettes');
    revalidatePath('/');

    return {
      success: true,
      data: { debtId, remainingAmount: newRemaining, status: newStatus },
      message:
        newStatus === 'SETTLED'
          ? `Dette avec ${debt.personName} entièrement soldée !`
          : `Remboursement de ${repaymentAmount.toLocaleString('fr-FR')} FCFA enregistré (reste: ${newRemaining.toLocaleString('fr-FR')} FCFA)`,
    };
  } catch (error: unknown) {
    console.error('Erreur recordDebtRepaymentAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors du remboursement',
    };
  }
}

/**
 * Supprime une dette
 */
export async function deleteDebtAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const res = await prisma.debt.deleteMany({
      where: { id, userId: user.id },
    });

    if (res.count === 0) {
      return { success: false, error: 'Dossier introuvable' };
    }

    revalidatePath('/dettes');

    return {
      success: true,
      data: { id },
      message: 'Dossier supprimé avec succès',
    };
  } catch (error: unknown) {
    console.error('Erreur deleteDebtAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de supprimer',
    };
  }
}
