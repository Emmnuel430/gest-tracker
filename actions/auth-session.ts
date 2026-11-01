'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { LoginSchema } from '@/lib/validations';
import {
  SESSION_COOKIE_NAME,
  encodeSignedSession,
  decodeAndVerifySession,
  evaluateSessionPolicy,
  REMEMBER_ME_MAX_AGE_MS,
} from '@/lib/session-policy';
import { getErrorMessage } from '@/lib/utils';

export type AuthSessionResponse =
  | { success: true; message?: string }
  | { success: false; error: string };

/**
 * Server Action de connexion avec politique de session
 * - Connexion via Supabase Auth
 * - Émission du cookie signé gt_session (inactivité 15 min ou persistance 30 jours)
 */
export async function signInAction(rawData: unknown): Promise<AuthSessionResponse> {
  try {
    const parseResult = LoginSchema.safeParse(rawData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Identifiants invalides.',
      };
    }

    const { email, password, rememberMe } = parseResult.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error:
          error?.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : error?.message || 'Identifiants incorrects.',
      };
    }

    // Émission du jeton de session signé
    const now = Date.now();
    const token = await encodeSignedSession({
      userId: data.user.id,
      remember: !!rememberMe,
      issuedAt: now,
      lastActivityAt: now,
    });

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    if (rememberMe) {
      // 30 jours
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(REMEMBER_ME_MAX_AGE_MS / 1000),
      });
    } else {
      // Session du navigateur (supprimé à la fermeture)
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
      });
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Une erreur est survenue lors de la connexion.',
    };
  }
}

/**
 * Déconnexion explicite : invalide la session Supabase et purge le cookie gt_session
 */
export async function signOutAction(): Promise<AuthSessionResponse> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: 'local' });

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Erreur lors de la déconnexion.',
    };
  }
}

/**
 * Enregistre un ping d'activité depuis le client pour prolonger la session glissante
 */
export async function recordSessionActivityAction(): Promise<AuthSessionResponse> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!tokenCookie?.value) {
      return { success: false, error: 'SESSION_ABSENTE' };
    }

    const session = await decodeAndVerifySession(tokenCookie.value);
    if (!session) {
      return { success: false, error: 'SESSION_INVALIDE' };
    }

    const evaluation = evaluateSessionPolicy(session);
    if (evaluation === 'EXPIRED_IDLE' || evaluation === 'EXPIRED_MAX_AGE') {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return { success: false, error: evaluation };
    }

    // Mise à jour de la dernière activité
    const now = Date.now();
    const updatedToken = await encodeSignedSession({
      ...session,
      lastActivityAt: now,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    if (session.remember) {
      const remainingSeconds = Math.max(
        0,
        Math.floor((session.issuedAt + REMEMBER_ME_MAX_AGE_MS - now) / 1000)
      );
      cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: remainingSeconds,
      });
    } else {
      cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
      });
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error) || 'Impossible de mettre à jour la session.',
    };
  }
}
