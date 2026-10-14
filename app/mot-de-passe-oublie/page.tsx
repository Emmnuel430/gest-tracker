'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, ArrowLeft, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestPasswordResetAction } from '@/actions/auth-recovery';

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordResetAction({ email });

      if (res.success) {
        setSuccessMessage(res.message || 'Un code de vérification vous a été envoyé.');
      } else {
        setErrorMessage(res.error || "Une erreur est survenue lors de l'envoi du code.");
      }
    });
  };

  const handleProceedToVerification = () => {
    router.push(`/mot-de-passe-oublie/verification?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#FFE600] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-7 h-7 text-[#111827] stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Mot de passe oublié
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Recevez un code à 6 chiffres pour réinitialiser votre accès
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              disabled={isPending}
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
              disabled={isPending || !email}
              className="mt-2"
            >
              {isPending ? (
                'Envoi du code...'
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>Envoyer le code</span>
                </span>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-[#DCFCE7] dark:bg-[#064E3B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] text-xs font-bold text-[#166534] dark:text-[#86EFAC]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#16A34A]" />
              <div className="space-y-1">
                <p className="font-black uppercase tracking-tight">Code envoyé</p>
                <p className="font-medium text-[11px] leading-relaxed">{successMessage}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedToVerification}
              className="mt-2"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>Saisir le code</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t-2 border-neutral-200 dark:border-[#334155] text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
