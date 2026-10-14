'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  RequestPasswordResetSchema,
  VerifyPasswordResetOtpSchema,
  ResetPasswordSchema,
} from '@/lib/validations';
import { getErrorMessage } from '@/lib/utils';

export const RESET_COOKIE_NAME = 'password_reset_verified';
export const RESET_COOKIE_MAX_AGE = 300; // 5 minutes

export type AuthRecoveryResponse =
  | { success: true; message: string; data?: unknown }
  | { success: false; error: string };

/**
 * Étape 1 : Demande de réinitialisation de mot de passe par e-mail
 * Règle 6 de sécurité : Réponse strictement identique que le compte existe ou non
 */
export async function requestPasswordResetAction(rawData: unknown): Promise<AuthRecoveryResponse> {
  try {
    const parseResult = RequestPasswordResetSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Adresse email invalide.',
      };
    }

    const { email } = parseResult.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate limit') || error.status === 429) {
        return {
          success: false,
          error: 'Veuillez patienter 60 secondes avant de redemander un nouveau code.',
        };
      }
    }

    // Message générique pour éviter l'énumération de comptes
    return {
      success: true,
      message: 'Si un compte est associé à cette adresse email, un code à 6 chiffres vous a été envoyé.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Une erreur est survenue lors de la demande.',
    };
  }
}

/**
 * Étape 2 : Vérification du code OTP à 6 chiffres
 */
export async function verifyPasswordResetOtpAction(rawData: unknown): Promise<AuthRecoveryResponse> {
  try {
    const parseResult = VerifyPasswordResetOtpSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Code à 6 chiffres invalide.',
      };
    }

    const { email, token } = parseResult.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (error || !data.session) {
      return {
        success: false,
        error: 'Code de vérification incorrect ou expiré. Veuillez vérifier le code ou en demander un nouveau.',
      };
    }

    // Poser un cookie httpOnly court (5 min) attestant la vérification
    const cookieStore = await cookies();
    cookieStore.set(RESET_COOKIE_NAME, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: RESET_COOKIE_MAX_AGE,
      path: '/',
    });

    return {
      success: true,
      message: 'Code vérifié avec succès.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de vérifier le code.',
    };
  }
}

/**
 * Étape 3 : Définition du nouveau mot de passe
 * Uniquement autorisé si le cookie httpOnly de vérification est présent
 */
export async function resetPasswordAction(rawData: unknown): Promise<AuthRecoveryResponse> {
  try {
    const cookieStore = await cookies();
    const verifiedEmail = cookieStore.get(RESET_COOKIE_NAME)?.value;

    if (!verifiedEmail) {
      return {
        success: false,
        error: 'Votre session de vérification a expiré ou est invalide. Veuillez recommencer la procédure.',
      };
    }

    const parseResult = ResetPasswordSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Mot de passe non conforme.',
      };
    }

    const { password } = parseResult.data;
    const supabase = await createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || 'Impossible de mettre à jour le mot de passe.',
      };
    }

    // Suppression immédiate du cookie de vérification
    cookieStore.delete(RESET_COOKIE_NAME);

    // Déconnexion de la session de récupération pour forcer une connexion propre
    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Une erreur est survenue lors de la réinitialisation.',
    };
  }
}

/**
 * Vérifie si le cookie de vérification est actif
 */
export async function checkResetSessionAction(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(RESET_COOKIE_NAME)?.value);
}
