'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';
import { WalletSchema, TransferSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';
import { computeTransferFee } from '@/lib/transfer-fees';
import { getWalletBalancesForUser } from '@/lib/services/wallet-balances';

export interface WalletItem {
  id: string;
  name: string;
  type: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS';
  initialBalance: number;
  declaredBalance?: number | null;
  declaredAt?: string | null;
  currentBalance: number;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  deletedAt?: string | null;
  isDeleted?: boolean;
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

export interface WalletDeletionImpact {
  id: string;
  walletName: string;
  currentBalance: number;
  transactionCount: number;
  activeRulesCount: number;
  isDefault: boolean;
}

export type WalletActionResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]>; code?: string; data?: unknown };

/**
 * Récupère le patrimoine net total de l'utilisateur (somme de tous les portefeuilles, archivés inclus, supprimés exclus)
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
  includeDeleted?: boolean;
}): Promise<ActionResponse<WalletItem[]>> {
  try {
    const user = await getAuthenticatedUser();
    const summary = await getWalletBalancesForUser(user.id, {
      includeDeleted: options?.includeDeleted,
    });

    let data = summary.wallets;
    if (!options?.includeDeleted) {
      data = data.filter((w) => !w.isDeleted);
    }
    if (!options?.includeArchived) {
      data = data.filter((w) => !w.isArchived);
    }

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
 * Calcule l'impact d'une suppression de portefeuille pour alimenter la modal de confirmation
 */
export async function getWalletDeletionImpactAction(
  id: string
): Promise<ActionResponse<WalletDeletionImpact>> {
  try {
    const user = await getAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!wallet) {
      return { success: false, error: 'Portefeuille introuvable' };
    }

    const [summary, txCount, activeRulesCount] = await Promise.all([
      getWalletBalancesForUser(user.id),
      prisma.transaction.count({
        where: {
          userId: user.id,
          OR: [{ walletId: id }, { targetWalletId: id }],
        },
      }),
      prisma.recurringRule.count({
        where: {
          userId: user.id,
          walletId: id,
          isActive: true,
        },
      }),
    ]);

    const calculated = summary.wallets.find((w) => w.id === id);
    const currentBalance = calculated?.currentBalance ?? 0;

    return {
      success: true,
      data: {
        id: wallet.id,
        walletName: wallet.name,
        currentBalance,
        transactionCount: txCount,
        activeRulesCount,
        isDefault: wallet.isDefault,
      },
    };
  } catch (error: unknown) {
    console.error('Erreur getWalletDeletionImpactAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de calculer l’impact de la suppression',
    };
  }
}

/**
 * Enregistre ou met à jour un portefeuille avec propagation atomique du nom et gestion du solde déclaré T0
 */
export async function upsertWalletAction(rawData: unknown): Promise<WalletActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    const parseResult = WalletSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données de portefeuille invalides',
      };
    }

    const {
      id,
      name,
      type,
      initialBalance,
      declaredBalance,
      adjustCurrentBalance,
      color,
      isDefault,
      isArchived,
    } = parseResult.data;

    // Contrôle d'unicité de la couleur par utilisateur parmi les portefeuilles actifs (insensible à la casse)
    const duplicateColor = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
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

    // Lors de la création, vérifier s'il existe déjà un compte supprimé portant le même nom
    if (!id) {
      const deletedMatch = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          deletedAt: { not: null },
          name: { equals: name.trim(), mode: 'insensitive' },
        },
      });

      if (deletedMatch) {
        const txCount = await prisma.transaction.count({
          where: {
            userId: user.id,
            OR: [{ walletId: deletedMatch.id }, { targetWalletId: deletedMatch.id }],
          },
        });

        return {
          success: false,
          code: 'DELETED_WALLET_MATCH',
          error: `Un compte "${deletedMatch.name}" supprimé contient ${txCount} opérations enregistrées.`,
          data: {
            id: deletedMatch.id,
            name: deletedMatch.name,
            deletedAt: deletedMatch.deletedAt ? deletedMatch.deletedAt.toISOString() : null,
            transactionCount: txCount,
          },
        };
      }
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
        where: { id, userId: user.id, deletedAt: null },
      });

      if (!existing) {
        return { success: false, error: 'Portefeuille introuvable' };
      }

      // Si l'utilisateur ajuste le solde actuel constaté
      let nextDeclaredBalance = existing.declaredBalance;
      let nextDeclaredAt = existing.declaredAt;

      if (adjustCurrentBalance && declaredBalance !== undefined && declaredBalance !== null) {
        nextDeclaredBalance = new Prisma.Decimal(declaredBalance);
        nextDeclaredAt = new Date();
      }

      const updateData = {
        name,
        type,
        declaredBalance: nextDeclaredBalance,
        declaredAt: nextDeclaredAt,
        color,
        isDefault,
        isArchived: isArchived ?? existing.isArchived,
      };

      // Si le nom a changé, propager atomiquement le nouveau libellé vers transactions et récurrences
      if (existing.name !== name) {
        const [updatedWallet] = await prisma.$transaction([
          prisma.wallet.update({
            where: { id },
            data: updateData,
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
          data: updateData,
        });
      }
    } else {
      const now = new Date();
      const initialAmt = initialBalance ?? 0;
      const declAmt = declaredBalance !== undefined && declaredBalance !== null ? declaredBalance : initialAmt;

      saved = await prisma.wallet.create({
        data: {
          userId: user.id,
          name,
          type,
          initialBalance: initialAmt,
          declaredBalance: declAmt,
          declaredAt: now,
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
 * Restaure un compte précédemment supprimé logiquement (soft-delete)
 */
export async function restoreWalletAction(
  id: string,
  newColor?: string,
  newType?: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'SAVINGS'
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id, deletedAt: { not: null } },
    });

    if (!wallet) {
      return { success: false, error: 'Compte supprimé introuvable' };
    }

    const colorToUse = newColor || wallet.color;

    // Vérifier conflit de couleur avec un portefeuille actif
    const colorConflict = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
        color: { equals: colorToUse, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (colorConflict) {
      return {
        success: false,
        error: `La couleur ${colorToUse} est déjà utilisée par le compte actif "${colorConflict.name}". Veuillez choisir une autre couleur pour restaurer.`,
      };
    }

    await prisma.wallet.update({
      where: { id },
      data: {
        deletedAt: null,
        color: colorToUse,
        ...(newType ? { type: newType } : {}),
      },
    });

    revalidatePath('/portefeuilles');
    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id: wallet.id },
      message: `Portefeuille "${wallet.name}" restauré avec succès. Vos règles récurrentes liées restent en pause.`,
    };
  } catch (error: unknown) {
    console.error('Erreur restoreWalletAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la restauration du compte',
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
      where: { id, userId: user.id, deletedAt: null },
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
 * Supprime de manière réversible un portefeuille (Soft-delete Sprint 2.10.0 - D10, C7)
 * Conserve intactes toutes les transactions passées et met en pause les règles récurrentes actives.
 */
export async function deleteWalletAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!wallet) {
      return { success: false, error: 'Portefeuille introuvable' };
    }

    if (wallet.isDefault) {
      return {
        success: false,
        error: 'Désignez d’abord un autre compte principal avant de supprimer celui-ci.',
      };
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isDefault: false,
        },
      }),
      prisma.recurringRule.updateMany({
        where: {
          userId: user.id,
          walletId: id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      }),
    ]);

    revalidatePath('/portefeuilles');
    revalidatePath('/');
    revalidatePath('/historique');

    return {
      success: true,
      data: { id },
      message: `Portefeuille "${wallet.name}" supprimé avec succès`,
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
 * Effectue un virement interne entre deux portefeuilles avec gestion optionnelle des frais (Sprint 2.10.0 - D9, Q11)
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

    const { sourceWalletId, targetWalletId, amount, hasFee, feeMode, feeValue, note, date } = parseResult.data;

    // Récupérer les deux portefeuilles (actifs uniquement)
    const [source, target] = await Promise.all([
      prisma.wallet.findFirst({ where: { id: sourceWalletId, userId: user.id, deletedAt: null } }),
      prisma.wallet.findFirst({ where: { id: targetWalletId, userId: user.id, deletedAt: null } }),
    ]);

    if (!source || !target) {
      return { success: false, error: 'Un des portefeuilles sélectionnés est introuvable ou supprimé' };
    }

    const txDate = date ? new Date(date) : new Date();

    // Calcul sécurisé des frais côté serveur (ADR-04)
    const computedFee =
      hasFee && feeValue && feeValue > 0
        ? computeTransferFee({ amount, mode: feeMode || 'AMOUNT', value: feeValue })
        : 0;

    // Résolution ou création de la catégorie système "Frais de transfert"
    let feeCategory: { id: string; name: string } | null = null;
    if (computedFee > 0) {
      let cat = await prisma.category.findFirst({
        where: { userId: user.id, systemKey: 'TRANSFER_FEE' },
      });

      if (!cat) {
        cat = await prisma.category.findFirst({
          where: { userId: user.id, name: { equals: 'Frais de transfert', mode: 'insensitive' } },
        });

        if (cat) {
          cat = await prisma.category.update({
            where: { id: cat.id },
            data: { systemKey: 'TRANSFER_FEE' },
          });
        } else {
          cat = await prisma.category.create({
            data: {
              userId: user.id,
              name: 'Frais de transfert',
              kind: 'EXPENSE',
              color: '#EF4444',
              systemKey: 'TRANSFER_FEE',
            },
          });
        }
      }
      feeCategory = cat;
    }

    // Persistance dans une seule transaction atomique
    const transferTx = await prisma.$transaction(async (tx) => {
      const tTx = await tx.transaction.create({
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

      if (computedFee > 0 && feeCategory) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'EXPENSE',
            amount: computedFee,
            category: feeCategory.name,
            categoryId: feeCategory.id,
            walletId: sourceWalletId,
            payment: source.name,
            note: note
              ? `Frais du virement ${source.name} -> ${target.name} (${note})`
              : `Frais du virement ${source.name} -> ${target.name}`,
            linkedTransferId: tTx.id,
            feePercent: feeMode === 'PERCENT' && feeValue ? new Prisma.Decimal(feeValue) : null,
            date: txDate,
          },
        });
      }

      return tTx;
    });

    revalidatePath('/portefeuilles');
    revalidatePath('/historique');
    revalidatePath('/');

    const feeNotice =
      computedFee > 0 ? ` (dont ${computedFee.toLocaleString('fr-FR')} FCFA de frais débités)` : '';

    return {
      success: true,
      data: { id: transferTx.id },
      message: `Virement de ${amount.toLocaleString('fr-FR')} FCFA effectué avec succès${feeNotice}`,
    };
  } catch (error: unknown) {
    console.error('Erreur transferBetweenWalletsAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’effectuer le virement',
    };
  }
}
