'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('emmanueldaho859@gmail.com');
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
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Identifiants incorrects.');
          return;
        }

        router.push('/');
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err.message || 'Erreur de connexion');
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#FFDE59] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Accès Privé
        </h1>
        <p className="text-xs font-bold text-neutral-600 mt-1">
          Personal GEST TRACKER — Inscription fermée
        </p>
      </div>

      <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {errorMessage && (
            <div className="p-3 bg-[#FFEAEB] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-[#FF3847]">
              ⚠️ {errorMessage}
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
            {isPending ? 'Connexion en cours...' : 'Se Connecter ➔'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-neutral-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-[#00DF81]" />
          <span>Session chiffrée SSL & Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
