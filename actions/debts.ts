'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { DebtSchema, UpdateDebtSchema, DebtRepaymentSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';
import {
  resolveDebtCreationTransactionType,
  resolveDebtRepaymentTransactionType,
  validateAndComputeRepayment,
  validateAndComputeDebtUpdate,
} from '@/lib/debts';

export interface DebtRepaymentItem {
  id: string;
  debtId: string;
  amount: number;
  paidAt: string;
  walletId?: string | null;
  walletName?: string | null;
  transactionId?: string | null;
  note?: string | null;
}

export interface DebtItem {
  id: string;
  personName: string;
  type: 'LENT' | 'BORROWED';
  initialAmount: number;
  remainingAmount: number;
  dueDate?: string | null;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
  note?: string | null;
  walletId?: string | null;
  walletName?: string | null;
  transactionId?: string | null;
  createdAt: string;
  repayments: DebtRepaymentItem[];
}

export interface DebtsSummary {
  totalLentPending: number; // Argent qu'on me doit
  totalBorrowedPending: number; // Argent que je dois
  netDebtPosition: number; // totalLentPending - totalBorrowedPending
  debts: DebtItem[];
}

function revalidateAllDebtPaths() {
  revalidatePath('/dettes');
  revalidatePath('/gestion');
  revalidatePath('/portefeuilles');
  revalidatePath('/historique');
  revalidatePath('/');
  revalidatePath('/app');
}

/**
 * Récupère toutes les dettes et créances de l'utilisateur avec l'historique des remboursements et la synthèse financière
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
      include: {
        wallet: {
          select: { id: true, name: true },
        },
        repayments: {
          orderBy: { paidAt: 'desc' },
          include: {
            wallet: {
              select: { id: true, name: true },
            },
          },
        },
      },
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

      const rawRepayments = Array.isArray(d.repayments) ? d.repayments : [];
      const repayments: DebtRepaymentItem[] = rawRepayments.map((r) => ({
        id: r.id,
        debtId: r.debtId,
        amount: Number(r.amount),
        paidAt: r.paidAt instanceof Date ? r.paidAt.toISOString() : String(r.paidAt),
        walletId: r.walletId ?? null,
        walletName: r.wallet?.name ?? null,
        transactionId: r.transactionId ?? null,
        note: r.note ?? null,
      }));

      return {
        id: d.id,
        personName: d.personName,
        type: d.type,
        initialAmount: initial,
        remainingAmount: remaining,
        dueDate: d.dueDate ? d.dueDate.toISOString().split('T')[0] : null,
        status: d.status,
        note: d.note,
        walletId: d.walletId ?? null,
        walletName: d.wallet?.name ?? null,
        transactionId: d.transactionId ?? null,
        createdAt: d.createdAt.toISOString(),
        repayments,
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
 * Enregistre une nouvelle dette ou créance avec pont comptable optionnel vers un portefeuille ([DEBT-01])
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

    const { personName, type, initialAmount, dueDate, note, walletId } = parseResult.data;
    const cleanPersonName = personName.trim();
    const cleanNote = note ? note.trim() : null;
    const decimalInitial = new Prisma.Decimal(initialAmount);
    const resolvedWalletId = walletId && walletId.trim() !== '' ? walletId.trim() : null;

    let verifiedWallet: { id: string; name: string } | null = null;
    if (resolvedWalletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: resolvedWalletId, userId: user.id },
        select: { id: true, name: true, isArchived: true },
      });
      if (!wallet || wallet.isArchived) {
        return {
          success: false,
          error: 'Portefeuille sélectionné introuvable ou archivé',
        };
      }
      verifiedWallet = { id: wallet.id, name: wallet.name };
    }

    const newDebt = await prisma.$transaction(async (tx) => {
      let linkedTransactionId: string | null = null;

      if (verifiedWallet) {
        const txType = resolveDebtCreationTransactionType(type);
        const txCategory = type === 'LENT' ? 'Prêt accordé' : 'Emprunt reçu';
        const txNotePrefix =
          type === 'LENT'
            ? `Prêt accordé à ${cleanPersonName}`
            : `Emprunt reçu de ${cleanPersonName}`;
        const txNote = cleanNote ? `${txNotePrefix} — ${cleanNote}`.slice(0, 250) : txNotePrefix;

        const createdTx = await tx.transaction.create({
          data: {
            userId: user.id,
            type: txType,
            amount: decimalInitial,
            category: txCategory,
            payment: verifiedWallet.name,
            walletId: verifiedWallet.id,
            note: txNote,
          },
        });
        linkedTransactionId = createdTx.id;
      }

      return tx.debt.create({
        data: {
          userId: user.id,
          personName: cleanPersonName,
          type,
          initialAmount: decimalInitial,
          remainingAmount: decimalInitial,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'PENDING',
          note: cleanNote,
          walletId: verifiedWallet ? verifiedWallet.id : null,
          transactionId: linkedTransactionId,
        },
      });
    });

    revalidateAllDebtPaths();

    const label = type === 'LENT' ? 'Prêt à' : 'Dette envers';
    return {
      success: true,
      data: { id: newDebt.id },
      message: `${label} ${cleanPersonName} enregistré (${initialAmount.toLocaleString('fr-FR')} FCFA)`,
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
 * Modifie les informations d'un dossier existant et recalcule le reste dû et le statut ([DEBT-03])
 */
export async function updateDebtAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = UpdateDebtSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données de modification invalides',
      };
    }

    const { id, personName, type, initialAmount, dueDate, note } = parseResult.data;

    const existingDebt = await prisma.debt.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingDebt) {
      return {
        success: false,
        error: 'Dossier introuvable ou accès non autorisé',
      };
    }

    const validation = validateAndComputeDebtUpdate({
      oldInitialAmount: Number(existingDebt.initialAmount),
      oldRemainingAmount: Number(existingDebt.remainingAmount),
      newInitialAmount: initialAmount,
    });

    if (!validation.valid || validation.newRemaining === undefined || !validation.newStatus) {
      return {
        success: false,
        error: validation.error || 'Modification du montant invalide',
      };
    }

    const cleanPersonName = personName.trim();
    const cleanNote = note ? note.trim() : null;

    await prisma.debt.update({
      where: { id: existingDebt.id },
      data: {
        personName: cleanPersonName,
        type,
        initialAmount: new Prisma.Decimal(initialAmount),
        remainingAmount: new Prisma.Decimal(validation.newRemaining),
        status: validation.newStatus,
        dueDate: dueDate ? new Date(dueDate) : null,
        note: cleanNote,
      },
    });

    revalidateAllDebtPaths();

    return {
      success: true,
      data: {
        id: existingDebt.id,
        remainingAmount: validation.newRemaining,
        status: validation.newStatus,
      },
      message: `Dossier de ${cleanPersonName} mis à jour avec succès`,
    };
  } catch (error: unknown) {
    console.error('Erreur updateDebtAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de modifier ce dossier',
    };
  }
}

/**
 * Enregistre un remboursement (partiel ou total) avec validation stricte, historique et impact portefeuille optionnel ([DEBT-01], [DEBT-02], [DEBT-03])
 */
export async function recordDebtRepaymentAction(
  debtId: string,
  repaymentAmount: number,
  options?: { walletId?: string | null; note?: string | null }
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const parseResult = DebtRepaymentSchema.safeParse({
      debtId,
      amount: repaymentAmount,
      walletId: options?.walletId ?? null,
      note: options?.note ?? null,
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Montant de remboursement invalide',
      };
    }

    const { amount, walletId, note } = parseResult.data;

    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: user.id },
    });

    if (!debt) {
      return { success: false, error: 'Dossier introuvable' };
    }

    const currentRemaining = Number(debt.remainingAmount);
    const validation = validateAndComputeRepayment({
      initialAmount: Number(debt.initialAmount),
      currentRemaining,
      status: debt.status,
      repaymentAmount: amount,
    });

    if (!validation.valid || validation.newRemaining === undefined || !validation.newStatus) {
      return {
        success: false,
        error: validation.error || 'Remboursement invalide',
      };
    }

    const newRemaining = validation.newRemaining;
    const newStatus = validation.newStatus;
    const cleanNote = note ? note.trim() : null;
    const resolvedWalletId = walletId && walletId.trim() !== '' ? walletId.trim() : null;

    let verifiedWallet: { id: string; name: string } | null = null;
    if (resolvedWalletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: resolvedWalletId, userId: user.id },
        select: { id: true, name: true, isArchived: true },
      });
      if (!wallet || wallet.isArchived) {
        return {
          success: false,
          error: 'Portefeuille sélectionné introuvable ou archivé',
        };
      }
      verifiedWallet = { id: wallet.id, name: wallet.name };
    }

    const decimalRepayment = new Prisma.Decimal(amount);
    const decimalNewRemaining = new Prisma.Decimal(newRemaining);

    await prisma.$transaction(async (tx) => {
      let linkedTransactionId: string | null = null;

      if (verifiedWallet) {
        const txType = resolveDebtRepaymentTransactionType(debt.type);
        const txCategory =
          debt.type === 'LENT' ? 'Remboursement reçu' : 'Remboursement dette';
        const txNotePrefix =
          debt.type === 'LENT'
            ? `Remboursement reçu de ${debt.personName}`
            : `Remboursement versé à ${debt.personName}`;
        const txNote = cleanNote ? `${txNotePrefix} — ${cleanNote}`.slice(0, 250) : txNotePrefix;

        const createdTx = await tx.transaction.create({
          data: {
            userId: user.id,
            type: txType,
            amount: decimalRepayment,
            category: txCategory,
            payment: verifiedWallet.name,
            walletId: verifiedWallet.id,
            note: txNote,
          },
        });
        linkedTransactionId = createdTx.id;
      }

      await tx.debt.update({
        where: { id: debtId },
        data: {
          remainingAmount: decimalNewRemaining,
          status: newStatus,
        },
      });

      await tx.debtRepayment.create({
        data: {
          debtId: debt.id,
          userId: user.id,
          amount: decimalRepayment,
          walletId: verifiedWallet ? verifiedWallet.id : null,
          transactionId: linkedTransactionId,
          note: cleanNote,
        },
      });
    });

    revalidateAllDebtPaths();

    return {
      success: true,
      data: { debtId, remainingAmount: newRemaining, status: newStatus },
      message:
        newStatus === 'SETTLED'
          ? `Dossier avec ${debt.personName} entièrement soldé`
          : `Remboursement de ${amount.toLocaleString('fr-FR')} FCFA enregistré (reste: ${newRemaining.toLocaleString('fr-FR')} FCFA)`,
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

    revalidateAllDebtPaths();

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
