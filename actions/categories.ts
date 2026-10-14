'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { CategorySchema, CategoryFormValues } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { CategoryKind } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils';
import { CategoryItem } from '@/lib/categories';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

/**
 * Récupère les catégories de l'utilisateur avec initialisation paresseuse automatique.
 */
export async function getCategoriesAction(
  kind?: 'INCOME' | 'EXPENSE',
  options?: { includeArchived?: boolean }
): Promise<ActionResponse<CategoryItem[]>> {
  try {
    const user = await getAuthenticatedUser();

    if (!prisma?.category?.findMany) {
      return { success: true, data: [] };
    }

    let categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });

    // Initialisation paresseuse si aucune catégorie n'existe pour cet utilisateur
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          userId: user.id,
          name: cat.name,
          kind: cat.kind,
          color: cat.color,
          isArchived: false,
        })),
        skipDuplicates: true,
      });

      categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' },
      });
    }

    // Filtrage optionnel côté serveur
    let filtered = categories;
    if (!options?.includeArchived) {
      filtered = filtered.filter((c) => !c.isArchived);
    }
    if (kind) {
      filtered = filtered.filter((c) => c.kind === kind || c.kind === 'BOTH');
    }

    return {
      success: true,
      data: filtered.map((c) => ({
        id: c.id,
        userId: c.userId,
        name: c.name,
        kind: c.kind,
        color: c.color,
        isArchived: c.isArchived,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Crée ou met à jour une catégorie avec contrôle de cohérence et propagation de renommage.
 */
export async function upsertCategoryAction(
  values: CategoryFormValues
): Promise<ActionResponse<CategoryItem>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = CategorySchema.parse(values);

    if (validated.id) {
      // Édition
      const existing = await prisma.category.findUnique({
        where: { id: validated.id },
      });

      if (!existing || existing.userId !== user.id) {
        return { success: false, error: 'Catégorie introuvable ou non autorisée' };
      }

      // Vérification d'unicité du nom (si modifié)
      if (existing.name !== validated.name) {
        const duplicate = await prisma.category.findFirst({
          where: {
            userId: user.id,
            name: { equals: validated.name, mode: 'insensitive' },
            id: { not: existing.id },
          },
        });
        if (duplicate) {
          return { success: false, error: 'Une catégorie portant ce nom existe déjà' };
        }
      }

      // Vérification de compatibilité du kind en cas de restriction
      if (validated.kind === 'EXPENSE' && (existing.kind === 'INCOME' || existing.kind === 'BOTH')) {
        const incomeCount = await prisma.transaction.count({
          where: {
            userId: user.id,
            type: 'INCOME',
            OR: [{ categoryId: existing.id }, { category: existing.name }],
          },
        });
        if (incomeCount > 0) {
          return {
            success: false,
            error: 'Impossible de restreindre cette catégorie aux dépenses : des revenus existants y sont associés.',
          };
        }
      }

      if (validated.kind === 'INCOME' && (existing.kind === 'EXPENSE' || existing.kind === 'BOTH')) {
        const expenseCount = await prisma.transaction.count({
          where: {
            userId: user.id,
            type: 'EXPENSE',
            OR: [{ categoryId: existing.id }, { category: existing.name }],
          },
        });
        const budgetCount = await prisma.budget.count({
          where: {
            userId: user.id,
            OR: [{ categoryId: existing.id }, { category: existing.name }],
          },
        });
        if (expenseCount > 0 || budgetCount > 0) {
          return {
            success: false,
            error: 'Impossible de restreindre cette catégorie aux revenus : des dépenses ou budgets existants y sont associés.',
          };
        }
      }

      // Vérification d'unicité de la couleur (insensible à la casse)
      const duplicateColor = await prisma.category.findFirst({
        where: {
          userId: user.id,
          color: { equals: validated.color, mode: 'insensitive' },
          id: { not: existing.id },
        },
      });
      if (duplicateColor) {
        return {
          success: false,
          error: `Cette couleur est déjà attribuée à la catégorie "${duplicateColor.name}". Veuillez choisir une autre couleur.`,
        };
      }

      // Mise à jour transactionnelle avec propagation de renommage
      const updated = await prisma.$transaction(async (tx) => {
        const cat = await tx.category.update({
          where: { id: existing.id },
          data: {
            name: validated.name,
            kind: validated.kind,
            color: validated.color,
          },
        });

        // Propagation du libellé synchronisé si le nom change
        if (existing.name !== validated.name) {
          await tx.transaction.updateMany({
            where: {
              userId: user.id,
              OR: [{ categoryId: existing.id }, { category: existing.name }],
            },
            data: { category: validated.name, categoryId: existing.id },
          });

          await tx.budget.updateMany({
            where: {
              userId: user.id,
              OR: [{ categoryId: existing.id }, { category: existing.name }],
            },
            data: { category: validated.name, categoryId: existing.id },
          });

          await tx.recurringRule.updateMany({
            where: {
              userId: user.id,
              OR: [{ categoryId: existing.id }, { category: existing.name }],
            },
            data: { category: validated.name, categoryId: existing.id },
          });
        }

        return cat;
      });

      revalidateCategoryPaths();
      return { success: true, data: updated };
    } else {
      // Création
      const duplicate = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: { equals: validated.name, mode: 'insensitive' },
        },
      });

      if (duplicate) {
        return { success: false, error: 'Une catégorie portant ce nom existe déjà' };
      }

      // Vérification d'unicité de la couleur
      const duplicateColor = await prisma.category.findFirst({
        where: {
          userId: user.id,
          color: { equals: validated.color, mode: 'insensitive' },
        },
      });

      if (duplicateColor) {
        return {
          success: false,
          error: `Cette couleur est déjà attribuée à la catégorie "${duplicateColor.name}". Veuillez choisir une autre couleur.`,
        };
      }

      const created = await prisma.category.create({
        data: {
          userId: user.id,
          name: validated.name,
          kind: validated.kind,
          color: validated.color,
          isArchived: false,
        },
      });

      revalidateCategoryPaths();
      return { success: true, data: created };
    }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Archive ou désarchive une catégorie (la masque des formulaires sans altérer l'historique).
 */
export async function archiveCategoryAction(
  id: string,
  isArchived: boolean = true
): Promise<ActionResponse<{ id: string; isArchived: boolean }>> {
  try {
    const user = await getAuthenticatedUser();

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Catégorie introuvable ou non autorisée' };
    }

    await prisma.category.update({
      where: { id },
      data: { isArchived },
    });

    revalidateCategoryPaths();
    return { success: true, data: { id, isArchived } };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Supprime définitivement une catégorie si et seulement si aucune transaction, budget ou règle n'y est rattaché.
 */
export async function deleteCategoryAction(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Catégorie introuvable ou non autorisée' };
    }

    // Vérification stricte des dépendances
    const [txCount, budgetCount, ruleCount] = await Promise.all([
      prisma.transaction.count({
        where: {
          userId: user.id,
          OR: [{ categoryId: id }, { category: existing.name }],
        },
      }),
      prisma.budget.count({
        where: {
          userId: user.id,
          OR: [{ categoryId: id }, { category: existing.name }],
        },
      }),
      prisma.recurringRule.count({
        where: {
          userId: user.id,
          OR: [{ categoryId: id }, { category: existing.name }],
        },
      }),
    ]);

    const totalUsage = txCount + budgetCount + ruleCount;
    if (totalUsage > 0) {
      return {
        success: false,
        error: `Cette catégorie est utilisée par ${totalUsage} élément(s) (opérations, budgets ou règles). Vous pouvez l'archiver pour ne plus la proposer sans corrompre votre historique.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidateCategoryPaths();
    return { success: true, data: { id } };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

function revalidateCategoryPaths() {
  revalidatePath('/budgets');
  revalidatePath('/historique');
  revalidatePath('/entrant');
  revalidatePath('/sortant');
  revalidatePath('/recurrences');
  revalidatePath('/gestion');
  revalidatePath('/');
}
