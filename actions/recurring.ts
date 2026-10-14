'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { RecurringRuleSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';
import { resolveDueDate } from '@/lib/recurring';

export interface RecurringRuleItem {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  category: string;
  payment: string;
  dayOfMonth: number;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  note?: string | null;
  isActive: boolean;
  lastProcessedMonth?: string | null;
  createdAt: string;
}

/**
 * Récupère toutes les règles récurrentes de l'utilisateur
 */
export async function getRecurringRulesAction(): Promise<ActionResponse<RecurringRuleItem[]>> {
  try {
    const user = await getAuthenticatedUser();

    if (!prisma?.recurringRule?.findMany) {
      return { success: true, data: [] };
    }

    const rules = await prisma.recurringRule.findMany({
      where: { userId: user.id },
      orderBy: { dayOfMonth: 'asc' },
    });

    return {
      success: true,
      data: rules.map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        category: r.category,
        payment: r.payment,
        dayOfMonth: r.dayOfMonth,
        frequency: r.frequency,
        note: r.note,
        isActive: r.isActive,
        lastProcessedMonth: r.lastProcessedMonth,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (error: unknown) {
    console.error('Erreur getRecurringRulesAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de récupérer les règles récurrentes',
    };
  }
}

/**
 * Enregistre ou met à jour une règle récurrente
 */
export async function upsertRecurringRuleAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = RecurringRuleSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données invalides',
      };
    }

    const { id, type, amount, category, payment, dayOfMonth, frequency, note, isActive } = parseResult.data;

    let savedRule;
    if (id) {
      // Modification
      savedRule = await prisma.recurringRule.update({
        where: { id, userId: user.id },
        data: {
          type,
          amount,
          category,
          payment,
          dayOfMonth,
          frequency,
          note: note || null,
          isActive: isActive ?? true,
        },
      });
    } else {
      // Création
      savedRule = await prisma.recurringRule.create({
        data: {
          userId: user.id,
          type,
          amount,
          category,
          payment,
          dayOfMonth,
          frequency,
          note: note || null,
          isActive: isActive ?? true,
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/recurrences');
    revalidatePath('/budgets');

    return {
      success: true,
      data: { id: savedRule.id },
      message: `Règle récurrente pour ${category} enregistrée`,
    };
  } catch (error: unknown) {
    console.error('Erreur upsertRecurringRuleAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’enregistrer la règle',
    };
  }
}

/**
 * Bascule l'état actif/inactif d'une règle récurrente
 */
export async function toggleRecurringRuleStatusAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const rule = await prisma.recurringRule.findFirst({
      where: { id, userId: user.id },
    });

    if (!rule) {
      return { success: false, error: 'Règle introuvable' };
    }

    const updated = await prisma.recurringRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });

    revalidatePath('/');
    revalidatePath('/recurrences');

    return {
      success: true,
      data: { id: updated.id, isActive: updated.isActive },
      message: updated.isActive ? 'Règle activée' : 'Règle mise en pause',
    };
  } catch (error: unknown) {
    console.error('Erreur toggleRecurringRuleStatusAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de modifier le statut',
    };
  }
}

/**
 * Supprime une règle récurrente
 */
export async function deleteRecurringRuleAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const result = await prisma.recurringRule.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return { success: false, error: 'Règle introuvable ou non autorisée' };
    }

    revalidatePath('/');
    revalidatePath('/recurrences');

    return {
      success: true,
      data: { id },
      message: 'Règle récurrente supprimée',
    };
  } catch (error: unknown) {
    console.error('Erreur deleteRecurringRuleAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la suppression',
    };
  }
}

/**
 * Récupère les règles récurrentes actives en attente de validation pour le mois en cours
 */
export async function getDueRecurringRulesAction(): Promise<ActionResponse<RecurringRuleItem[]>> {
  try {
    const user = await getAuthenticatedUser();

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Sécurité défensive : si le modèle prisma n'est pas encore instancié
    if (!prisma?.recurringRule?.findMany) {
      return { success: true, data: [] };
    }

    // On cherche les règles actives qui n'ont pas encore été traitées (validées ou ignorées) ce mois-ci
    const dueRules = await prisma.recurringRule.findMany({
      where: {
        userId: user.id,
        isActive: true,
        OR: [
          { lastProcessedMonth: null },
          { lastProcessedMonth: { not: currentMonthStr } },
        ],
      },
      orderBy: { dayOfMonth: 'asc' },
    });

    return {
      success: true,
      data: dueRules.map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        category: r.category,
        payment: r.payment,
        dayOfMonth: r.dayOfMonth,
        frequency: r.frequency,
        note: r.note,
        isActive: r.isActive,
        lastProcessedMonth: r.lastProcessedMonth,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (error: unknown) {
    console.error('Erreur getDueRecurringRulesAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de récupérer les échéances dues',
    };
  }
}

/**
 * Valide (en créant la transaction réelle) ou ignore l'échéance d'une règle pour le mois en cours
 */
export async function processRecurringRuleAction(
  ruleId: string,
  mode: 'CONFIRM' | 'SKIP'
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const rule = await prisma.recurringRule.findFirst({
      where: { id: ruleId, userId: user.id },
    });

    if (!rule) {
      return { success: false, error: 'Règle récurrente introuvable' };
    }

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (mode === 'CONFIRM') {
      // Calcul déterministe de la date d'échéance avec clamp fin de mois
      const transactionDate = resolveDueDate(now.getFullYear(), now.getMonth(), rule.dayOfMonth);

      // Création de la transaction correspondante
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          payment: rule.payment,
          note: rule.note ? `${rule.note} [Échéance récurrente]` : 'Échéance récurrente confirmée',
          date: transactionDate,
        },
      });
    }

    // Marquage de la règle comme traitée pour ce mois
    await prisma.recurringRule.update({
      where: { id: rule.id },
      data: { lastProcessedMonth: currentMonthStr },
    });

    revalidatePath('/');
    revalidatePath('/historique');
    revalidatePath('/budgets');
    revalidatePath('/recurrences');

    return {
      success: true,
      data: { ruleId, mode },
      message:
        mode === 'CONFIRM'
          ? `Échéance "${rule.category}" confirmée et ajoutée aux transactions !`
          : `Échéance "${rule.category}" ignorée pour ce mois.`,
    };
  } catch (error: unknown) {
    console.error('Erreur processRecurringRuleAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors du traitement de l’échéance',
    };
  }
}
