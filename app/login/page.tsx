"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Veuillez renseigner votre email et mot de passe.");
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
          setErrorMessage(
            error.message === "Invalid login credentials"
              ? "Email ou mot de passe incorrect."
              : error.message,
          );
          return;
        }

        router.push("/app");
        router.refresh();
      } catch (err: unknown) {
        setErrorMessage(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      {/* Bouton retour vers l'accueil public */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 dark:text-neutral-400 hover:text-[#111827] dark:hover:text-white transition-colors p-1.5 rounded-lg border-2 border-transparent hover:border-[#111827] dark:hover:border-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#2563EB] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7 text-white stroke-3" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Connexion
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          GEST TRACKER — Espace Financier Privé
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000]">
        {resetSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-[#DCFCE7] dark:bg-[#064E3B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] text-xs font-bold text-[#166534] dark:text-[#86EFAC]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
            <span>
              Votre mot de passe a été mis à jour avec succès. Vous pouvez
              maintenant vous connecter.
            </span>
          </div>
        )}

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

          <div>
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="/mot-de-passe-oublie"
                className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

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
              "Connexion en cours..."
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
            Nouveau sur GEST TRACKER ?{" "}
            <Link
              href="/register"
              className="text-[#2563EB] dark:text-[#60A5FA] hover:underline font-black inline-flex items-center gap-1 mt-1 sm:mt-0"
            >
              <span>Créer un compte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto py-8 text-center text-xs font-bold text-neutral-500">
          Chargement de la page de connexion...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
