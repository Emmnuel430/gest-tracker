import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * Vérifie si l'utilisateur a complété son parcours d'onboarding initial.
 * Renvoie true si et seulement si une ligne user_profiles existe avec onboarding_completed_at != null.
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { onboardingCompletedAt: true },
    });
    return profile?.onboardingCompletedAt != null;
  } catch (error) {
    console.error('Erreur vérification onboarding :', error);
    return false;
  }
}

/**
 * Garde de navigation pour les Server Components applicatifs :
 * Redirige vers /bienvenue si l'utilisateur connecté n'a pas encore validé son onboarding.
 */
export async function requireOnboarding(): Promise<string> {
  const user = await getAuthenticatedUser();
  const completed = await isOnboardingCompleted(user.id);
  if (!completed) {
    redirect('/bienvenue');
  }
  return user.id;
}

/**
 * Garde inverse pour la page /bienvenue :
 * Redirige vers le tableau de bord (/) si l'utilisateur a déjà terminé son onboarding.
 */
export async function redirectIfOnboardingCompleted(): Promise<string> {
  const user = await getAuthenticatedUser();
  const completed = await isOnboardingCompleted(user.id);
  if (completed) {
    redirect('/app');
  }
  return user.id;
}
