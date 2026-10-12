'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { WalletSchema, TransferSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';

export interface WalletItem {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  initialBalance: number;
  currentBalance: number;
  color: string;
  isDefault: boolean;
  totalIncome: number;
  totalExpense: number;
  totalTransferIn: number;
  totalTransferOut: number;
  createdAt: string;
}

/**
 * Récupère tous les portefeuilles de l'utilisateur avec leurs soldes calculés en temps réel
 */
export async function getWalletsAction(): Promise<ActionResponse<WalletItem[]>> {
  try {
    const user = await getAuthenticatedUser();

    if (!prisma?.wallet?.findMany) {
      return { success: true, data: [] };
    }

    let wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    // Initialisation automatique de portefeuilles par défaut pour les nouveaux utilisateurs
    if (wallets.length === 0) {
      await prisma.wallet.createMany({
        data: [
          {
            userId: user.id,
            name: 'Espèces',
            type: 'CASH',
            initialBalance: 0,
            color: '#52B788',
            isDefault: true,
          },
          {
            userId: user.id,
            name: 'Wave',
            type: 'MOBILE_MONEY',
            initialBalance: 0,
            color: '#1DC4F2',
            isDefault: false,
          },
          {
            userId: user.id,
            name: 'Compte bancaire',
            type: 'BANK',
            initialBalance: 0,
            color: '#B8C0FF',
            isDefault: false,
          },
        ],
      });

      wallets = await prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      });
    }

    // Récupération de toutes les transactions de l'utilisateur pour calculer les soldes de chaque compte
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: {
        amount: true,
        type: true,
        walletId: true,
        targetWalletId: true,
      },
    });

    const result: WalletItem[] = wallets.map((w) => {
      const initial = Number(w.initialBalance);
      let income = 0;
      let expense = 0;
      let transferIn = 0;
      let transferOut = 0;

      for (const t of transactions) {
        const amt = Number(t.amount);
        if (t.walletId === w.id) {
          if (t.type === 'INCOME') income += amt;
          else if (t.type === 'EXPENSE') expense += amt;
          else if (t.type === 'TRANSFER') transferOut += amt;
        }
        if (t.targetWalletId === w.id && t.type === 'TRANSFER') {
          transferIn += amt;
        }
      }

      const currentBalance = initial + income - expense + transferIn - transferOut;

      return {
        id: w.id,
        name: w.name,
        type: w.type,
        initialBalance: initial,
        currentBalance,
        color: w.color,
        isDefault: w.isDefault,
        totalIncome: income,
        totalExpense: expense,
        totalTransferIn: transferIn,
        totalTransferOut: transferOut,
        createdAt: w.createdAt.toISOString(),
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error('Erreur getWalletsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger les portefeuilles',
    };
  }
}

/**
 * Enregistre ou met à jour un portefeuille
 */
export async function upsertWalletAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = WalletSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données de portefeuille invalides',
      };
    }

    const { id, name, type, initialBalance, color, isDefault } = parseResult.data;

    if (isDefault) {
      // Déchoir les autres portefeuilles du statut par défaut
      await prisma.wallet.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    let saved;
    if (id) {
      saved = await prisma.wallet.update({
        where: { id, userId: user.id },
        data: {
          name,
          type,
          initialBalance,
          color,
          isDefault,
        },
      });
    } else {
      saved = await prisma.wallet.create({
        data: {
          userId: user.id,
          name,
          type,
          initialBalance,
          color,
          isDefault,
        },
      });
    }

    revalidatePath('/portefeuilles');
    revalidatePath('/');

    return {
      success: true,
      data: { id: saved.id },
      message: `Portefeuille "${name}" enregistré`,
    };
  } catch (error: unknown) {
    console.error('Erreur upsertWalletAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’enregistrer le portefeuille',
    };
  }
}

/**
 * Supprime un portefeuille (déliaison non destructive des transactions)
 */
export async function deleteWalletAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    // Délier les transactions pour préserver l'historique comptable
    await prisma.transaction.updateMany({
      where: { walletId: id, userId: user.id },
      data: { walletId: null },
    });

    await prisma.transaction.updateMany({
      where: { targetWalletId: id, userId: user.id },
      data: { targetWalletId: null },
    });

    const res = await prisma.wallet.deleteMany({
      where: { id, userId: user.id },
    });

    if (res.count === 0) {
      return { success: false, error: 'Portefeuille introuvable' };
    }

    revalidatePath('/portefeuilles');
    revalidatePath('/');

    return {
      success: true,
      data: { id },
      message: 'Portefeuille supprimé',
    };
  } catch (error: unknown) {
    console.error('Erreur deleteWalletAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la suppression',
    };
  }
}

/**
 * Effectue un virement interne entre deux portefeuilles (Sprint 19)
 */
export async function transferBetweenWalletsAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = TransferSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données de virement invalides',
      };
    }

    const { sourceWalletId, targetWalletId, amount, note, date } = parseResult.data;

    // Récupérer les noms des deux portefeuilles
    const [source, target] = await Promise.all([
      prisma.wallet.findFirst({ where: { id: sourceWalletId, userId: user.id } }),
      prisma.wallet.findFirst({ where: { id: targetWalletId, userId: user.id } }),
    ]);

    if (!source || !target) {
      return { success: false, error: 'Un des portefeuilles sélectionnés est introuvable' };
    }

    const txDate = date ? new Date(date) : new Date();

    const transferTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'TRANSFER',
        amount,
        category: 'Virement interne',
        payment: `${source.name} -> ${target.name}`,
        walletId: sourceWalletId,
        targetWalletId: targetWalletId,
        note: note || `Transfert de ${source.name} vers ${target.name}`,
        date: txDate,
      },
    });

    revalidatePath('/portefeuilles');
    revalidatePath('/historique');
    revalidatePath('/');

    return {
      success: true,
      data: { id: transferTx.id },
      message: `Virement de ${amount.toLocaleString('fr-FR')} FCFA effectué avec succès`,
    };
  } catch (error: unknown) {
    console.error('Erreur transferBetweenWalletsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’effectuer le virement',
    };
  }
}
