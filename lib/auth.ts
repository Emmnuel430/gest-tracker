import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import {
  SESSION_COOKIE_NAME,
  decodeAndVerifySession,
  evaluateSessionPolicy,
} from '@/lib/session-policy';

/**
 * Récupère de manière sécurisée l'utilisateur actuellement authentifié depuis les cookies côté serveur.
 * Lève une erreur explicite si la session est inexistante ou invalide.
 */
export async function getAuthenticatedUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('NON_AUTHENTIFIE: Vous devez être connecté pour effectuer cette action.');
  }

  // Vérification de la politique de session (inactivité 15 min ou 30 jours max)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const session = await decodeAndVerifySession(token);
      if (session) {
        const evaluation = evaluateSessionPolicy(session);
        if (evaluation === 'EXPIRED_IDLE' || evaluation === 'EXPIRED_MAX_AGE') {
          throw new Error('SESSION_EXPIREE: Votre session a expiré. Veuillez vous reconnecter.');
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('SESSION_EXPIREE')) {
      throw err;
    }
    // Erreur de cookieStore ignorée si indisponible dans certains contextes
  }

  return user;
}

/**
 * Récupère l'utilisateur actuel s'il existe, sans lever d'erreur (lecture facultative).
 */
export async function getOptionalUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}
