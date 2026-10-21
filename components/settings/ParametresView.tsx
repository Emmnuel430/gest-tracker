"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  KeyRound,
  FileJson,
  FileSpreadsheet,
  Printer,
  Trash2,
  AlertTriangle,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Eye,
  EyeOff,
  ShieldCheck,
  Palette,
  ArrowRight,
  X,
  Download,
} from "lucide-react";
import {
  getUserProfileAction,
  deleteAccountAction,
  changePasswordAction,
} from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import { Theme, getStoredTheme, setStoredTheme, applyTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDisplayDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { evaluatePasswordStrength } from "@/lib/validations";

export function ParametresView() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Profil
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    createdAt: string;
    transactionCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thème
  const [currentTheme, setCurrentTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Déconnexion
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Changement de mot de passe
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // Suppression de compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(getStoredTheme());

    getUserProfileAction().then((res) => {
      setLoading(false);
      if (res.success) {
        setProfile(res.data);
      } else {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const handleSelectTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setStoredTheme(theme);
    applyTheme(theme);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowLogoutConfirm(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    setPwLoading(true);

    const res = await changePasswordAction({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    setPwLoading(false);

    if (res.success) {
      setPwSuccess(res.message || "Mot de passe modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordFormOpen(false);
    } else {
      setPwError(res.error || "Erreur lors de la modification du mot de passe");
    }
  };

  const handleDeleteAccount = async () => {
    setDeletePending(true);
    startTransition(async () => {
      const res = await deleteAccountAction();
      setDeletePending(false);
      setShowDeleteConfirm(false);

      if (res.success) {
        router.push("/login");
        router.refresh();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Accueil</span>
        </Link>
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          Paramètres & Compte
        </span>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Paramètres du Compte
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Sécurité, personnalisation de l'affichage et gestion intégrale de vos
          données
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] text-xs font-bold text-[#DC2626]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {pwSuccess && (
        <div className="p-3 bg-[#DCFCE7] dark:bg-[#064E3B] border-2 border-[#111827] dark:border-white rounded-xl shadow-[3px_3px_0px_0px_#111827] text-xs font-black text-[#16A34A] dark:text-[#86EFAC] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{pwSuccess}</span>
        </div>
      )}

      {/* 1. Carte Profil & Identité de session */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#2563EB] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <User className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Identité de session
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Espace sécurisé et gestion des identifiants
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs font-bold text-neutral-500 animate-pulse">
            Chargement des informations du profil...
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">
                Email :
              </span>
              <span className="font-black text-[#111827] dark:text-[#F8FAFC] truncate max-w-55">
                {profile.email}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">
                Opérations enregistrées :
              </span>
              <span className="font-black px-2 py-0.5 bg-[#DCFCE7] dark:bg-[#064E3B] text-[#16A34A] dark:text-[#86EFAC] rounded border border-[#111827] dark:border-transparent text-[11px]">
                {profile.transactionCount} transactions
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">
                Date d'inscription :
              </span>
              <span className="font-bold text-[#111827] dark:text-[#F8FAFC]">
                {formatDisplayDate(profile.createdAt, "dd MMMM yyyy")}
              </span>
            </div>

            {/* Sous-section : Modification du mot de passe */}
            <div className="pt-2 border-t-2 border-neutral-200 dark:border-[#334155]">
              {!isPasswordFormOpen ? (
                <button
                  type="button"
                  onClick={() => setIsPasswordFormOpen(true)}
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#0F172A] hover:bg-neutral-50 dark:hover:bg-neutral-800 border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#2563EB]" />
                    <span>Modifier mon mot de passe</span>
                  </div>
                  <span className="text-[11px] text-[#2563EB] font-bold inline-flex items-center gap-1">
                    <span>Ouvrir</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                        Changer le mot de passe
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPasswordFormOpen(false);
                        setPwError(null);
                      }}
                      className="text-[11px] font-bold text-neutral-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
                    >
                      <span>Fermer</span>
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {pwError && (
                    <div className="flex items-center gap-1.5 p-2 bg-[#FEF2F2] dark:bg-[#2C0B0E] border border-[#DC2626] rounded text-[11px] font-bold text-[#DC2626]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                      Ancien mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="Votre mot de passe actuel"
                        className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Nouveau mot de passe sécurisé"
                      className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    <PasswordStrengthMeter password={newPassword} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Retapez le nouveau mot de passe"
                      className="w-full px-3 py-2 text-xs font-bold border-2 border-[#111827] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    >
                      {showPasswords ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>{showPasswords ? "Masquer" : "Afficher"}</span>
                    </button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={
                        pwLoading ||
                        !evaluatePasswordStrength(newPassword).isValid ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        !oldPassword
                      }
                      className="text-xs"
                    >
                      {pwLoading
                        ? "Mise à jour..."
                        : "Sauvegarder le mot de passe"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {/* 2. Carte Apparence & Mode d'affichage (Clair / Sombre / Système) */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#7C3AED] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <Palette className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Apparence & Thème
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Personnalisez le style visuel de l'application
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Clair */}
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center select-none",
              currentTheme === "light"
                ? "bg-[#FEF3C7] border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-0.5"
                : "bg-white dark:bg-[#0F172A] border-neutral-300 dark:border-[#334155] hover:border-[#111827]",
            )}
          >
            <Sun className="w-6 h-6 text-[#D97706] mb-1.5 stroke-[2.5]" />
            <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
              Clair
            </span>
            {currentTheme === "light" && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#F59E0B] text-black rounded mt-1">
                Actif
              </span>
            )}
          </button>

          {/* Sombre */}
          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center select-none",
              currentTheme === "dark"
                ? "bg-[#1E293B] border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-0.5"
                : "bg-white dark:bg-[#0F172A] border-neutral-300 dark:border-[#334155] hover:border-[#111827]",
            )}
          >
            <Moon className="w-6 h-6 text-[#38BDF8] mb-1.5 stroke-[2.5]" />
            <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
              Sombre
            </span>
            {currentTheme === "dark" && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#38BDF8] text-black rounded mt-1">
                Actif
              </span>
            )}
          </button>

          {/* Système */}
          <button
            type="button"
            onClick={() => handleSelectTheme("system")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center select-none",
              currentTheme === "system"
                ? "bg-[#DBEAFE] dark:bg-[#1E3A8A] border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-0.5"
                : "bg-white dark:bg-[#0F172A] border-neutral-300 dark:border-[#334155] hover:border-[#111827]",
            )}
          >
            <Laptop className="w-6 h-6 text-[#2563EB] dark:text-[#93C5FD] mb-1.5 stroke-[2.5]" />
            <span className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
              Système
            </span>
            {currentTheme === "system" && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#2563EB] text-white rounded mt-1">
                Actif
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* 3. Carte Sauvegarde & Exportation Complète */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#10B981] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <Download className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Sauvegarde & Export Intégral
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Téléchargez l'intégralité de vos opérations financières
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Export JSON */}
          <a
            href="/api/user/export"
            download
            className="w-full flex items-center justify-between p-3.5 bg-[#ECFDF5] dark:bg-[#064E3B]/40 hover:bg-[#D1FAE5] dark:hover:bg-[#064E3B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <FileJson className="w-5 h-5 text-[#059669] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Sauvegarde Complète (JSON)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Format standard avec métadonnées de dates et devises
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#059669] inline-flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> JSON
            </span>
          </a>

          {/* Export CSV */}
          <a
            href="/api/export/csv?period=year"
            download
            className="w-full flex items-center justify-between p-3.5 bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A8A] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-[#2563EB] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Tableur Excel / CSV (Année)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Encodage UTF-8 avec séparateurs point-virgule
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#2563EB] inline-flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> CSV
            </span>
          </a>

          {/* Export PDF */}
          <a
            href="/api/export/pdf?period=month"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 bg-[#FFFBEB] dark:bg-[#78350F]/40 hover:bg-[#FEF3C7] dark:hover:bg-[#78350F] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-[#D97706] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Rapport Imprimable (PDF A4)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Mise en page haute fidélité pour impression
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#D97706] inline-flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </span>
          </a>
        </div>
      </Card>

      {/* 4. Carte Session & Déconnexion */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#EA580C] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <LogOut className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Session de Travail
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Déconnexion sécurisée de votre compte
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
          Pour des raisons de confidentialité, déconnectez-vous si vous utilisez
          un appareil public ou partagé.
        </p>

        <Button
          type="button"
          variant="neutral"
          size="md"
          fullWidth
          disabled={isLoggingOut}
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 border-2 border-[#111827] dark:border-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#FFFFFF] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#EA580C] hover:text-[#FFF7ED] dark:bg-amber-950 dark:text-orange-400 dark:hover:bg-orange-600 dark:hover:text-white"
        >
          <LogOut className="w-4 h-4 stroke-2.5" />
          <span>Se déconnecter de la session</span>
        </Button>
      </Card>

      {/* 5. Carte Zone de Danger — Suppression de Compte */}
      <div className="bg-[#FEF2F2] dark:bg-[#2C0B0E] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000]">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-[#FECACA] dark:border-[#7F1D1D]">
          <div className="w-10 h-10 bg-[#DC2626] text-white border-2 border-[#111827] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <AlertTriangle className="w-5 h-5 stroke-3 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#DC2626] dark:text-[#F87171]">
              Zone de Danger — Suppression du Compte
            </h2>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
              Droit à l'oubli et effacement définitif (RGPD)
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          La suppression de votre compte effacera immédiatement et
          irréversiblement l'ensemble de vos transactions, catégories, budgets,
          règles et portefeuilles enregistrés sur GEST TRACKER.
        </p>

        <Button
          type="button"
          variant="danger"
          size="md"
          fullWidth
          disabled={deletePending || isPending}
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer définitivement mon compte et mes données</span>
        </Button>
      </div>

      {/* Boîte de confirmation de déconnexion */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Se déconnecter de votre session ?"
        message="Voulez-vous vraiment vous déconnecter de GEST TRACKER ? Vous pourrez vous reconnecter à tout moment avec votre mot de passe."
        confirmLabel="Se Déconnecter"
        cancelLabel="Rester connecté"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Boîte de confirmation de suppression renforcée */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer définitivement votre compte ?"
        message="Cette action est irréversible. Toutes vos opérations, devises, budgets et créances seront définitivement purgés."
        confirmLabel="Oui, supprimer mon compte"
        cancelLabel="Annuler"
        requiredConfirmationText="Supprimer mon compte"
        isLoading={deletePending}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
