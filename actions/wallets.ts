'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { WalletSchema, TransferSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';

import { getWalletBalancesForUser } from '@/lib/services/wallet-balances';

export interface WalletItem {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  initialBalance: number;
  currentBalance: number;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  totalIncome: number;
  totalExpense: number;
  totalTransferIn: number;
  totalTransferOut: number;
  createdAt: string;
}

export interface NetWorthSummary {
  netWorth: number;
  activeBalance: number;
  archivedBalance: number;
  unassignedBalance: number;
  walletCount: number;
}

/**
 * Récupère le patrimoine net total de l'utilisateur (somme de tous les portefeuilles, archivés inclus)
 */
export async function getNetWorthAction(): Promise<ActionResponse<NetWorthSummary>> {
  try {
    const user = await getAuthenticatedUser();
    const summary = await getWalletBalancesForUser(user.id);

    return {
      success: true,
      data: {
        netWorth: summary.netWorth,
        activeBalance: summary.activeBalance,
        archivedBalance: summary.archivedBalance,
        unassignedBalance: summary.unassignedBalance,
        walletCount: summary.walletCount,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getNetWorthAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer le patrimoine net',
    };
  }
}

/**
 * Récupère tous les portefeuilles de l'utilisateur avec leurs soldes calculés en temps réel
 */
export async function getWalletsAction(options?: {
  includeArchived?: boolean;
}): Promise<ActionResponse<WalletItem[]>> {
  try {
    const user = await getAuthenticatedUser();
    const summary = await getWalletBalancesForUser(user.id);

    const data = options?.includeArchived
      ? summary.wallets
      : summary.wallets.filter((w) => !w.isArchived);

    return {
      success: true,
      data,
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
 * Enregistre ou met à jour un portefeuille avec propagation atomique du nom
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

    const { id, name, type, initialBalance, color, isDefault, isArchived } = parseResult.data;

    // Contrôle d'unicité de la couleur par utilisateur (insensible à la casse)
    const duplicateColor = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        color: { equals: color, mode: 'insensitive' },
        ...(id ? { id: { not: id } } : {}),
      },
    });

    if (duplicateColor) {
      return {
        success: false,
        error: `Cette couleur est déjà attribuée au portefeuille "${duplicateColor.name}". Veuillez choisir une autre couleur.`,
      };
    }

    if (isDefault) {
      // Déchoir les autres portefeuilles du statut par défaut
      await prisma.wallet.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    let saved;
    if (id) {
      const existing = await prisma.wallet.findFirst({
        where: { id, userId: user.id },
      });

      if (!existing) {
        return { success: false, error: 'Portefeuille introuvable' };
      }

      // Si le nom a changé, propager atomiquement le nouveau libellé vers transactions et récurrences
      if (existing.name !== name) {
        const [updatedWallet] = await prisma.$transaction([
          prisma.wallet.update({
            where: { id },
            data: {
              name,
              type,
              initialBalance,
              color,
              isDefault,
              isArchived: isArchived ?? existing.isArchived,
            },
          }),
          prisma.transaction.updateMany({
            where: { userId: user.id, walletId: id },
            data: { payment: name },
          }),
          prisma.recurringRule.updateMany({
            where: { userId: user.id, walletId: id },
            data: { payment: name },
          }),
        ]);
        saved = updatedWallet;
      } else {
        saved = await prisma.wallet.update({
          where: { id },
          data: {
            name,
            type,
            initialBalance,
            color,
            isDefault,
            isArchived: isArchived ?? existing.isArchived,
          },
        });
      }
    } else {
      saved = await prisma.wallet.create({
        data: {
          userId: user.id,
          name,
          type,
          initialBalance,
          color,
          isDefault,
          isArchived: isArchived ?? false,
        },
      });
    }

    revalidatePath('/portefeuilles');
    revalidatePath('/');
    revalidatePath('/historique');

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
 * Archive ou désarchive un portefeuille
 */
export async function archiveWalletAction(
  id: string,
  isArchived: boolean
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id },
    });

    if (!wallet) {
      return { success: false, error: 'Portefeuille introuvable' };
    }

    if (isArchived && wallet.isDefault) {
      return {
        success: false,
        error: 'Impossible d’archiver le portefeuille par défaut. Veuillez d’abord désigner un autre compte par défaut.',
      };
    }

    await prisma.wallet.update({
      where: { id },
      data: { isArchived },
    });

    revalidatePath('/portefeuilles');
    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id, isArchived },
      message: isArchived ? 'Portefeuille archivé' : 'Portefeuille réactivé',
    };
  } catch (error: unknown) {
    console.error('Erreur archiveWalletAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de l’archivage',
    };
  }
}

/**
 * Supprime un portefeuille s'il n'est relié à aucune opération (recommande l'archivage sinon)
 */
export async function deleteWalletAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id },
    });

    if (!wallet) {
      return { success: false, error: 'Portefeuille introuvable' };
    }

    // Contrôle strict : vérifier si le portefeuille a des transactions ou des récurrences liées
    const txCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        OR: [{ walletId: id }, { targetWalletId: id }],
      },
    });

    const rulesCount = await prisma.recurringRule.count({
      where: {
        userId: user.id,
        walletId: id,
      },
    });

    if (txCount > 0 || rulesCount > 0) {
      return {
        success: false,
        error:
          'Ce portefeuille contient des transactions ou règles enregistrées. Pour préserver l’intégrité de vos comptes, vous pouvez l’archiver au lieu de le supprimer.',
      };
    }

    await prisma.wallet.delete({
      where: { id },
    });

    revalidatePath('/portefeuilles');
    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id },
      message: 'Portefeuille supprimé avec succès',
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
