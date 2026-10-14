import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RESET_COOKIE_NAME } from '@/actions/auth-recovery';
import { NewPasswordForm } from '@/components/auth/NewPasswordForm';

export const dynamic = 'force-dynamic';

export default async function NouveauMotDePassePage() {
  const cookieStore = await cookies();
  const isVerified = Boolean(cookieStore.get(RESET_COOKIE_NAME)?.value);

  // Règle T3 : uniquement si le cookie de vérification est présent
  if (!isVerified) {
    redirect('/mot-de-passe-oublie');
  }

  return <NewPasswordForm />;
}
