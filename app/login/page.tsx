'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setErrorMessage(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
          return;
        }

        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        setErrorMessage(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#2563EB] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7 text-white stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Connexion
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Personal GEST TRACKER — Espace Financier Privé
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isPending}
            className="mt-2"
          >
            {isPending ? (
              'Connexion en cours...'
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                Se Connecter
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t-2 border-neutral-200 dark:border-[#334155] text-center">
          <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
            Nouveau sur GEST TRACKER ?{' '}
            <Link
              href="/register"
              className="text-[#2563EB] dark:text-[#60A5FA] hover:underline font-black inline-flex items-center gap-1 mt-1 sm:mt-0"
            >
              <span>Créer un compte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-200 dark:border-[#334155] flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Session chiffrée SSL & Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
