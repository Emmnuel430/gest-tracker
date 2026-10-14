'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, ArrowLeft, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '@/lib/validations';
import { resetPasswordAction } from '@/actions/auth-recovery';

export function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!strength.isValid) {
      setErrorMessage(
        'Le mot de passe ne respecte pas les critères de sécurité (8 caractères, majuscule, minuscule, chiffre, symbole).'
      );
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordAction({
        password,
        confirmPassword,
      });

      if (res.success) {
        router.push('/login?reset=success');
      } else {
        setErrorMessage(res.error || 'Impossible de réinitialiser le mot de passe.');
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#10B981] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-7 h-7 text-white stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Nouveau mot de passe
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Définissez votre nouveau mot de passe sécurisé
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8.5 text-neutral-500 hover:text-black dark:hover:text-white"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Jauge de robustesse néobrutaliste en direct */}
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <Input
              label="Confirmer le nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isPending}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-[11px] font-bold text-[#DC2626]">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bouton de soumission bloqué tant que la politique n'est pas respectée */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isPending || !strength.isValid || !passwordsMatch}
            className="mt-2"
          >
            {isPending ? (
              'Enregistrement...'
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>Enregistrer le mot de passe</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t-2 border-neutral-200 dark:border-[#334155] text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Abandonner et revenir à la connexion</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
