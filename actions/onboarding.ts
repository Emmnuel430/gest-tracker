'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { OnboardingSchema, OnboardingFormValues } from '@/lib/validations';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

/**
 * Récupère le statut d'onboarding de l'utilisateur authentifié
 */
export async function getOnboardingStatusAction(): Promise<ActionResponse<{ completed: boolean }>> {
  try {
    const user = await getAuthenticatedUser();
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { onboardingCompletedAt: true },
    });

    return {
      success: true,
      data: { completed: profile?.onboardingCompletedAt != null },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de vérifier le statut d’onboarding',
    };
  }
}

/**
 * Valide et enregistre la configuration initiale complète (comptes, soldes déclarés et catégories)
 * Idempotente : si l'onboarding est déjà complété, aucune modification n'est répétée.
 */
export async function completeOnboardingAction(
  payload: OnboardingFormValues
): Promise<ActionResponse<{ message: string }>> {
  try {
    const user = await getAuthenticatedUser();

    // 1. Vérification d'idempotence
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile?.onboardingCompletedAt) {
      return {
        success: true,
        data: { message: 'Onboarding déjà validé' },
      };
    }

    // 2. Validation Zod stricte
    const validation = OnboardingSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Configuration d’onboarding invalide',
        fieldErrors,
      };
    }

    const { wallets, categories } = validation.data;
    const now = new Date();

    // 3. Exécution transactionnelle atomique
    await prisma.$transaction(async (tx) => {
      // A. Création des portefeuilles sélectionnés
      for (const w of wallets) {
        await tx.wallet.create({
          data: {
            userId: user.id,
            name: w.name.trim(),
            type: w.type,
            initialBalance: 0,
            declaredBalance: w.balance,
            declaredAt: now,
            color: w.color,
            isDefault: w.isDefault,
            isArchived: false,
          },
        });
      }

      // B. Création des catégories sélectionnées
      for (const c of categories) {
        await tx.category.create({
          data: {
            userId: user.id,
            name: c.name.trim(),
            kind: c.kind,
            color: c.color,
            isArchived: false,
          },
        });
      }

      // C. Clôture de l'onboarding dans user_profiles
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          onboardingCompletedAt: now,
          updatedAt: now,
        },
        create: {
          userId: user.id,
          onboardingCompletedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      });
    });

    revalidatePath('/');
    revalidatePath('/app');
    revalidatePath('/bienvenue');
    revalidatePath('/portefeuilles');
    revalidatePath('/budgets');

    return {
      success: true,
      data: { message: 'Bienvenue sur GEST TRACKER ! Votre configuration est prête.' },
    };
  } catch (error: unknown) {
    console.error('Erreur completeOnboardingAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Une erreur est survenue lors de la configuration initiale',
    };
  }
}

/**
 * Option "Configurer plus tard" (Règle Q13 de la Roadmap) :
 * Crée 3 comptes par défaut à solde 0 (Espèces, Wave, Orange Money) et les catégories par défaut,
 * puis clôture l'onboarding pour débloquer l'accès complet immédiat.
 */
export async function skipOnboardingAction(): Promise<ActionResponse<{ message: string }>> {
  try {
    const user = await getAuthenticatedUser();

    // Idempotence
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile?.onboardingCompletedAt) {
      return {
        success: true,
        data: { message: 'Onboarding déjà complété' },
      };
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 3 comptes par défaut à 0
      const defaultWallets = [
        {
          name: 'Espèces',
          type: 'CASH' as const,
          color: '#52B788',
          isDefault: true,
        },
        {
          name: 'Wave',
          type: 'MOBILE_MONEY' as const,
          color: '#1DC4F2',
          isDefault: false,
        },
        {
          name: 'Orange Money',
          type: 'MOBILE_MONEY' as const,
          color: '#FF7900',
          isDefault: false,
        },
      ];

      for (const w of defaultWallets) {
        await tx.wallet.create({
          data: {
            userId: user.id,
            name: w.name,
            type: w.type,
            initialBalance: 0,
            declaredBalance: 0,
            declaredAt: now,
            color: w.color,
            isDefault: w.isDefault,
            isArchived: false,
          },
        });
      }

      // Catégories par défaut
      for (const c of DEFAULT_CATEGORIES) {
        await tx.category.create({
          data: {
            userId: user.id,
            name: c.name,
            kind: c.kind,
            color: c.color,
            isArchived: false,
          },
        });
      }

      // Clôture onboarding
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          onboardingCompletedAt: now,
          updatedAt: now,
        },
        create: {
          userId: user.id,
          onboardingCompletedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      });
    });

    revalidatePath('/');
    revalidatePath('/app');
    revalidatePath('/bienvenue');
    revalidatePath('/portefeuilles');
    revalidatePath('/budgets');

    return {
      success: true,
      data: { message: 'Configuration rapide appliquée avec succès' },
    };
  } catch (error: unknown) {
    console.error('Erreur skipOnboardingAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible d’appliquer la configuration rapide',
    };
  }
}
