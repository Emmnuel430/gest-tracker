'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RegisterSchema } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // 1. Validation Zod côté client
    const validation = RegisterSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Appel Supabase Auth
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setErrorMessage('Un compte existe déjà avec cette adresse email.');
          } else if (error.message.includes('Password should be')) {
            setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
          } else {
            setErrorMessage(error.message || "Erreur lors de l'inscription.");
          }
          return;
        }

        // Si la session est immédiatement active (auto-confirm activé en dev/local)
        if (data?.session) {
          router.push('/');
          router.refresh();
          return;
        }

        // Si confirmation d'email requise par le serveur Supabase
        if (data?.user && !data?.session) {
          setSuccessInfo(
            'Votre compte a été créé avec succès ! Si la confirmation par email est activée, veuillez consulter votre boîte de réception pour valider votre compte.'
          );
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#10B981] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-7 h-7 text-white stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Créer un compte
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Personal GEST TRACKER — Vos finances sous contrôle
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        {successInfo ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-[#DCFCE7] dark:bg-[#064E3B] text-[#16A34A] rounded-xl flex items-center justify-center mx-auto border-2 border-[#111827] dark:border-[#334155]">
              <CheckCircle2 className="w-6 h-6 stroke-3" />
            </div>
            <h3 className="text-base font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
              Inscription Réussie
            </h3>
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {successInfo}
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" size="md" fullWidth>
                  Se Connecter ➔
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-bold text-[#DC2626]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                required
                autoComplete="new-password"
              />
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                8 caractères min., avec au moins 1 lettre et 1 chiffre
              </p>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] font-bold text-[#DC2626]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Confirmer le mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-[11px] font-bold text-[#DC2626]">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-[#DC2626]">
                ⚠️ {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isPending}
              className="mt-2 bg-[#10B981] hover:bg-[#059669] text-white"
            >
              {isPending ? 'Création en cours...' : 'Créer mon compte ➔'}
            </Button>
          </form>
        )}

        {!successInfo && (
          <div className="mt-5 pt-4 border-t-2 border-neutral-200 dark:border-[#334155] text-center">
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-[#2563EB] dark:text-[#60A5FA] hover:underline font-black inline-block mt-1 sm:mt-0"
              >
                Se connecter ➔
              </Link>
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-200 dark:border-[#334155] flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Données isolées et privées par utilisateur</span>
        </div>
      </div>
    </div>
  );
}
