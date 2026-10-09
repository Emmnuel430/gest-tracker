'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

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
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Impossible de charger le profil utilisateur',
    };
  }
}

/**
 * Supprime intégralement le compte et toutes les données associées (RGPD / Droit à l'oubli)
 */
export async function deleteAccountAction(): Promise<AccountDeleteResponse> {
  try {
    const user = await getAuthenticatedUser();

    // 1. Suppression en cascade des transactions de l'utilisateur dans PostgreSQL
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    });

    // 2. Déconnexion de la session Supabase
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath('/');
    revalidatePath('/historique');
    revalidatePath('/parametres');

    return {
      success: true,
      message: 'Votre compte et toutes vos données ont été définitivement supprimés.',
    };
  } catch (error: any) {
    console.error('Erreur suppression de compte :', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de la suppression de votre compte',
    };
  }
}
