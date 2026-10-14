'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  verifyPasswordResetOtpAction,
  requestPasswordResetAction,
} from '@/actions/auth-recovery';

function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  // Compte à rebours de 60 secondes pour le renvoi
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanToken = token.trim();
    if (cleanToken.length !== 6) {
      setErrorMessage('Le code doit comporter exactement 6 chiffres.');
      return;
    }

    startTransition(async () => {
      const res = await verifyPasswordResetOtpAction({
        email: email.trim().toLowerCase(),
        token: cleanToken,
      });

      if (res.success) {
        router.push('/mot-de-passe-oublie/nouveau');
      } else {
        setErrorMessage(res.error || 'Code de vérification invalide.');
      }
    });
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setIsResending(true);
    setResendMessage(null);
    setErrorMessage(null);

    const res = await requestPasswordResetAction({ email });
    setIsResending(false);

    if (res.success) {
      setResendMessage('Nouveau code envoyé avec succès.');
      setCooldown(60);
    } else {
      setErrorMessage(res.error || "Impossible d'envoyer un nouveau code.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#3B82F6] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7 text-white stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Vérification du code
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Saisissez le code à 6 chiffres reçu dans votre boîte email
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        <form onSubmit={handleVerify} className="space-y-4">
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

          <div>
            <label className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] mb-1">
              Code de vérification (6 chiffres)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setToken(val);
              }}
              placeholder="123456"
              required
              disabled={isPending}
              autoFocus
              className="w-full text-center text-2xl font-mono font-black tracking-[0.5em] py-2.5 px-3 border-2 border-[#111827] dark:border-[#334155] rounded-xl bg-neutral-50 dark:bg-[#0F172A] text-[#111827] dark:text-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 text-center font-bold">
              Le code expire dans 10 minutes
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resendMessage && (
            <div className="p-2.5 bg-[#DCFCE7] dark:bg-[#064E3B] border border-[#16A34A] rounded-lg text-xs font-bold text-[#166534] dark:text-[#86EFAC] text-center">
              {resendMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isPending || token.length !== 6 || !email}
            className="mt-2"
          >
            {isPending ? (
              'Vérification en cours...'
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>Valider le code</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Compte à rebours et renvoi du code */}
        <div className="mt-4 pt-3 border-t-2 border-neutral-200 dark:border-[#334155] text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || !email}
            className={`text-xs font-bold inline-flex items-center gap-1.5 ${
              cooldown > 0 || isResending
                ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {cooldown > 0
                ? `Renvoyer un code (${cooldown} s)`
                : isResending
                ? 'Envoi en cours...'
                : 'Renvoyer un nouveau code'}
            </span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-200 dark:border-[#334155] text-center">
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modifier l'adresse email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto py-8 text-center text-xs font-bold text-neutral-500">
          Chargement de la page de vérification...
        </div>
      }
    >
      <VerificationForm />
    </Suspense>
  );
}
