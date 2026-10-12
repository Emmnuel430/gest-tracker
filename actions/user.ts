'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ChangePasswordSchema } from '@/lib/validations';
import { ActionResponse } from '@/types/transaction';
import { getErrorMessage } from '@/lib/utils';

export type UserProfileResponse =
  | {
      success: true;
      data: {
        id: string;
        email: string;
        createdAt: string;
        transactionCount: number;
      };
    }
  | { success: false; error: string };

export type AccountDeleteResponse =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Récupère le profil et les statistiques du compte de l'utilisateur connecté
 */
export async function getUserProfileAction(): Promise<UserProfileResponse> {
  try {
    const user = await getAuthenticatedUser();

    const transactionCount = await prisma.transaction.count({
      where: { userId: user.id },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at || new Date().toISOString(),
        transactionCount,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de charger le profil utilisateur',
    };
  }
}

/**
 * Change le mot de passe de l'utilisateur après vérification obligatoire de l'ancien mot de passe
 */
export async function changePasswordAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    const parseResult = ChangePasswordSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Données invalides',
      };
    }

    const { oldPassword, newPassword } = parseResult.data;

    if (!user.email) {
      return {
        success: false,
        error: 'Aucune adresse email associée à votre compte.',
      };
    }

    const supabase = await createClient();

    // 1. Vérification sécurisée de l'ancien mot de passe via réauthentification
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      return {
        success: false,
        error: 'Votre mot de passe actuel est incorrect.',
      };
    }

    // 2. Mise à jour du nouveau mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || 'Impossible de mettre à jour le mot de passe.',
      };
    }

    return {
      success: true,
      data: null,
      message: 'Votre mot de passe a été modifié avec succès.',
    };
  } catch (error: unknown) {
    console.error('Erreur changePasswordAction :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la mise à jour du mot de passe',
    };
  }
}

/**
 * Supprime intégralement le compte et toutes les données associées (RGPD / Droit à l'oubli)
 */
export async function deleteAccountAction(): Promise<AccountDeleteResponse> {
  try {
    const user = await getAuthenticatedUser();

    // 1. Suppression en cascade intégrale de toutes les entités PostgreSQL de l'utilisateur
    if (prisma?.debt?.deleteMany) {
      await prisma.debt.deleteMany({ where: { userId: user.id } });
    }
    if (prisma?.recurringRule?.deleteMany) {
      await prisma.recurringRule.deleteMany({ where: { userId: user.id } });
    }
    if (prisma?.budget?.deleteMany) {
      await prisma.budget.deleteMany({ where: { userId: user.id } });
    }
    if (prisma?.transaction?.deleteMany) {
      await prisma.transaction.deleteMany({ where: { userId: user.id } });
    }
    if (prisma?.wallet?.deleteMany) {
      await prisma.wallet.deleteMany({ where: { userId: user.id } });
    }

    // 2. Déconnexion de la session Supabase
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath('/');
    revalidatePath('/historique');
    revalidatePath('/budgets');
    revalidatePath('/recurrences');
    revalidatePath('/portefeuilles');
    revalidatePath('/dettes');
    revalidatePath('/options');
    revalidatePath('/parametres');

    return {
      success: true,
      message: 'Votre compte et toutes vos données ont été définitivement supprimés.',
    };
  } catch (error: unknown) {
    console.error('Erreur suppression de compte :', error);
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la suppression de votre compte',
    };
  }
}
