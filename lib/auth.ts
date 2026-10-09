import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

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
